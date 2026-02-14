import { describe, test, expect } from "bun:test";
import { PrayerTimes } from "../src/PrayerTimes";

// From PHP TimingsMoonSightingTest.php: testTimes()

describe("PrayerTimes - MOONSIGHTING London 2014-04-24", () => {
  test("24h format with SHAFAQ_GENERAL", () => {
    const pt = new PrayerTimes("MOONSIGHTING");
    // Default shafaq is 'general' — no need to call setShafaq
    const date = new Date(2014, 3, 24); // April 24 2014

    const t = pt.getTimes(date, "51.508515", "-0.1254872", null, "ANGLE_BASED", null, "24h", "Europe/London");

    expect(t.Fajr).toBe("04:04");
    expect(t.Sunrise).toBe("05:46");
    expect(t.Dhuhr).toBe("12:59");
    expect(t.Asr).toBe("16:55");
    expect(t.Sunset).toBe("20:12");
    expect(t.Maghrib).toBe("20:12");
    expect(t.Isha).toBe("21:21");
    expect(t.Imsak).toBe("03:54");
    expect(t.Midnight).toBe("00:59");
  });
});

describe("PrayerTimes - KARACHI high latitude no invalid (moonsighting suite)", () => {
  test("no invalid times at lat 67", () => {
    const pt = new PrayerTimes("KARACHI");
    const date = new Date(2018, 0, 19);
    const t = pt.getTimes(date, "67.104732", "67.104732", null, "ANGLE_BASED", null, "24h", "Asia/Yekaterinburg");

    for (const [, value] of Object.entries(t)) {
      expect(value).not.toBe("-----");
    }
  });
});
