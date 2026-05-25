import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AdminApiService } from '../../api/admin-api.service';
import { MessageDetail, MessageStatus } from '../../models/message.models';

const STATUS_LABEL: Record<MessageStatus, string> = {
  new: 'New',
  read: 'Read',
  archived: 'Archived',
  spam: 'Spam',
};

@Component({
  selector: 'admin-message-detail-page',
  imports: [RouterLink],
  template: `
    <section class="py-8">
      <div class="mb-6 flex items-center gap-2">
        <a
          routerLink="/messages"
          class="glass inline-flex min-h-[36px] items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to inbox
        </a>
      </div>

      @if (loading()) {
        <div class="glass h-64 animate-pulse rounded-2xl"></div>
      } @else if (errored()) {
        <div class="glass rounded-2xl p-6 text-center" role="alert">
          <p class="font-medium text-[var(--color-text)]">Could not load this message.</p>
          <button
            type="button"
            (click)="reload()"
            class="mt-3 inline-flex min-h-[36px] items-center rounded-full border border-[var(--color-surface-glass-border)] px-4 py-1.5 text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]"
          >
            Try again
          </button>
        </div>
      } @else if (message(); as msg) {
        <article class="glass-strong rounded-3xl">
          <header class="border-b border-[var(--color-surface-glass-border)] px-6 py-5 sm:px-8">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <h1 class="truncate text-lg font-semibold text-[var(--color-text)] sm:text-xl">
                  {{ msg.name }}
                </h1>
                <a
                  [href]="'mailto:' + msg.email"
                  class="break-all text-sm text-[var(--color-accent)] hover:underline"
                >
                  {{ msg.email }}
                </a>
                @if (msg.subject) {
                  <p class="mt-1 text-sm text-[var(--color-text-muted)]">
                    {{ msg.subject }}
                  </p>
                }
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
                  {{ statusLabel[msg.status] }}
                </span>
                <time class="text-xs text-[var(--color-text-subtle)]" [attr.datetime]="msg.createdAt">
                  {{ formatDate(msg.createdAt) }}
                </time>
                <span class="text-xs text-[var(--color-text-subtle)]">
                  Locale: {{ msg.locale }}
                </span>
              </div>
            </div>
          </header>

          <div class="px-6 py-6 sm:px-8">
            <pre class="whitespace-pre-wrap break-words font-sans text-base leading-relaxed text-[var(--color-text)]">{{ msg.message }}</pre>
          </div>

          <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-surface-glass-border)] px-6 py-4 sm:px-8">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="action-btn action-btn-ghost"
                (click)="copyEmail(msg.email)"
              >
                {{ copyState() === 'copied' ? 'Copied!' : 'Copy email' }}
              </button>
              <a
                class="action-btn action-btn-primary"
                [href]="mailtoLink(msg)"
              >
                Reply via mail client
              </a>
            </div>

            <div class="flex flex-wrap gap-2">
              @if (msg.status !== 'new') {
                <button
                  type="button"
                  class="action-btn action-btn-ghost"
                  [disabled]="acting()"
                  (click)="setStatus('new')"
                >
                  Mark unread
                </button>
              }
              @if (msg.status !== 'archived') {
                <button
                  type="button"
                  class="action-btn action-btn-ghost"
                  [disabled]="acting()"
                  (click)="setStatus('archived')"
                >
                  Archive
                </button>
              }
              @if (msg.status !== 'spam') {
                <button
                  type="button"
                  class="action-btn action-btn-ghost"
                  [disabled]="acting()"
                  (click)="setStatus('spam')"
                >
                  Spam
                </button>
              }
              <button
                type="button"
                class="action-btn action-btn-danger"
                [disabled]="acting()"
                (click)="remove()"
              >
                Delete
              </button>
            </div>
          </footer>
        </article>
      }
    </section>
  `,
})
export class MessageDetailPage {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  readonly statusLabel = STATUS_LABEL;

  readonly message = signal<MessageDetail | null>(null);
  readonly loading = signal(true);
  readonly errored = signal(false);
  readonly acting = signal(false);
  readonly copyState = signal<'idle' | 'copied'>('idle');

  constructor() {
    queueMicrotask(() => this.load());
  }

  reload(): void {
    this.load();
  }

  setStatus(status: MessageStatus): void {
    const msg = this.message();
    if (!msg || this.acting()) return;
    this.acting.set(true);
    this.api.updateMessageStatus(msg.id, status).subscribe({
      next: (updated) => {
        this.message.set(updated);
        this.acting.set(false);
      },
      error: () => this.acting.set(false),
    });
  }

  remove(): void {
    const msg = this.message();
    if (!msg || this.acting()) return;
    if (!confirm('Delete this message permanently?')) return;
    this.acting.set(true);
    this.api.deleteMessage(msg.id).subscribe({
      next: () => this.router.navigate(['/messages']),
      error: () => this.acting.set(false),
    });
  }

  copyEmail(email: string): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(email).then(() => {
      this.copyState.set('copied');
      setTimeout(() => this.copyState.set('idle'), 2000);
    });
  }

  mailtoLink(message: MessageDetail): string {
    const subject = message.subject ? `Re: ${message.subject}` : 'Re: your message';
    return `mailto:${message.email}?subject=${encodeURIComponent(subject)}`;
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private load(): void {
    const id = this.id();
    if (!id) {
      this.errored.set(true);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.errored.set(false);
    this.api.getMessage(id).subscribe({
      next: (msg) => {
        this.message.set(msg);
        this.loading.set(false);
      },
      error: () => {
        this.errored.set(true);
        this.loading.set(false);
      },
    });
  }
}
