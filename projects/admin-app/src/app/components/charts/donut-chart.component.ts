import { Component, computed, input } from '@angular/core';

import { ChartSegment } from './chart.utils';

@Component({
  selector: 'admin-donut-chart',
  template: `
    @if (total() === 0) {
      <p class="text-sm text-[var(--color-text-muted)]">No data yet.</p>
    } @else {
      <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div class="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 42 42" class="h-full w-full -rotate-90" role="img" [attr.aria-label]="ariaLabel()">
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="var(--color-surface-glass-border)"
              stroke-width="4"
            />
            @for (slice of slices(); track slice.label) {
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                [attr.stroke]="slice.color"
                stroke-width="4"
                [attr.stroke-dasharray]="slice.dashArray"
                [attr.stroke-dashoffset]="slice.dashOffset"
              />
            }
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span class="text-2xl font-semibold tabular-nums text-[var(--color-text)]">{{ total() }}</span>
            <span class="text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">Total</span>
          </div>
        </div>

        <ul class="min-w-0 flex-1 space-y-2">
          @for (segment of segments(); track segment.label) {
            <li class="flex items-center justify-between gap-3 text-sm">
              <span class="flex min-w-0 items-center gap-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" [style.background]="segment.color"></span>
                <span class="truncate text-[var(--color-text)]">{{ segment.label }}</span>
              </span>
              <span class="shrink-0 font-medium tabular-nums text-[var(--color-text-muted)]">
                {{ segment.value }}
                <span class="text-[var(--color-text-subtle)]">({{ percent(segment.value) }}%)</span>
              </span>
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class DonutChartComponent {
  readonly segments = input.required<ChartSegment[]>();
  readonly ariaLabel = input('Donut chart');

  protected readonly total = computed(() =>
    this.segments().reduce((sum, segment) => sum + segment.value, 0),
  );

  protected readonly slices = computed(() => {
    const total = this.total();
    if (total === 0) return [];

    let offset = 25;
    return this.segments()
      .filter((segment) => segment.value > 0)
      .map((segment) => {
        const percent = (segment.value / total) * 100;
        const dashArray = `${percent} ${100 - percent}`;
        const slice = { ...segment, dashArray, dashOffset: offset };
        offset -= percent;
        return slice;
      });
  });

  protected percent(value: number): number {
    const total = this.total();
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
}
