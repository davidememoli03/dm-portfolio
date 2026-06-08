import { Component, computed, effect, input, signal } from '@angular/core';

import { ListPaginationComponent } from '../list-pagination/list-pagination.component';
import { paginateSlice, totalPages } from '../list-pagination/pagination.utils';
import { ChartPoint } from './chart.utils';

@Component({
  selector: 'admin-bar-chart',
  imports: [ListPaginationComponent],
  template: `
    @if (points().length === 0) {
      <p class="text-sm text-[var(--color-text-muted)]">No data for this period.</p>
    } @else {
      <ul class="space-y-3" role="list">
        @for (point of visiblePoints(); track point.label) {
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

      @if (pageSize() !== undefined) {
        <admin-list-pagination
          [page]="page()"
          [totalPages]="pagesTotal()"
          (pageChange)="page.set($event)"
        />
      }
    }
  `,
})
export class BarChartComponent {
  readonly points = input.required<ChartPoint[]>();
  readonly barColor = input('var(--color-accent)');
  /** When set, shows this many rows per page with prev/next controls. */
  readonly pageSize = input<number | undefined>(undefined);

  readonly page = signal(1);

  private readonly maxValue = computed(() => Math.max(1, ...this.points().map((p) => p.value)));

  protected readonly visiblePoints = computed(() => {
    const pts = this.points();
    const size = this.pageSize();
    if (size === undefined) return pts;
    return paginateSlice(pts, this.page(), size);
  });

  protected readonly pagesTotal = computed(() => {
    const size = this.pageSize();
    if (size === undefined) return 1;
    return totalPages(this.points().length, size);
  });

  constructor() {
    effect(() => {
      this.points();
      this.pageSize();
      this.page.set(1);
    });
  }

  protected barWidth(value: number): number {
    return (value / this.maxValue()) * 100;
  }
}
