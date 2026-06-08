import { Component, computed, input } from '@angular/core';

import { ChartPoint } from './chart.utils';

@Component({
  selector: 'admin-bar-chart',
  template: `
    @if (points().length === 0) {
      <p class="text-sm text-[var(--color-text-muted)]">No data for this period.</p>
    } @else {
      <ul
        class="space-y-3"
        role="list"
        [class.overflow-y-auto]="maxVisibleRows() !== undefined"
        [class.overscroll-y-contain]="maxVisibleRows() !== undefined"
        [class.pr-1]="maxVisibleRows() !== undefined"
        [style.max-height]="scrollMaxHeight()"
      >
        @for (point of points(); track point.label) {
          <li>
            <div class="mb-1 flex items-center justify-between gap-3 text-xs">
              <span class="truncate text-[var(--color-text-muted)]">{{ point.label }}</span>
              <span class="shrink-0 font-medium tabular-nums text-[var(--color-text)]">{{ point.value }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-[var(--color-surface-glass)]">
              <div
                class="h-full rounded-full transition-all"
                [style.width.%]="barWidth(point.value)"
                [style.background]="barColor()"
              ></div>
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class BarChartComponent {
  readonly points = input.required<ChartPoint[]>();
  readonly barColor = input('var(--color-accent)');
  /** When set, the list scrolls after this many rows (~2.75rem each). */
  readonly maxVisibleRows = input<number | undefined>(undefined);

  private readonly maxValue = computed(() => Math.max(1, ...this.points().map((p) => p.value)));

  protected scrollMaxHeight(): string | null {
    const maxRows = this.maxVisibleRows();
    if (maxRows === undefined) return null;
    return `${maxRows * 2.75}rem`;
  }

  protected barWidth(value: number): number {
    return (value / this.maxValue()) * 100;
  }
}
