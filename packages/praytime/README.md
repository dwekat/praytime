# @praytime/core

TypeScript prayer time calculation engine supporting 24 methods, including MoonSighting.com Fajr/Isha.

## Install

```sh
npm install @praytime/core
```

## Basic usage

```ts
import { PrayerTimes } from "@praytime/core";

const pt = new PrayerTimes("MWL");
const times = pt.getTimes(new Date(), 51.5085, -0.1255);

console.log(times.Fajr);    // "04:30"
console.log(times.Dhuhr);   // "12:45"
console.log(times.Maghrib); // "19:10"
```

## Constructor

```ts
new PrayerTimes(method?, school?, asrShadowFactor?)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `method` | `CalculationMethod` | `"MWL"` | One of the 24 calculation methods below |
| `school` | `School` | `"STANDARD"` | `"STANDARD"` (Shafi/Maliki/Hanbali) or `"HANAFI"` |
| `asrShadowFactor` | `number \| null` | `null` | Custom Asr shadow multiplier (overrides school) |

## getTimes()

```ts
pt.getTimes(date, latitude, longitude, elevation?, latitudeAdjustment?, midnightMode?, format?, timezone?)
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | — | Date to calculate for |
| `latitude` | `number \| string` | — | Latitude (-90 to 90) |
| `longitude` | `number \| string` | — | Longitude (-180 to 180) |
| `elevation` | `number \| null` | `null` | Elevation in meters |
| `latitudeAdjustment` | `LatitudeAdjustment` | `"ANGLE_BASED"` | High-latitude correction |
| `midnightMode` | `MidnightMode \| null` | `null` | `"STANDARD"` or `"JAFARI"` |
| `format` | `TimeFormat` | `"24h"` | Output format (see below) |
| `timezone` | `string \| null` | `null` | IANA timezone (e.g. `"Europe/London"`) |

**Returns** an object with: `Imsak`, `Fajr`, `Sunrise`, `Dhuhr`, `Asr`, `Sunset`, `Maghrib`, `Isha`, `Midnight`, `Firstthird`, `Lastthird`.

## Time formats

| Format | Example |
|---|---|
| `"24h"` | `"04:30"` |
| `"12h"` | `"4:30 am"` |
| `"12hNS"` | `"4:30"` (no suffix) |
| `"Float"` | `4.5` |
| `"iso8601"` | `"2024-04-24T04:30:00+01:00"` |

## Tune offsets

Apply per-prayer minute adjustments:

```ts
pt.tune({ Fajr: 2, Isha: -3 });
```

## Moonsighting.com method

```ts
import { PrayerTimes, SHAFAQ_GENERAL, SHAFAQ_AHMER, SHAFAQ_ABYAD } from "@praytime/core";

const pt = new PrayerTimes("MOONSIGHTING");
pt.setShafaq(SHAFAQ_AHMER); // red twilight for Isha
const times = pt.getTimes(new Date(), 51.5085, -0.1255);
```

## Custom method

```ts
import { PrayerTimes, CustomMethod } from "@praytime/core";

const pt = new PrayerTimes("CUSTOM");
pt.setCustomMethod(CustomMethod({ Fajr: 18, Isha: 17 }));
```

## Calculation methods

| Code | Authority | Region |
|---|---|---|
| `MWL` | Muslim World League | London |
| `ISNA` | Islamic Society of North America | Indianapolis |
| `EGYPT` | Egyptian General Authority | Cairo |
| `MAKKAH` | Umm Al-Qura University | Makkah |
| `KARACHI` | University of Islamic Sciences | Karachi |
| `TEHRAN` | Institute of Geophysics | Tehran |
| `JAFARI` | Shia Ithna-Ashari | Qum |
| `GULF` | Gulf Region | Gulf |
| `KUWAIT` | Kuwait | Kuwait |
| `QATAR` | Qatar | Qatar |
| `SINGAPORE` | MUIS Singapore | Singapore |
| `FRANCE` | Union of Islamic Orgs of France | Paris |
| `TURKEY` | Diyanet | Ankara |
| `RUSSIA` | Spiritual Admin of Muslims | Moscow |
| `MOONSIGHTING` | Moonsighting.com | Dynamic |
| `DUBAI` | Dubai | Dubai |
| `JAKIM` | JAKIM Malaysia | Malaysia |
| `TUNISIA` | Tunisia | Tunis |
| `ALGERIA` | Algeria | Algiers |
| `KEMENAG` | Kemenag Indonesia | Jakarta |
| `MOROCCO` | Morocco | Rabat |
| `PORTUGAL` | Comunidade Islamica | Lisbon |
| `JORDAN` | Ministry of Awqaf | Amman |
| `CUSTOM` | User-defined | — |
