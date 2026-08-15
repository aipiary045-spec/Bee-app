const OVERFLOW_SLACK = 8;

export function hiveStripCanSlide(
  scrollWidth: number,
  clientWidth: number
): boolean {
  return scrollWidth > clientWidth + OVERFLOW_SLACK;
}

export function nearestHiveIndex(
  viewportCenter: number,
  hiveCenters: number[]
): number {
  if (hiveCenters.length === 0) return 0;

  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  hiveCenters.forEach((center, index) => {
    const dist = Math.abs(center - viewportCenter);
    if (dist < bestDist) {
      bestDist = dist;
      best = index;
    }
  });
  return best;
}

export function hiveSlideHint(
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number
): { moreLeft: boolean; moreRight: boolean } {
  return {
    moreLeft: scrollLeft > OVERFLOW_SLACK,
    moreRight: scrollLeft + clientWidth < scrollWidth - OVERFLOW_SLACK,
  };
}
