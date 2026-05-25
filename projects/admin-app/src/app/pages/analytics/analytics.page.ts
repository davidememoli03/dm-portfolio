import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { AdminApiService } from '../../api/admin-api.service';
import { AnalyticsOverview } from '../../models/analytics.models';

const PERIOD_OPTIONS = [7, 30, 90] as const;

@Component({
  selector: 'admin-analytics-page',
  imports: [DatePipe],
  template: `
    <section class="py-8">
      <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span class="text-eyebrow text-[var(--color-accent)]">Insights</span>
          <h1 class="text-headline mt-2 text-[var(--color-text)]">Analytics</h1>
          <p class="mt-2 text-sm text-[var(--color-text-muted)]">
            Portfolio visits, geography and traffic sources.
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
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (placeholder of [1, 2, 3, 4]; track placeholder) {
            <div class="glass h-28 animate-pulse rounded-2xl"></div>
          }
        </div>
      } @else if (errored()) {
        <div class="glass rounded-2xl p-6 text-center" role="alert">
          <p class="text-sm text-[var(--color-text-muted)]">Could not load analytics.</p>
          <button
            type="button"
            class="mt-4 rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-[var(--color-accent-fg)]"
            (click)="load()"
          >
            Retry
          </button>
        </div>
      } @else if (overview(); as data) {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article class="glass rounded-2xl p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Views</p>
            <p class="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-text)]">{{ data.totals.views }}</p>
            <p class="mt-1 text-xs text-[var(--color-text-muted)]">Last {{ data.periodDays }} days</p>
          </article>
          <article class="glass rounded-2xl p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Sessions</p>
            <p class="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-text)]">{{ data.totals.sessions }}</p>
            <p class="mt-1 text-xs text-[var(--color-text-muted)]">Unique visitors</p>
          </article>
          <article class="glass rounded-2xl p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Today</p>
            <p class="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-text)]">{{ data.today.views }}</p>
            <p class="mt-1 text-xs text-[var(--color-text-muted)]">{{ data.today.sessions }} sessions</p>
          </article>
          <article class="glass rounded-2xl p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">Avg / day</p>
            <p class="mt-2 text-3xl font-semibold tabular-nums text-[var(--color-text)]">{{ avgViewsPerDay() }}</p>
            <p class="mt-1 text-xs text-[var(--color-text-muted)]">Views per day</p>
          </article>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-5">
          <article class="glass rounded-2xl p-5 lg:col-span-3">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Daily views</h2>
            @if (data.viewsByDay.length === 0) {
              <p class="mt-6 text-sm text-[var(--color-text-muted)]">No visits recorded yet.</p>
            } @else {
              <div class="mt-6 flex h-40 items-end gap-1 overflow-x-auto pb-1">
                @for (point of data.viewsByDay; track point.day) {
                  <div class="flex min-w-[2rem] flex-1 flex-col items-center gap-2">
                    <div
                      class="w-full rounded-t-md bg-[var(--color-accent)] transition-all"
                      [style.height.%]="barHeight(point.views)"
                      [title]="point.day + ': ' + point.views + ' views'"
                    ></div>
                    <span class="text-[10px] text-[var(--color-text-subtle)]">{{ shortDay(point.day) }}</span>
                  </div>
                }
              </div>
            }
          </article>

          <article class="glass rounded-2xl p-5 lg:col-span-2">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Devices</h2>
            <ul class="mt-4 space-y-3">
              @for (device of deviceRows(); track device.key) {
                <li>
                  <div class="mb-1 flex items-center justify-between text-xs">
                    <span class="capitalize text-[var(--color-text-muted)]">{{ device.key }}</span>
                    <span class="font-medium tabular-nums text-[var(--color-text)]">{{ device.count }}</span>
                  </div>
                  <div class="h-2 overflow-hidden rounded-full bg-[var(--color-surface-glass)]">
                    <div
                      class="h-full rounded-full bg-[var(--color-accent)]"
                      [style.width.%]="devicePercent(device.count)"
                    ></div>
                  </div>
                </li>
              }
            </ul>
          </article>
        </div>

        <div class="mt-6 grid gap-6 lg:grid-cols-3">
          <article class="glass rounded-2xl p-5">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Top countries</h2>
            @if (data.topCountries.length === 0) {
              <p class="mt-4 text-sm text-[var(--color-text-muted)]">No geo data yet.</p>
            } @else {
              <ul class="mt-4 space-y-2">
                @for (row of data.topCountries; track row.label) {
                  <li class="flex items-center justify-between gap-3 text-sm">
                    <span class="truncate text-[var(--color-text)]">{{ row.label }}</span>
                    <span class="shrink-0 font-medium tabular-nums text-[var(--color-text-muted)]">{{ row.count }}</span>
                  </li>
                }
              </ul>
            }
          </article>

          <article class="glass rounded-2xl p-5">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Top referrers</h2>
            @if (data.topReferrers.length === 0) {
              <p class="mt-4 text-sm text-[var(--color-text-muted)]">No referrer data yet.</p>
            } @else {
              <ul class="mt-4 space-y-2">
                @for (row of data.topReferrers; track row.label) {
                  <li class="flex items-center justify-between gap-3 text-sm">
                    <span class="truncate text-[var(--color-text)]">{{ row.label }}</span>
                    <span class="shrink-0 font-medium tabular-nums text-[var(--color-text-muted)]">{{ row.count }}</span>
                  </li>
                }
              </ul>
            }
          </article>

          <article class="glass rounded-2xl p-5">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Locales</h2>
            @if (data.locales.length === 0) {
              <p class="mt-4 text-sm text-[var(--color-text-muted)]">No locale data yet.</p>
            } @else {
              <ul class="mt-4 space-y-2">
                @for (row of data.locales; track row.locale) {
                  <li class="flex items-center justify-between gap-3 text-sm">
                    <span class="uppercase text-[var(--color-text)]">{{ row.locale }}</span>
                    <span class="shrink-0 font-medium tabular-nums text-[var(--color-text-muted)]">{{ row.count }}</span>
                  </li>
                }
              </ul>
            }
          </article>
        </div>

        <article class="glass mt-6 overflow-hidden rounded-2xl">
          <div class="border-b border-[var(--color-surface-glass-border)] px-5 py-4">
            <h2 class="text-sm font-semibold text-[var(--color-text)]">Recent visits</h2>
          </div>
          @if (data.recentViews.length === 0) {
            <p class="p-5 text-sm text-[var(--color-text-muted)]">No visits recorded yet.</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full text-left text-sm">
                <thead class="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
                  <tr>
                    <th class="px-5 py-3 font-medium">When</th>
                    <th class="px-5 py-3 font-medium">Location</th>
                    <th class="px-5 py-3 font-medium">Device</th>
                    <th class="px-5 py-3 font-medium">Referrer</th>
                    <th class="px-5 py-3 font-medium">Locale</th>
                  </tr>
                </thead>
                <tbody>
                  @for (visit of data.recentViews; track visit.sessionId + visit.createdAt) {
                    <tr class="border-t border-[var(--color-surface-glass-border)]">
                      <td class="whitespace-nowrap px-5 py-3 text-[var(--color-text-muted)]">
                        {{ visit.createdAt | date: 'dd/MM HH:mm' }}
                      </td>
                      <td class="px-5 py-3 text-[var(--color-text)]">{{ visit.location }}</td>
                      <td class="px-5 py-3 capitalize text-[var(--color-text-muted)]">{{ visit.deviceType }}</td>
                      <td class="max-w-[12rem] truncate px-5 py-3 text-[var(--color-text-muted)]" [title]="visit.referrerLabel">
                        {{ visit.referrerLabel }}
                      </td>
                      <td class="px-5 py-3 uppercase text-[var(--color-text-muted)]">{{ visit.locale ?? '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </article>
      }
    </section>
  `,
})
export class AnalyticsPage implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly periodOptions = PERIOD_OPTIONS;
  readonly days = signal<number>(30);
  readonly loading = signal(true);
  readonly errored = signal(false);
  readonly overview = signal<AnalyticsOverview | null>(null);

  private readonly maxDailyViews = computed(() => {
    const rows = this.overview()?.viewsByDay ?? [];
    return Math.max(1, ...rows.map((row) => row.views));
  });

  readonly avgViewsPerDay = computed(() => {
    const data = this.overview();
    if (!data || data.periodDays === 0) return 0;
    return Math.round((data.totals.views / data.periodDays) * 10) / 10;
  });

  readonly deviceRows = computed(() => {
    const devices = this.overview()?.devices;
    if (!devices) return [];
    return (['desktop', 'mobile', 'tablet', 'unknown'] as const).map((key) => ({
      key,
      count: devices[key],
    }));
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

    this.api.getAnalyticsOverview(this.days()).subscribe({
      next: (data) => {
        this.overview.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errored.set(true);
        this.loading.set(false);
      },
    });
  }

  barHeight(views: number): number {
    return Math.max(8, (views / this.maxDailyViews()) * 100);
  }

  devicePercent(count: number): number {
    const total = this.deviceRows().reduce((sum, row) => sum + row.count, 0);
    if (total === 0) return 0;
    return (count / total) * 100;
  }

  shortDay(day: string): string {
    const [, month, date] = day.split('-');
    return `${date}/${month}`;
  }
}
