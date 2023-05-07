export function lerp(start: number, end: number, step: number) {
  return start + step * (end - start)
}

export function smoothstep(start: number, end: number, step: number) {
  const t = Math.max(0, Math.min(1, (step - start) / (end - start)))
  return t * t * (3 - 2 * t)
}
