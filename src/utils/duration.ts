export function parseDurationSeconds(duration?: string): number {
  if (!duration) return 0;
  const text = String(duration).toLowerCase();
  const mins = Number((text.match(/(\d+(?:\.\d+)?)\s*min/) || [])[1] || 0);
  const secs = Number((text.match(/(\d+(?:\.\d+)?)\s*sec/) || [])[1] || 0);
  return Math.round(mins * 60 + secs);
}

export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins > 0 && secs > 0) return `${mins} mins ${secs} secs`;
  if (mins > 0) return `${mins} mins`;
  if (secs > 0) return `${secs} secs`;
  return "0 mins";
}

export function sumDurations(durations: Array<string | undefined>): string {
  const total = durations.reduce(
    (acc, d) => acc + parseDurationSeconds(d),
    0
  );
  return formatDuration(total);
}
