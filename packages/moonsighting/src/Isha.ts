import type { Shafaq, SeasonalCoefficients } from "./types";
import { computeDyy, interpolateMinutes } from "./PrayerTimes";

export const SHAFAQ_GENERAL: Shafaq = "general";
export const SHAFAQ_AHMER: Shafaq = "ahmer";
export const SHAFAQ_ABYAD: Shafaq = "abyad";

const DIVISOR = 55;

function getCoefficients(shafaq: Shafaq, absLat: number): SeasonalCoefficients {
  switch (shafaq) {
    case "ahmer":
      return {
        a: 62 + 17.4 / DIVISOR * absLat,
        b: 62 - 7.16 / DIVISOR * absLat,
        c: 62 + 5.12 / DIVISOR * absLat,
        d: 62 + 19.44 / DIVISOR * absLat,
      };
    case "abyad":
      return {
        a: 75 + 25.6 / DIVISOR * absLat,
        b: 75 + 7.16 / DIVISOR * absLat,
        c: 75 + 36.84 / DIVISOR * absLat,
        d: 75 + 81.84 / DIVISOR * absLat,
      };
    case "general":
      return {
        a: 75 + 25.6 / DIVISOR * absLat,
        b: 75 + 2.05 / DIVISOR * absLat,
        c: 75 - 9.21 / DIVISOR * absLat,
        d: 75 + 6.14 / DIVISOR * absLat,
      };
  }
}

/**
 * Compute Isha prayer offset in minutes after sunset
 * using MoonSighting.com methodology.
 *
 * Supports three shafaq (twilight) types:
 * - general: default method
 * - ahmer: red twilight (base 62 minutes)
 * - abyad: white twilight (base 75 minutes)
 */
export function getMinutesAfterSunset(date: Date, latitude: number, shafaq: Shafaq = SHAFAQ_GENERAL): number {
  const absLat = Math.abs(latitude);
  const { a, b, c, d } = getCoefficients(shafaq, absLat);
  const { dyy } = computeDyy(date, latitude);
  return Math.round(interpolateMinutes(dyy, a, b, c, d));
}
