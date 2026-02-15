import { computeDyy, interpolateMinutes } from "./computation";

const DIVISOR = 55;

/**
 * Compute Fajr prayer offset in minutes before sunrise
 * using MoonSighting.com methodology.
 *
 * Coefficients based on research by Syed Khalid Shaukat (moonsighting.com).
 * Base value: 75 minutes. Latitude scaling factor: 55 degrees.
 */
export function getMinutesBeforeSunrise(date: Date, latitude: number): number {
  const absLat = Math.abs(latitude);
  const a = 75 + 28.65 / DIVISOR * absLat;
  const b = 75 + 19.44 / DIVISOR * absLat;
  const c = 75 + 32.74 / DIVISOR * absLat;
  const d = 75 + 48.1 / DIVISOR * absLat;

  const { dyy } = computeDyy(date, latitude);
  return Math.round(interpolateMinutes(dyy, a, b, c, d));
}
