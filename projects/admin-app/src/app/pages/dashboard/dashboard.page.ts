import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminApiService } from '../../api/admin-api.service';
import { BarChartComponent } from '../../components/charts/bar-chart.component';
import { DonutChartComponent } from '../../components/charts/donut-chart.component';
import { LineAreaChartComponent } from '../../components/charts/line-area-chart.component';
import { ChartPoint, ChartSegment, shortDayLabel } from '../../components/charts/chart.utils';
import { DashboardOverview } from '../../models/dashboard.models';
import { MessageStatus } from '../../models/message.models';

const PERIOD_OPTIONS = [7, 30, 90] as const;

const STATUS_LABELS: Record<MessageStatus, string> = {
  new: 'New',
  read: 'Read',
  archived: 'Archived',
  spam: 'Spam',
};

const STATUS_COLORS: Record<MessageStatus, string> = {
  new: '#10b981',
  read: '#0ea5e9',
  archived: '#94a3b8',
  spam: '#ef4444',
};

const STATUS_DOT: Record<MessageStatus, string> = {
  new: 'bg-emerald-500',
  read: 'bg-sky-500',
  archived: 'bg-slate-400',
  spam: 'bg-red-500',
};

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#6366f1',
  mobile: '#f59e0b',
  tablet: '#14b8a6',
  unknown: '#64748b',
};

@Component({
  selector: 'admin-dashboard-page',
  imports: [DatePipe, RouterLink, LineAreaChartComponent, DonutChartComponent, BarChartComponent],
  template: `
    <section class="py-8">
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span class="text-eyebrow text-[var(--color-accent)]">Overview</span>
          <h1 class="text-headline mt-2 text-[var(--color-text)]">Dashboard</h1>
          <p class="mt-2 text-sm text-[var(--color-text-muted)]">
            Messages, traffic and portfolio activity at a glance.
          </p>
        </div>

        <div class="flex flex-wrap gap-1" role="tablist" aria-label="Period">
          @for (option of periodOptions; track option) {
            @let active = option === days();
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="active"
              [class]="
                active
                  ? 'rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-fg)]'
                  : 'rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text)]'
              "
              (click)="setDays(option)"
            >
              {{ option }} days
            </button>
          }
        </div>
      </header>

      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (placeholder of [1, 2, 3, 4]; track placeholder) {
            <div class="glass h-28 animate-pulse rounded-2xl"></div>
          }
        </div>
      } @else if (errored()) {
        <div class="glass rounded-2xl p-6 text-center" role="alert">
          <p class="text-sm text-[var(--color-text-muted)]">Could not load dashboard.</p>
          <button
            type="button"
            class="mt-4 rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-[var(--color-accent-fg)]"
            (click)="load()"
          >
            Retry
          </button>
        </div>
      } @else if (data(); as overview) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article class="glass rounded-2xl p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">New messages</p>
            <p class="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-text)]">
              {{ overview.messages.byStatus.new }}
            </p>
            <p class="mt-1 text-xs text-[var(--color-text-muted)]">{{ overview.messages.today }} received today</p>
          </article>
          <article class="glass rounded-2xl p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Total inbox</p>
            <p class="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-text)]">
              {{ overview.messages.total }}
            </p>
            <a routerLink="/messages" class="mt-1 inline-block text-xs text-[var(--color-accent)] hover:underline">
              Open messages →
            </a>
          </article>
          <article class="glass rounded-2xl p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Page views</p>
            <p class="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-text)]">
              {{ overview.traffic.totals.views }}
            </p>
            <p class="mt-1 text-xs text-[var(--color-text-muted)]">{{ overview.traffic.today.views }} today</p>
          </article>
          <article class="glass rounded-2xl p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Sessions</p>
            <p class="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-text)]">
              {{ overview.traffic.totals.sessions }}
            </p>
            <a routerLink="/analytics" class="mt-1 inline-block text-xs text-[var(--color-accent)] hover:underline">
              Full analytics →
            </a>
          </article>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-5">
          <article class="glass rounded-2xl p-5 lg:col-span-3">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-[var(--color-text)]">Portfolio traffic</h2>
                <p class="text-xs text-[var(--color-text-muted)]">Daily page views</p>
              </div>
              <span class="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                Views
              </span>
            </div>
            <admin-line-area-chart [points]="trafficPoints()" ariaLabel="Daily page views chart" />
          </article>

          <article class="glass rounded-2xl p-5 lg:col-span-2">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Inbox status</h2>
            <p class="mb-4 text-xs text-[var(--color-text-muted)]">Message distribution</p>
            <admin-donut-chart [segments]="messageSegments()" ariaLabel="Message status chart" />
          </article>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <article class="glass rounded-2xl p-5">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Incoming messages</h2>
            <p class="mb-4 text-xs text-[var(--color-text-muted)]">Messages per day</p>
            <admin-bar-chart [points]="messagePoints()" [pageSize]="10" barColor="var(--color-accent)" />
          </article>

          <article class="glass rounded-2xl p-5">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Visitor devices</h2>
            <p class="mb-4 text-xs text-[var(--color-text-muted)]">Last {{ overview.periodDays }} days</p>
            <admin-donut-chart [segments]="deviceSegments()" ariaLabel="Device breakdown chart" />
          </article>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-5">
          <article class="glass rounded-2xl p-5 lg:col-span-2">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Top countries</h2>
            <p class="mb-4 text-xs text-[var(--color-text-muted)]">By page views</p>
            <admin-bar-chart [points]="countryPoints()" barColor="#6366f1" />
          </article>

          <article class="glass overflow-hidden rounded-2xl lg:col-span-3">
            <div class="border-b border-[var(--color-surface-glass-border)] px-5 py-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-sm font-semibold text-[var(--color-text)]">Recent messages</h2>
                  <p class="text-xs text-[var(--color-text-muted)]">Latest contact form submissions</p>
                </div>
                <a
                  routerLink="/messages"
                  class="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                >
                  View all
                </a>
              </div>
            </div>

            @if (overview.messages.recent.length === 0) {
              <p class="p-5 text-sm text-[var(--color-text-muted)]">No messages yet.</p>
            } @else {
              <ul class="divide-y divide-[var(--color-surface-glass-border)]">
                @for (message of overview.messages.recent; track message.id) {
                  <li>
                    <a
                      [routerLink]="['/messages', message.id]"
                      class="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[var(--color-accent-soft)]"
                    >
                      <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" [class]="statusDot[message.status]"></span>
                      <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span class="font-medium text-[var(--color-text)]">{{ message.name }}</span>
                          <span class="text-xs text-[var(--color-text-subtle)]">{{ message.createdAt | date: 'dd/MM HH:mm' }}</span>
                        </div>
                        <p class="truncate text-sm text-[var(--color-text-muted)]">
                          {{ message.subject || message.email }}
                        </p>
                      </div>
                      <span class="shrink-0 rounded-full bg-[var(--color-surface-glass)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {{ statusLabels[message.status] }}
                      </span>
                    </a>
                  </li>
                }
              </ul>
            }
          </article>
        </div>
      }
    </section>
  `,
})
export class DashboardPage implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly periodOptions = PERIOD_OPTIONS;
  readonly statusLabels = STATUS_LABELS;
  readonly statusDot = STATUS_DOT;

  readonly days = signal(30);
  readonly loading = signal(true);
  readonly errored = signal(false);
  readonly data = signal<DashboardOverview | null>(null);

  readonly trafficPoints = computed<ChartPoint[]>(() => {
    const rows = this.data()?.traffic.byDay ?? [];
    return rows.map((row) => ({ label: row.day, value: row.views }));
  });

  readonly messagePoints = computed<ChartPoint[]>(() => {
    const rows = this.data()?.messages.byDay ?? [];
    return [...rows].reverse().map((row) => ({ label: shortDayLabel(row.day), value: row.count }));
  });

  readonly messageSegments = computed<ChartSegment[]>(() => {
    const byStatus = this.data()?.messages.byStatus;
    if (!byStatus) return [];
    return (Object.keys(STATUS_LABELS) as MessageStatus[]).map((status) => ({
      label: STATUS_LABELS[status],
      value: byStatus[status],
      color: STATUS_COLORS[status],
    }));
  });

  readonly deviceSegments = computed<ChartSegment[]>(() => {
    const devices = this.data()?.traffic.devices;
    if (!devices) return [];
    return (['desktop', 'mobile', 'tablet', 'unknown'] as const).map((key) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: devices[key],
      color: DEVICE_COLORS[key],
    }));
  });

  readonly countryPoints = computed<ChartPoint[]>(() => {
    const rows = this.data()?.traffic.topCountries ?? [];
    return rows.map((row) => ({ label: row.label, value: row.count }));
  });

  ngOnInit(): void {
    this.load();
  }

  setDays(days: number): void {
    this.days.set(days);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errored.set(false);

    this.api.getDashboardOverview(this.days()).subscribe({
      next: (overview) => {
        this.data.set(overview);
        this.loading.set(false);
      },
      error: () => {
        this.errored.set(true);
        this.loading.set(false);
      },
    });
  }
}
