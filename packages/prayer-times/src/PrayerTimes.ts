import type {
  CalculationMethod,
  School,
  MidnightMode,
  LatitudeAdjustment,
  TimeFormat,
  PrayerTimesResult,
  CalculationMeta,
  MethodConfig,
  RawTimes,
  SunPosition,
  TuneOffsets,
} from "./types";
import type { Shafaq } from "./moonsighting";
import {
  SHAFAQ_GENERAL,
  getMinutesBeforeSunrise,
  getMinutesAfterSunset,
} from "./moonsighting";
import { getMethods, getMethodCodes, CustomMethod } from "./Method";
import * as D from "./DMath";

// Prayer name constants
const IMSAK = "Imsak";
const FAJR = "Fajr";
const SUNRISE = "Sunrise";
const DHUHR = "Dhuhr";
const ASR = "Asr";
const SUNSET = "Sunset";
const MAGHRIB = "Maghrib";
const ISHA = "Isha";
const MIDNIGHT = "Midnight";
const FIRST_THIRD = "Firstthird";
const LAST_THIRD = "Lastthird";

const INVALID_TIME = "-----";

export class PrayerTimes {
  private readonly methods: Record<string, MethodConfig>;
  private readonly methodCodes: readonly CalculationMethod[];
  private date!: Date;
  private method!: CalculationMethod;
  private readonly school: School;
  private midnightMode!: MidnightMode;
  private latitudeAdjustmentMethod!: LatitudeAdjustment;
  private timeFormat!: TimeFormat;
  private latitude!: number;
  private longitude!: number;
  private elevation!: number;
  private readonly asrShadowFactor: number | null;
  private shafaq: Shafaq = SHAFAQ_GENERAL;
  private timezone: string | null = null;
  private offset: TuneOffsets = {};
  private settings!: Record<string, number | string>;

  constructor(
    method: CalculationMethod = "MWL",
    school: School = "STANDARD",
    asrShadowFactor: number | null = null,
  ) {
    this.methods = { ...getMethods() };
    this.methodCodes = getMethodCodes();
    this.setMethod(method);
    this.school = school;
    this.asrShadowFactor = asrShadowFactor;
    this.loadSettings();
  }

  setShafaq(shafaq: Shafaq): void {
    this.shafaq = shafaq;
  }

  setCustomMethod(method: CustomMethod): void {
    this.method = "CUSTOM";
    this.methods[this.method] = {
      id: 99,
      name: method.name,
      params: { ...method.params },
    };
    this.loadSettings();
  }

  getTimes(
    date: Date,
    latitude: number | string,
    longitude: number | string,
    elevation?: number | null,
    latitudeAdjustmentMethod: LatitudeAdjustment = "ANGLE_BASED",
    midnightMode?: MidnightMode | null,
    format: TimeFormat = "24h",
    timezone?: string | null,
  ): PrayerTimesResult {
    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
    this.elevation = elevation == null ? 0 : Number(elevation);
    this.timeFormat = format;
    this.latitudeAdjustmentMethod = latitudeAdjustmentMethod;
    if (midnightMode != null) {
      this.midnightMode = midnightMode;
    }
    this.date = date;
    this.timezone = timezone ?? null;
    return this.computeTimes();
  }

  tune(offsets: TuneOffsets): void {
    this.offset = { ...offsets };
  }

  getMeta(): CalculationMeta {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      timezone: this.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      method: this.methods[this.method]!,
      latitudeAdjustmentMethod: this.method === "MOONSIGHTING" ? "NONE" : this.latitudeAdjustmentMethod,
      midnightMode: this.midnightMode,
      school: this.school,
      offset: { ...this.offset },
    };
  }

  // --- Private ---

  private setMethod(method: CalculationMethod): void {
    this.method = this.methodCodes.includes(method) ? method : "MWL";
  }

  private loadSettings(): void {
    const params = this.methods[this.method]?.params ?? {};
    this.settings = {
      [IMSAK]: params[IMSAK] ?? "10 min",
      [FAJR]: params[FAJR] ?? 0,
      [DHUHR]: params[DHUHR] ?? "0 min",
      [ISHA]: params[ISHA] ?? 0,
      [MAGHRIB]: params[MAGHRIB] ?? "0 min",
    };

    this.midnightMode = params[MIDNIGHT] === "JAFARI" ? "JAFARI" : "STANDARD";
  }

  private computeTimes(): PrayerTimesResult {
    let times: RawTimes = {
      [IMSAK]: 5, [FAJR]: 5, [SUNRISE]: 6, [DHUHR]: 12,
      [ASR]: 13, [SUNSET]: 18, [MAGHRIB]: 18, [ISHA]: 18,
    };

    times = this.computePrayerTimes(times);
    times = this.adjustTimes(times);

    // Night times
    const diff = this.midnightMode === "JAFARI"
      ? this.timeDiff(times[SUNSET]!, times[FAJR]!)
      : this.timeDiff(times[SUNSET]!, times[SUNRISE]!);

    times[MIDNIGHT] = times[SUNSET]! + diff / 2;
    times[FIRST_THIRD] = times[SUNSET]! + diff / 3;
    times[LAST_THIRD] = times[SUNSET]! + 2 * (diff / 3);

    if (this.method === "MOONSIGHTING") {
      times = this.moonsightingRecalculation(times);
    }

    times = this.tuneTimes(times);
    return this.modifyFormats(times);
  }

  private moonsightingRecalculation(times: RawTimes): RawTimes {
    const fajrMinutes = getMinutesBeforeSunrise(this.date, this.latitude);
    times[FAJR] = times[SUNRISE]! - fajrMinutes / 60;

    if (this.isMin(this.settings[IMSAK]!)) {
      times[IMSAK] = times[FAJR]! - this.evaluate(this.settings[IMSAK]!) / 60;
    }

    const ishaMinutes = getMinutesAfterSunset(this.date, this.latitude, this.shafaq);
    times[ISHA] = times[SUNSET]! + ishaMinutes / 60;

    return times;
  }

  private computePrayerTimes(times: RawTimes): RawTimes {
    times = this.dayPortion(times);

    const imsak = this.sunAngleTime(this.evaluate(this.settings[IMSAK]!), times[IMSAK]!, "ccw");
    const fajr = this.sunAngleTime(this.evaluate(this.settings[FAJR]!), times[FAJR]!, "ccw");
    const sunrise = this.sunAngleTime(this.riseSetAngle(), times[SUNRISE]!, "ccw");
    const dhuhr = this.midDay(times[DHUHR]!);
    const asr = this.asrTime(this.asrFactor(), times[ASR]!);
    const sunset = this.sunAngleTime(this.riseSetAngle(), times[SUNSET]!);
    const maghrib = this.sunAngleTime(this.evaluate(this.settings[MAGHRIB]!), times[MAGHRIB]!);
    const isha = this.sunAngleTime(this.evaluate(this.settings[ISHA]!), times[ISHA]!);

    return {
      [FAJR]: fajr, [SUNRISE]: sunrise, [DHUHR]: dhuhr, [ASR]: asr,
      [SUNSET]: sunset, [MAGHRIB]: maghrib, [ISHA]: isha, [IMSAK]: imsak,
    };
  }

  private adjustTimes(times: RawTimes): RawTimes {
    const tzOffset = this.getTimezoneOffset();

    for (const key of Object.keys(times)) {
      times[key] = times[key]! + tzOffset - this.longitude / 15;
    }

    if (this.latitudeAdjustmentMethod !== "NONE") {
      times = this.adjustHighLatitudes(times);
    }

    if (this.isMin(this.settings[IMSAK]!)) {
      times[IMSAK] = times[FAJR]! - this.evaluate(this.settings[IMSAK]!) / 60;
    }
    if (this.isMin(this.settings[MAGHRIB]!)) {
      times[MAGHRIB] = times[SUNSET]! + this.evaluate(this.settings[MAGHRIB]!) / 60;
    }
    if (this.isMin(this.settings[ISHA]!)) {
      times[ISHA] = times[MAGHRIB]! + this.evaluate(this.settings[ISHA]!) / 60;
    }

    times[DHUHR] = times[DHUHR]! + this.evaluate(this.settings[DHUHR]!) / 60;

    return times;
  }

  private adjustHighLatitudes(times: RawTimes): RawTimes {
    const nightTime = this.timeDiff(times[SUNSET]!, times[SUNRISE]!);

    times[IMSAK] = this.adjustHLTime(times[IMSAK]!, times[SUNRISE]!, this.evaluate(this.settings[IMSAK]!), nightTime, "ccw");
    times[FAJR] = this.adjustHLTime(times[FAJR]!, times[SUNRISE]!, this.evaluate(this.settings[FAJR]!), nightTime, "ccw");
    times[ISHA] = this.adjustHLTime(times[ISHA]!, times[SUNSET]!, this.evaluate(this.settings[ISHA]!), nightTime);
    times[MAGHRIB] = this.adjustHLTime(times[MAGHRIB]!, times[SUNSET]!, this.evaluate(this.settings[MAGHRIB]!), nightTime);

    return times;
  }

  private adjustHLTime(time: number, base: number, angle: number, night: number, direction?: string): number {
    const portion = this.nightPortion(angle, night);
    const diff = direction === "ccw"
      ? this.timeDiff(time, base)
      : this.timeDiff(base, time);

    if (Number.isNaN(time) || diff > portion) {
      return base + (direction === "ccw" ? -portion : portion);
    }
    return time;
  }

  private nightPortion(angle: number, night: number): number {
    let portion = 0.5;
    if (this.latitudeAdjustmentMethod === "ANGLE_BASED") {
      portion = angle / 60;
    } else if (this.latitudeAdjustmentMethod === "ONE_SEVENTH") {
      portion = 1 / 7;
    }
    return portion * night;
  }

  private timeDiff(t1: number, t2: number): number {
    return D.fixHour(t2 - t1);
  }

  private dayPortion(times: RawTimes): RawTimes {
    const result: RawTimes = {};
    for (const [key, value] of Object.entries(times)) {
      result[key] = value / 24;
    }
    return result;
  }

  // --- Astronomical calculations ---

  private sunPosition(jd: number): SunPosition {
    const dd = jd - 2451545;
    const g = D.fixAngle(357.529 + 0.98560028 * dd);
    const q = D.fixAngle(280.459 + 0.98564736 * dd);
    const L = D.fixAngle(q + 1.915 * D.sin(g) + 0.02 * D.sin(2 * g));
    const e = 23.439 - 0.00000036 * dd;
    const RA = D.arctan2(D.cos(e) * D.sin(L), D.cos(L)) / 15;
    const eqt = q / 15 - D.fixHour(RA);
    const decl = D.arcsin(D.sin(e) * D.sin(L));

    return { declination: decl, equation: eqt };
  }

  private julianDate(year: number, month: number, day: number): number {
    let y = year;
    let m = month;
    if (m <= 2) {
      y -= 1;
      m += 12;
    }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
  }

  /** Base Julian Date: julian(Y,M,D) - lng/360 */
  private jDate(): number {
    return this.julianDate(
      this.date.getFullYear(), this.date.getMonth() + 1, this.date.getDate(),
    ) - this.longitude / (15 * 24);
  }

  /** Julian Date with fractional day offset */
  private gregorianToJulianDate(): number {
    const jd = this.julianDate(
      this.date.getFullYear(), this.date.getMonth() + 1, this.date.getDate(),
    );
    const hours = this.date.getHours();
    let dayFrac = hours / 24 - 0.5;
    if (dayFrac < 0) dayFrac += 1;
    return jd + dayFrac + (this.date.getMinutes() + this.date.getSeconds() / 60) / 60 / 24;
  }

  private midDay(time: number): number {
    const eqt = this.sunPosition(this.jDate() + time).equation;
    return D.fixHour(12 - eqt);
  }

  private sunAngleTime(angle: number, time: number, direction?: string): number {
    const decl = this.sunPosition(this.jDate() + time).declination;
    const noon = this.midDay(time);

    const p1 = -D.sin(angle) - D.sin(decl) * D.sin(this.latitude);
    const p2 = D.cos(decl) * D.cos(this.latitude);
    const cosRange = Math.max(-1, Math.min(1, p1 / p2));

    const t = (1 / 15) * D.arccos(cosRange);
    return noon + (direction === "ccw" ? -t : t);
  }

  private asrTime(factor: number, time: number): number {
    const decl = this.sunPosition(this.gregorianToJulianDate() + time).declination;
    const angle = -D.arccot(factor + D.tan(Math.abs(this.latitude - decl)));
    return this.sunAngleTime(angle, time);
  }

  private asrFactor(): number {
    if (this.asrShadowFactor != null) {
      return this.asrShadowFactor;
    }
    return this.school === "HANAFI" ? 2 : 1;
  }

  private riseSetAngle(): number {
    return 0.833 + 0.0347 * Math.sqrt(this.elevation);
  }

  // --- Formatting ---

  private tuneTimes(times: RawTimes): RawTimes {
    if (Object.keys(this.offset).length === 0) return times;
    const offsets = this.offset as Record<string, number | undefined>;
    for (const key of Object.keys(times)) {
      const off = offsets[key];
      if (off != null) {
        times[key] = times[key]! + off / 60;
      }
    }
    return times;
  }

  private modifyFormats(times: RawTimes): PrayerTimesResult {
    const result: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(times)) {
      result[key] = this.getFormattedTime(value, this.timeFormat);
    }
    return result as PrayerTimesResult;
  }

  private getFormattedTime(time: number, format: TimeFormat): string | number {
    if (Number.isNaN(time)) return INVALID_TIME;
    if (format === "Float") return time;
    if (format === "iso8601") return this.formatISO8601(time);

    const rounded = time + 0.5 / 60;
    const fixed = D.fixHour(rounded);
    const hours = Math.floor(fixed);
    const minutes = Math.floor((fixed - hours) * 60);

    if (format === "12h") {
      const suffix = hours < 12 ? "am" : "pm";
      const h12 = String(((hours + 12 - 1) % 12) + 1);
      return `${h12}:${this.twoDigits(minutes)} ${suffix}`;
    }

    return `${this.twoDigits(hours)}:${this.twoDigits(minutes)}`;
  }

  private formatISO8601(time: number): string {
    const totalMinutes = Math.round(time * 60);
    const dt = new Date(Date.UTC(
      this.date.getFullYear(), this.date.getMonth(), this.date.getDate(),
    ));
    dt.setUTCMinutes(dt.getUTCMinutes() + totalMinutes);

    const tzOffset = this.getTimezoneOffset();
    const absOff = Math.abs(tzOffset);
    const tzH = Math.floor(absOff);
    const tzM = Math.round((absOff - tzH) * 60);
    const tzSign = tzOffset >= 0 ? "+" : "-";
    const tz = `${tzSign}${this.twoDigits(tzH)}:${this.twoDigits(tzM)}`;

    const y = dt.getUTCFullYear();
    const mo = this.twoDigits(dt.getUTCMonth() + 1);
    const d = this.twoDigits(dt.getUTCDate());
    const h = this.twoDigits(dt.getUTCHours());
    const mi = this.twoDigits(dt.getUTCMinutes());

    return `${y}-${mo}-${d}T${h}:${mi}:00${tz}`;
  }

  private twoDigits(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  // --- Utility ---

  private isMin(value: string | number): boolean {
    return typeof value === "string" && value.includes("min");
  }

  private evaluate(value: string | number): number {
    if (typeof value === "number") return value;
    return Number.parseFloat(value);
  }

  private getTimezoneOffset(): number {
    if (this.timezone) {
      return this.resolveTimezoneOffset(this.date, this.timezone);
    }
    return -this.date.getTimezoneOffset() / 60;
  }

  private resolveTimezoneOffset(date: Date, tz: string): number {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = fmt.formatToParts(date);
    const get = (type: string): number => {
      const val = Number(parts.find((p) => p.type === type)?.value ?? 0);
      return type === "hour" && val === 24 ? 0 : val;
    };
    const localMs = Date.UTC(
      get("year"), get("month") - 1, get("day"),
      get("hour"), get("minute"), get("second"),
    );
    const utcMs = Date.UTC(
      date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(),
    );
    return (localMs - utcMs) / 3_600_000;
  }
}
