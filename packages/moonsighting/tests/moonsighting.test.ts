import { describe, test, expect } from "bun:test";
import { computeDyy, interpolateMinutes } from "../src/PrayerTimes";
import { getMinutesBeforeSunrise } from "../src/Fajr";
import { getMinutesAfterSunset, SHAFAQ_GENERAL, SHAFAQ_AHMER, SHAFAQ_ABYAD } from "../src/Isha";

// ---------- DYY Calculation ----------

describe("computeDyy", () => {
  test("northern hemisphere, Dec 24 2020 → dyy = 2", () => {
    const date = new Date(2020, 11, 24); // Dec 24 2020
    const result = computeDyy(date, 25.2119894);
    expect(result.dyy).toBe(2);
    expect(result.hemisphere).toBe("north");
  });

  test("northern hemisphere, Nov 24 2020 → dyy = 338", () => {
    const date = new Date(2020, 10, 24); // Nov 24 2020
    const result = computeDyy(date, 25.2119894);
    expect(result.dyy).toBe(338);
    expect(result.hemisphere).toBe("north");
  });

  test("southern hemisphere, Jun 24 2020 → dyy = 2", () => {
    const date = new Date(2020, 5, 24); // Jun 24 2020
    const result = computeDyy(date, -29.8586804);
    expect(result.dyy).toBe(2);
    expect(result.hemisphere).toBe("south");
  });

  test("southern hemisphere, May 24 2020 → dyy = 337", () => {
    const date = new Date(2020, 4, 24); // May 24 2020
    const result = computeDyy(date, -29.8586804);
    expect(result.dyy).toBe(337);
    expect(result.hemisphere).toBe("south");
  });
});

// ---------- Piecewise Interpolation ----------

describe("interpolateMinutes", () => {
  test("first segment (dyy < 91)", () => {
    // a + (b - a) / 91 * dyy
    const result = interpolateMinutes(2, 100, 80, 90, 110);
    const expected = 100 + (80 - 100) / 91 * 2;
    expect(result).toBeCloseTo(expected, 8);
  });

  test("boundary at dyy = 91", () => {
    const result = interpolateMinutes(91, 100, 80, 90, 110);
    // Should equal b + (c - b) / 46 * 0 = b
    expect(result).toBeCloseTo(80, 8);
  });

  test("last segment (dyy >= 275)", () => {
    const result = interpolateMinutes(300, 100, 80, 90, 110);
    const expected = 80 + (100 - 80) / 91 * (300 - 275);
    expect(result).toBeCloseTo(expected, 8);
  });
});

// ---------- Fajr ----------

describe("Fajr - getMinutesBeforeSunrise", () => {
  test("north hemisphere, Dec 24 2020, lat 25.2119894 → 88 min", () => {
    const date = new Date(2020, 11, 24);
    expect(getMinutesBeforeSunrise(date, 25.2119894)).toBe(88);
  });

  test("north hemisphere, Nov 24 2020, lat 25.2119894 → 87 min", () => {
    const date = new Date(2020, 10, 24);
    expect(getMinutesBeforeSunrise(date, 25.2119894)).toBe(87);
  });

  test("south hemisphere, Jun 24 2020, lat -29.8586804 → 90 min", () => {
    const date = new Date(2020, 5, 24);
    expect(getMinutesBeforeSunrise(date, -29.8586804)).toBe(90);
  });

  test("south hemisphere, May 24 2020, lat -29.8586804 → 89 min", () => {
    const date = new Date(2020, 4, 24);
    expect(getMinutesBeforeSunrise(date, -29.8586804)).toBe(89);
  });
});

// ---------- Isha (default SHAFAQ_GENERAL) ----------

describe("Isha - getMinutesAfterSunset (general)", () => {
  test("north hemisphere, Dec 24 2020, lat 25.2119894 → 86 min", () => {
    const date = new Date(2020, 11, 24);
    expect(getMinutesAfterSunset(date, 25.2119894, SHAFAQ_GENERAL)).toBe(86);
  });

  test("north hemisphere, Nov 24 2020, lat 25.2119894 → 83 min", () => {
    const date = new Date(2020, 10, 24);
    expect(getMinutesAfterSunset(date, 25.2119894, SHAFAQ_GENERAL)).toBe(83);
  });

  test("south hemisphere, Jun 24 2020, lat -29.8586804 → 89 min", () => {
    const date = new Date(2020, 5, 24);
    expect(getMinutesAfterSunset(date, -29.8586804, SHAFAQ_GENERAL)).toBe(89);
  });

  test("south hemisphere, May 24 2020, lat -29.8586804 → 85 min", () => {
    const date = new Date(2020, 4, 24);
    expect(getMinutesAfterSunset(date, -29.8586804, SHAFAQ_GENERAL)).toBe(85);
  });
});

// ---------- Isha - default shafaq parameter ----------

describe("Isha - default shafaq is general", () => {
  test("omitting shafaq uses general", () => {
    const date = new Date(2020, 11, 24);
    expect(getMinutesAfterSunset(date, 25.2119894)).toBe(86);
  });
});

// ---------- Edge cases ----------

describe("edge cases", () => {
  test("equator latitude (0) computes without error", () => {
    const date = new Date(2020, 5, 21);
    expect(() => getMinutesBeforeSunrise(date, 0)).not.toThrow();
    expect(() => getMinutesAfterSunset(date, 0)).not.toThrow();
  });

  test("Fajr returns integer (rounded)", () => {
    const date = new Date(2020, 11, 24);
    const result = getMinutesBeforeSunrise(date, 25.2119894);
    expect(result).toBe(Math.round(result));
  });

  test("Isha returns integer (rounded)", () => {
    const date = new Date(2020, 11, 24);
    const result = getMinutesAfterSunset(date, 25.2119894);
    expect(result).toBe(Math.round(result));
  });
});
