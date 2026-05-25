export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartSegment {
  label: string;
  value: number;
  color: string;
}

export function buildLinePath(points: ChartPoint[], width: number, height: number, padding = 2): string {
  if (points.length === 0) return '';
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = points.length <= 1 ? 0 : (width - padding * 2) / (points.length - 1);

  return points
    .map((point, index) => {
      const x = padding + step * index;
      const y = height - padding - (point.value / max) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function buildAreaPath(points: ChartPoint[], width: number, height: number, padding = 2): string {
  if (points.length === 0) return '';
  const line = buildLinePath(points, width, height, padding);
  const lastX = padding + (points.length <= 1 ? 0 : (width - padding * 2));
  return `${line} L ${lastX} ${height - padding} L ${padding} ${height - padding} Z`;
}

export function shortDayLabel(day: string): string {
  const [, month, date] = day.split('-');
  return `${date}/${month}`;
}
