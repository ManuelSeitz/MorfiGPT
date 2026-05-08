export function formatDuration(duration: number) {
  const seconds = Math.floor(duration % 60);
  const minutes = Math.floor((duration / 60) % 60);
  const hours = Math.floor(duration / 3600);

  const s = String(seconds).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");

  if (hours > 0) {
    const h = String(hours).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  return `${m}:${s}`;
}
