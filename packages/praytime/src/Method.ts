import type { CalculationMethod, MethodConfig } from "./types";
import { SHAFAQ_GENERAL } from "./moonsighting";

// Prayer name constants used as param keys
const FAJR = "Fajr";
const ISHA = "Isha";
const MAGHRIB = "Maghrib";
const MIDNIGHT = "Midnight";

/** All method code constants */
export const METHOD_MWL: CalculationMethod = "MWL";
export const METHOD_ISNA: CalculationMethod = "ISNA";
export const METHOD_EGYPT: CalculationMethod = "EGYPT";
export const METHOD_MAKKAH: CalculationMethod = "MAKKAH";
export const METHOD_KARACHI: CalculationMethod = "KARACHI";
export const METHOD_TEHRAN: CalculationMethod = "TEHRAN";
export const METHOD_JAFARI: CalculationMethod = "JAFARI";
export const METHOD_GULF: CalculationMethod = "GULF";
export const METHOD_KUWAIT: CalculationMethod = "KUWAIT";
export const METHOD_QATAR: CalculationMethod = "QATAR";
export const METHOD_SINGAPORE: CalculationMethod = "SINGAPORE";
export const METHOD_FRANCE: CalculationMethod = "FRANCE";
export const METHOD_TURKEY: CalculationMethod = "TURKEY";
export const METHOD_RUSSIA: CalculationMethod = "RUSSIA";
export const METHOD_MOONSIGHTING: CalculationMethod = "MOONSIGHTING";
export const METHOD_DUBAI: CalculationMethod = "DUBAI";
export const METHOD_JAKIM: CalculationMethod = "JAKIM";
export const METHOD_TUNISIA: CalculationMethod = "TUNISIA";
export const METHOD_ALGERIA: CalculationMethod = "ALGERIA";
export const METHOD_KEMENAG: CalculationMethod = "KEMENAG";
export const METHOD_MOROCCO: CalculationMethod = "MOROCCO";
export const METHOD_PORTUGAL: CalculationMethod = "PORTUGAL";
export const METHOD_JORDAN: CalculationMethod = "JORDAN";
export const METHOD_CUSTOM: CalculationMethod = "CUSTOM";

/** Returns all valid method codes */
export function getMethodCodes(): readonly CalculationMethod[] {
  return [
    METHOD_MWL, METHOD_ISNA, METHOD_EGYPT, METHOD_MAKKAH,
    METHOD_KARACHI, METHOD_TEHRAN, METHOD_JAFARI, METHOD_GULF,
    METHOD_KUWAIT, METHOD_QATAR, METHOD_SINGAPORE, METHOD_FRANCE,
    METHOD_TURKEY, METHOD_RUSSIA, METHOD_MOONSIGHTING, METHOD_DUBAI,
    METHOD_JAKIM, METHOD_TUNISIA, METHOD_ALGERIA, METHOD_KEMENAG,
    METHOD_MOROCCO, METHOD_PORTUGAL, METHOD_JORDAN, METHOD_CUSTOM,
  ];
}

/** Returns configuration for all calculation methods */
export function getMethods(): Record<CalculationMethod, MethodConfig> {
  return {
    MWL: {
      id: 3,
      name: "Muslim World League",
      params: { [FAJR]: 18, [ISHA]: 17 },
      location: { latitude: 51.5194682, longitude: -0.1360365 },
    },
    ISNA: {
      id: 2,
      name: "Islamic Society of North America (ISNA)",
      params: { [FAJR]: 15, [ISHA]: 15 },
      location: { latitude: 39.70421229999999, longitude: -86.39943869999999 },
    },
    EGYPT: {
      id: 5,
      name: "Egyptian General Authority of Survey",
      params: { [FAJR]: 19.5, [ISHA]: 17.5 },
      location: { latitude: 30.0444196, longitude: 31.2357116 },
    },
    MAKKAH: {
      id: 4,
      name: "Umm Al-Qura University, Makkah",
      params: { [FAJR]: 18.5, [ISHA]: "90 min" },
      location: { latitude: 21.3890824, longitude: 39.8579118 },
    },
    KARACHI: {
      id: 1,
      name: "University of Islamic Sciences, Karachi",
      params: { [FAJR]: 18, [ISHA]: 18 },
      location: { latitude: 24.8614622, longitude: 67.0099388 },
    },
    TEHRAN: {
      id: 7,
      name: "Institute of Geophysics, University of Tehran",
      params: { [FAJR]: 17.7, [ISHA]: 14, [MAGHRIB]: 4.5, [MIDNIGHT]: "JAFARI" },
      location: { latitude: 35.6891975, longitude: 51.3889736 },
    },
    JAFARI: {
      id: 0,
      name: "Shia Ithna-Ashari, Leva Institute, Qum",
      params: { [FAJR]: 16, [ISHA]: 14, [MAGHRIB]: 4, [MIDNIGHT]: "JAFARI" },
      location: { latitude: 34.6415764, longitude: 50.8746035 },
    },
    GULF: {
      id: 8,
      name: "Gulf Region",
      params: { [FAJR]: 19.5, [ISHA]: "90 min" },
      location: { latitude: 24.1323638, longitude: 53.3199527 },
    },
    KUWAIT: {
      id: 9,
      name: "Kuwait",
      params: { [FAJR]: 18, [ISHA]: 17.5 },
      location: { latitude: 29.375859, longitude: 47.9774052 },
    },
    QATAR: {
      id: 10,
      name: "Qatar",
      params: { [FAJR]: 18, [ISHA]: "90 min" },
      location: { latitude: 25.2854473, longitude: 51.5310398 },
    },
    SINGAPORE: {
      id: 11,
      name: "Majlis Ugama Islam Singapura, Singapore",
      params: { [FAJR]: 20, [ISHA]: 18 },
      location: { latitude: 1.352083, longitude: 103.819836 },
    },
    FRANCE: {
      id: 12,
      name: "Union Organization Islamic de France",
      params: { [FAJR]: 12, [ISHA]: 12 },
      location: { latitude: 48.856614, longitude: 2.3522219 },
    },
    TURKEY: {
      id: 13,
      name: "Diyanet İşleri Başkanlığı, Turkey (experimental)",
      params: { [FAJR]: 18, [ISHA]: 17 },
      location: { latitude: 39.9333635, longitude: 32.8597419 },
    },
    RUSSIA: {
      id: 14,
      name: "Spiritual Administration of Muslims of Russia",
      params: { [FAJR]: 16, [ISHA]: 15 },
      location: { latitude: 54.73479099999999, longitude: 55.9578555 },
    },
    MOONSIGHTING: {
      id: 15,
      name: "Moonsighting Committee Worldwide (Moonsighting.com)",
      params: { shafaq: SHAFAQ_GENERAL },
    },
    DUBAI: {
      id: 16,
      name: "Dubai (experimental)",
      params: { [FAJR]: 18.2, [ISHA]: 18.2 },
      location: { latitude: 25.0762677, longitude: 55.087404 },
    },
    JAKIM: {
      id: 17,
      name: "Jabatan Kemajuan Islam Malaysia (JAKIM)",
      params: { [FAJR]: 20, [ISHA]: 18 },
      location: { latitude: 3.139003, longitude: 101.686855 },
    },
    TUNISIA: {
      id: 18,
      name: "Tunisia",
      params: { [FAJR]: 18, [ISHA]: 18 },
      location: { latitude: 36.8064948, longitude: 10.1815316 },
    },
    ALGERIA: {
      id: 19,
      name: "Algeria",
      params: { [FAJR]: 18, [ISHA]: 17 },
      location: { latitude: 36.753768, longitude: 3.0587561 },
    },
    KEMENAG: {
      id: 20,
      name: "Kementerian Agama Republik Indonesia",
      params: { [FAJR]: 20, [ISHA]: 18 },
      location: { latitude: -6.2087634, longitude: 106.845599 },
    },
    MOROCCO: {
      id: 21,
      name: "Morocco",
      params: { [FAJR]: 19, [ISHA]: 17 },
      location: { latitude: 33.9715904, longitude: -6.8498129 },
    },
    PORTUGAL: {
      id: 22,
      name: "Comunidade Islamica de Lisboa",
      params: { [FAJR]: 18, [MAGHRIB]: "3 min", [ISHA]: "77 min" },
      location: { latitude: 38.7222524, longitude: -9.1393366 },
    },
    JORDAN: {
      id: 23,
      name: "Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan",
      params: { [FAJR]: 18, [MAGHRIB]: "5 min", [ISHA]: 18 },
      location: { latitude: 31.9461222, longitude: 35.923844 },
    },
    CUSTOM: {
      id: 99,
      name: "Custom",
      params: { [FAJR]: 15, [ISHA]: 15 },
    },
  };
}

/**
 * Custom method configuration builder.
 * Used when METHOD_CUSTOM is selected to override default params.
 */
export class CustomMethod {
  readonly name: string;
  readonly params: Record<string, number | string>;

  constructor(name = "Custom") {
    this.name = name;
    this.params = { [FAJR]: 15, [ISHA]: 15 };
  }

  setFajrAngle(angle: number): void {
    this.params[FAJR] = angle;
  }

  setMaghribAngleOrMins(value: number | string): void {
    this.params[MAGHRIB] = value;
  }

  setIshaAngleOrMins(value: number | string): void {
    this.params[ISHA] = value;
  }
}
