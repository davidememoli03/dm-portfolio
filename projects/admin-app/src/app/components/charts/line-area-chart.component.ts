import { Component, computed, input } from '@angular/core';

import { buildAreaPath, buildLinePath, ChartPoint, shortDayLabel } from './chart.utils';

@Component({
  selector: 'admin-line-area-chart',
  template: `
    @if (points().length === 0) {
      <p class="text-sm text-[var(--color-text-muted)]">No data for this period.</p>
    } @else {
      <div class="flex h-44 flex-col gap-2">
        <svg
          [attr.viewBox]="'0 0 ' + width + ' ' + height"
          class="h-full w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          [attr.aria-label]="ariaLabel()"
        >
          @for (tick of gridTicks(); track tick) {
            <line
              x1="2"
              [attr.x2]="width - 2"
              [attr.y1]="tick"
              [attr.y2]="tick"
              stroke="var(--color-surface-glass-border)"
              stroke-width="0.5"
              vector-effect="non-scaling-stroke"
            />
          }
          @if (areaPath()) {
            <path [attr.d]="areaPath()" fill="var(--color-accent-soft)" />
            <path
              [attr.d]="linePath()"
              fill="none"
              stroke="var(--color-accent)"
              stroke-width="1.5"
              vector-effect="non-scaling-stroke"
            />
          }
          @for (dot of dotPoints(); track dot.label) {
            <circle
              [attr.cx]="dot.x"
              [attr.cy]="dot.y"
              r="1.8"
              fill="var(--color-accent)"
              vector-effect="non-scaling-stroke"
            />
          }
        </svg>
        <div class="flex justify-between gap-1 text-[10px] text-[var(--color-text-subtle)]">
          @for (point of visibleLabels(); track point.label) {
            <span class="truncate">{{ shortDay(point.label) }}</span>
          }
        </div>
      </div>
    }
  `,
})
export class LineAreaChartComponent {
  readonly points = input.required<ChartPoint[]>();
  readonly ariaLabel = input('Line chart');

  protected readonly width = 100;
  protected readonly height = 40;

  protected readonly linePath = computed(() =>
    buildLinePath(this.points(), this.width, this.height),
  );

  protected readonly areaPath = computed(() =>
    buildAreaPath(this.points(), this.width, this.height),
  );

  protected readonly gridTicks = computed(() => {
    const h = this.height;
    return [h * 0.25, h * 0.5, h * 0.75].map((v) => Math.round(v * 10) / 10);
  });

  protected readonly dotPoints = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return [];
    const max = Math.max(1, ...pts.map((p) => p.value));
    const padding = 2;
    const step = pts.length <= 1 ? 0 : (this.width - padding * 2) / (pts.length - 1);
    return pts.map((point, index) => ({
      label: point.label,
      x: padding + step * index,
      y: this.height - padding - (point.value / max) * (this.height - padding * 2),
    }));
  });

  protected readonly visibleLabels = computed(() => {
    const pts = this.points();
    if (pts.length <= 7) return pts;
    const step = Math.ceil(pts.length / 7);
    return pts.filter((_, index) => index === 0 || index === pts.length - 1 || index % step === 0);
  });

  protected shortDay(day: string): string {
    return shortDayLabel(day);
  }
}
