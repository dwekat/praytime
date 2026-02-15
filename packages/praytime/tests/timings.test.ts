import { describe, test, expect } from "bun:test";
import { PrayerTimes } from "../src/PrayerTimes";
import * as DMath from "../src/DMath";

// ---------- DMath Unit Tests ----------

describe("DMath", () => {
  test("dtr and rtd are inverses", () => {
    expect(DMath.rtd(DMath.dtr(180))).toBeCloseTo(180, 10);
    expect(DMath.rtd(DMath.dtr(45))).toBeCloseTo(45, 10);
  });

  test("sin/cos in degrees", () => {
    expect(DMath.sin(90)).toBeCloseTo(1, 10);
    expect(DMath.cos(0)).toBeCloseTo(1, 10);
    expect(DMath.sin(0)).toBeCloseTo(0, 10);
    expect(DMath.cos(90)).toBeCloseTo(0, 10);
  });

  test("arcsin/arccos clamp to [-1, 1]", () => {
    // Should not throw even with out-of-range inputs
    expect(DMath.arccos(1.0001)).toBeCloseTo(0, 5);
    expect(DMath.arccos(-1.0001)).toBeCloseTo(180, 5);
    expect(DMath.arcsin(1.0001)).toBeCloseTo(90, 5);
    expect(DMath.arcsin(-1.0001)).toBeCloseTo(-90, 5);
  });

  test("fixAngle normalizes to [0, 360)", () => {
    expect(DMath.fixAngle(370)).toBeCloseTo(10, 10);
    expect(DMath.fixAngle(-10)).toBeCloseTo(350, 10);
    expect(DMath.fixAngle(0)).toBeCloseTo(0, 10);
    expect(DMath.fixAngle(360)).toBeCloseTo(0, 10);
  });

  test("fixHour normalizes to [0, 24)", () => {
    expect(DMath.fixHour(25)).toBeCloseTo(1, 10);
    expect(DMath.fixHour(-1)).toBeCloseTo(23, 10);
    expect(DMath.fixHour(12)).toBeCloseTo(12, 10);
  });

  test("arccot", () => {
    expect(DMath.arccot(1)).toBeCloseTo(45, 10);
  });
});

// ---------- Prayer Times - ISNA London ----------
// From PHP TimingsTest.php: testTimes()

describe("PrayerTimes - ISNA London 2014-04-24", () => {
  test("24h format", () => {
    const pt = new PrayerTimes("ISNA");
    const date = new Date(2014, 3, 24); // April 24 2014 local

    // PHP: new DateTime('2014-4-24', new DateTimezone('Europe/London'))
    // We pass timezone info through the Date object
    const t = pt.getTimes(date, "51.508515", "-0.1254872", null, "ANGLE_BASED", null, "24h", "Europe/London");

    expect(t.Fajr).toBe("03:57");
    expect(t.Sunrise).toBe("05:46");
    expect(t.Dhuhr).toBe("12:59");
    expect(t.Asr).toBe("16:55");
    expect(t.Sunset).toBe("20:12");
    expect(t.Maghrib).toBe("20:12");
    expect(t.Isha).toBe("22:02");
    expect(t.Imsak).toBe("03:47");
    expect(t.Midnight).toBe("00:59");
  });
});

// ---------- No invalid times at high latitudes ----------
// From PHP TimingsTest.php: testTimes() second assertion

describe("PrayerTimes - KARACHI high latitude no invalid", () => {
  test("no '-----' invalid times at lat 67", () => {
    const pt = new PrayerTimes("KARACHI");
    // PHP: new DateTime('2018-01-19', new DateTimezone('Asia/Yekaterinburg'))
    // Asia/Yekaterinburg = UTC+5
    const date = new Date(2018, 0, 19); // Jan 19 2018
    const t = pt.getTimes(date, "67.104732", "67.104732", null, "ANGLE_BASED", null, "24h", "Asia/Yekaterinburg");

    for (const [, value] of Object.entries(t)) {
      expect(value).not.toBe("-----");
    }
  });
});

// ---------- ISO8601 Format Tests ----------
// From PHP TimingsTest.php: testIso8601Format()

describe("PrayerTimes - ISO8601 format", () => {
  test("London ISNA iso8601", () => {
    const pt = new PrayerTimes("ISNA");
    const date = new Date(2014, 3, 24);
    const t = pt.getTimes(date, "51.508515", "-0.1254872", null, "ANGLE_BASED", null, "iso8601", "Europe/London");

    expect(t.Fajr).toBe("2014-04-24T03:57:00+01:00");
    expect(t.Sunrise).toBe("2014-04-24T05:46:00+01:00");
    expect(t.Dhuhr).toBe("2014-04-24T12:59:00+01:00");
    expect(t.Asr).toBe("2014-04-24T16:55:00+01:00");
  });

  test("high latitude next day", () => {
    const pt = new PrayerTimes("ISNA");
    const date = new Date(2014, 3, 24);
    const t = pt.getTimes(date, "70", "-10", null, "ANGLE_BASED", null, "iso8601", "Europe/London");

    expect(t.Fajr).toBe("2014-04-24T03:15:00+01:00");
    expect(t.Sunrise).toBe("2014-04-24T04:50:00+01:00");
    expect(t.Dhuhr).toBe("2014-04-24T13:38:00+01:00");
    expect(t.Asr).toBe("2014-04-24T17:46:00+01:00");
    expect(t.Maghrib).toBe("2014-04-24T22:29:00+01:00");
    expect(t.Isha).toBe("2014-04-25T00:04:00+01:00");
    expect(t.Midnight).toBe("2014-04-25T01:39:00+01:00");
  });

  test("high latitude previous day", () => {
    const pt = new PrayerTimes("ISNA");
    const date = new Date(2014, 3, 24);
    const t = pt.getTimes(date, "70", "40", null, "ANGLE_BASED", null, "iso8601", "Europe/London");

    expect(t.Fajr).toBe("2014-04-23T23:55:00+01:00");
    expect(t.Sunrise).toBe("2014-04-24T01:30:00+01:00");
    expect(t.Dhuhr).toBe("2014-04-24T10:18:00+01:00");
    expect(t.Asr).toBe("2014-04-24T14:26:00+01:00");
    expect(t.Maghrib).toBe("2014-04-24T19:08:00+01:00");
    expect(t.Isha).toBe("2014-04-24T20:44:00+01:00");
    expect(t.Midnight).toBe("2014-04-24T22:19:00+01:00");
  });
});
