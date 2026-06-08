function formatUtcDay(date) {
  return date.toISOString().slice(0, 10);
}

/** Fill missing days with zero values so charts render a continuous timeline. */
export function fillDaySeries(rows, days, mapRow) {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  const series = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayDate = new Date(end);
    dayDate.setUTCDate(end.getUTCDate() - offset);
    const day = formatUtcDay(dayDate);
    series.push(mapRow(day, byDay.get(day)));
  }

  return series;
}
