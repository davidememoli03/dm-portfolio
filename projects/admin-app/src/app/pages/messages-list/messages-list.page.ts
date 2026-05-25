import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AdminApiService } from '../../api/admin-api.service';
import {
  MESSAGE_STATUSES,
  MessageStatus,
  MessageSummary,
  MessagesListResponse,
} from '../../models/message.models';

type Filter = 'all' | MessageStatus;
const FILTERS: Filter[] = ['all', ...MESSAGE_STATUSES];

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  new: 'New',
  read: 'Read',
  archived: 'Archived',
  spam: 'Spam',
};

const STATUS_DOT: Record<MessageStatus, string> = {
  new: 'bg-emerald-500',
  read: 'bg-sky-500',
  archived: 'bg-slate-400',
  spam: 'bg-red-500',
};

@Component({
  selector: 'admin-messages-list-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="py-8">
      <header class="mb-6">
        <span class="text-eyebrow text-[var(--color-accent)]">Inbox</span>
        <h1 class="text-headline mt-2 text-[var(--color-text)]">Messages</h1>
        <p class="mt-2 text-sm text-[var(--color-text-muted)]">
          {{ totalLabel() }}
        </p>
      </header>

      <div class="glass mb-6 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-1" role="tablist">
          @for (filter of filters; track filter) {
            @let active = filter === currentFilter();
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="active"
              [class]="
                active
                  ? 'rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-fg)]'
                  : 'rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text)]'
              "
              (click)="setFilter(filter)"
            >
              {{ labels[filter] }}
            </button>
          }
        </div>

        <input
          type="search"
          [formControl]="searchControl"
          placeholder="Search by name, email or content..."
          class="w-full rounded-full border border-[var(--color-surface-glass-border)] bg-[var(--color-surface-glass)] px-4 py-1.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none sm:max-w-xs"
        />
      </div>

      @if (loading()) {
        <div class="grid gap-3">
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <div class="glass h-24 animate-pulse rounded-2xl"></div>
          }
        </div>
      } @else if (errored()) {
        <div class="glass rounded-2xl p-6 text-center" role="alert">
          <p class="font-medium text-[var(--color-text)]">Could not load messages.</p>
          <button
            type="button"
            (click)="reload()"
            class="mt-3 inline-flex min-h-[36px] items-center rounded-full border border-[var(--color-surface-glass-border)] px-4 py-1.5 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]"
          >
            Try again
          </button>
        </div>
      } @else if (items().length === 0) {
        <div class="glass rounded-2xl p-10 text-center">
          <p class="font-medium text-[var(--color-text)]">No messages yet.</p>
          <p class="mt-1 text-sm text-[var(--color-text-muted)]">
            New messages from the portfolio contact form will appear here.
          </p>
        </div>
      } @else {
        <ul class="grid gap-3">
          @for (item of items(); track item.id) {
            <li>
              <a
                [routerLink]="['/messages', item.id]"
                class="glass block rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glass-strong)]"
                [class.font-medium]="item.status === 'new'"
              >
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="inline-block h-2 w-2 shrink-0 rounded-full {{ statusDot[item.status] }}" aria-hidden="true"></span>
                      <h2 class="truncate text-base font-semibold text-[var(--color-text)]">
                        {{ item.name }}
                      </h2>
                      <span class="truncate text-xs text-[var(--color-text-subtle)]">
                        &lt;{{ item.email }}&gt;
                      </span>
                    </div>
                    @if (item.subject) {
                      <p class="mt-1 truncate text-sm text-[var(--color-text-muted)]">
                        {{ item.subject }}
                      </p>
                    }
                  </div>
                  <time
                    class="shrink-0 text-xs text-[var(--color-text-subtle)]"
                    [attr.datetime]="item.createdAt"
                  >
                    {{ formatDate(item.createdAt) }}
                  </time>
                </div>
                <p class="mt-3 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                  {{ item.preview }}
                </p>
              </a>
            </li>
          }
        </ul>

        @if (totalPages() > 1) {
          <nav class="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
            <button
              type="button"
              class="action-btn action-btn-ghost"
              [disabled]="page() <= 1"
              (click)="setPage(page() - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-[var(--color-text-muted)]">
              Page {{ page() }} of {{ totalPages() }}
            </span>
            <button
              type="button"
              class="action-btn action-btn-ghost"
              [disabled]="page() >= totalPages()"
              (click)="setPage(page() + 1)"
            >
              Next
            </button>
          </nav>
        }
      }
    </section>
  `,
})
export class MessagesListPage {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);

  readonly filters = FILTERS;
  readonly labels = FILTER_LABELS;
  readonly statusDot = STATUS_DOT;

  readonly items = signal<MessageSummary[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly currentFilter = signal<Filter>('all');
  readonly loading = signal(true);
  readonly errored = signal(false);

  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  private readonly searchSignal = signal<string>('');

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly totalLabel = computed(() => {
    const t = this.total();
    if (t === 0) return 'No messages';
    if (t === 1) return '1 message';
    return `${t} messages`;
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((value) => {
        this.searchSignal.set(value.trim());
        this.page.set(1);
        this.load();
      });

    this.load();
  }

  setFilter(filter: Filter): void {
    if (filter === this.currentFilter()) return;
    this.currentFilter.set(filter);
    this.page.set(1);
    this.load();
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.load();
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.errored.set(false);

    const filter = this.currentFilter();
    this.api
      .listMessages({
        status: filter === 'all' ? undefined : filter,
        search: this.searchSignal() || undefined,
        page: this.page(),
        pageSize: this.pageSize(),
      })
      .subscribe({
        next: (res: MessagesListResponse) => {
          this.items.set(res.items);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => {
          this.errored.set(true);
          this.loading.set(false);
        },
      });
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
