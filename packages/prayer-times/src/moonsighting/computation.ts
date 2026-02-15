import type { Hemisphere } from "./types";

/**
 * Compute days since winter solstice reference for the given hemisphere.
 * Northern hemisphere uses Dec 21, southern uses Jun 21.
 *
 * The PHP source uses DateTime::createFromFormat which fills in the current
 * server time (not midnight), while the input date is at midnight. This causes
 * positive diffs to be 1 less than the calendar distance (floor of fractional
 * days). We replicate this by subtracting 1 from positive diffs.
 */
export function computeDyy(date: Date, latitude: number): { dyy: number; hemisphere: Hemisphere } {
  const hemisphere: Hemisphere = latitude > 0 ? "north" : "south";
  const year = date.getFullYear();

  const refMonth = hemisphere === "north" ? 11 : 5; // JS months are 0-indexed
  const refDate = new Date(year, refMonth, 21);

  const msPerDay = 86_400_000;
  const calendarDiff = Math.round((date.getTime() - refDate.getTime()) / msPerDay);

  // Match PHP behavior: positive diffs lose 1 day due to DateTime::createFromFormat
  // using current server time (non-midnight) for the reference date.
  const dyy = calendarDiff > 0 ? calendarDiff - 1 : 365 + calendarDiff;

  return { dyy, hemisphere };
}

/**
 * Piecewise linear interpolation across six seasonal segments.
 * Segments: [0,91), [91,137), [137,183), [183,229), [229,275), [275,365)
 * Creates a symmetric curve: a -> b -> c -> d -> c -> b -> a over the year.
 */
export function interpolateMinutes(dyy: number, a: number, b: number, c: number, d: number): number {
  if (dyy < 91) {
    return a + (b - a) / 91 * dyy;
  }
  if (dyy < 137) {
    return b + (c - b) / 46 * (dyy - 91);
  }
  if (dyy < 183) {
    return c + (d - c) / 46 * (dyy - 137);
  }
  if (dyy < 229) {
    return d + (c - d) / 46 * (dyy - 183);
  }
  if (dyy < 275) {
    return c + (b - c) / 46 * (dyy - 229);
  }
  // dyy >= 275
  return b + (a - b) / 91 * (dyy - 275);
}
