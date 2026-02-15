/** All supported calculation method codes */
export type CalculationMethod =
  | "MWL"
  | "ISNA"
  | "EGYPT"
  | "MAKKAH"
  | "KARACHI"
  | "TEHRAN"
  | "JAFARI"
  | "GULF"
  | "KUWAIT"
  | "QATAR"
  | "SINGAPORE"
  | "FRANCE"
  | "TURKEY"
  | "RUSSIA"
  | "MOONSIGHTING"
  | "DUBAI"
  | "JAKIM"
  | "TUNISIA"
  | "ALGERIA"
  | "KEMENAG"
  | "MOROCCO"
  | "PORTUGAL"
  | "JORDAN"
  | "CUSTOM";

/** Juristic school for Asr shadow factor */
export type School = "STANDARD" | "HANAFI";

/** How midnight is computed */
export type MidnightMode = "STANDARD" | "JAFARI";

/** Higher latitude adjustment methods */
export type LatitudeAdjustment =
  | "MIDDLE_OF_THE_NIGHT"
  | "ANGLE_BASED"
  | "ONE_SEVENTH"
  | "NONE";

/** Output time format */
export type TimeFormat = "24h" | "12h" | "12hNS" | "Float" | "iso8601";

/** Prayer name keys used throughout the system */
export type PrayerName =
  | "Imsak"
  | "Fajr"
  | "Sunrise"
  | "Dhuhr"
  | "Asr"
  | "Sunset"
  | "Maghrib"
  | "Isha"
  | "Midnight"
  | "Firstthird"
  | "Lastthird";

/** Raw prayer times as floating-point hours */
export type RawTimes = Record<string, number>;

/** Formatted prayer time results */
export type PrayerTimesResult = Record<PrayerName, string | number>;

/** Method configuration */
export interface MethodConfig {
  readonly id: number;
  readonly name: string;
  readonly params: Readonly<Record<string, number | string>>;
  readonly location?: Readonly<{
    latitude: number;
    longitude: number;
  }>;
}

/** Per-prayer minute offsets for tuning */
export interface TuneOffsets {
  readonly Imsak?: number;
  readonly Fajr?: number;
  readonly Sunrise?: number;
  readonly Dhuhr?: number;
  readonly Asr?: number;
  readonly Maghrib?: number;
  readonly Sunset?: number;
  readonly Isha?: number;
  readonly Midnight?: number;
}

/** Sun position data */
export interface SunPosition {
  readonly declination: number;
  readonly equation: number;
}

/** Calculation settings derived from method params */
export interface CalculationSettings {
  Imsak: string | number;
  Fajr: number;
  Dhuhr: string;
  Isha: number | string;
  Maghrib: string | number;
}

/** Meta information about a calculation */
export interface CalculationMeta {
  readonly latitude: number;
  readonly longitude: number;
  readonly timezone: string;
  readonly method: MethodConfig;
  readonly latitudeAdjustmentMethod: LatitudeAdjustment;
  readonly midnightMode: MidnightMode;
  readonly school: School;
  readonly offset: TuneOffsets;
}
