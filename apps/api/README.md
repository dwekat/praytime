# Praytime API

REST API server for Islamic prayer time calculations, built on Hono.

## Run locally

```sh
# with Docker
docker compose up

# or directly
cd apps/api && bun run dev
```

The server listens on port `3000`.

## `GET /health`

```sh
curl http://localhost:3000/health
```

```json
{ "status": "ok" }
```

## `GET /v1/times`

```sh
curl "http://localhost:3000/v1/times?latitude=51.5085&longitude=-0.1255&date=2024-04-24"
```

### Query parameters

| Parameter | Required | Default | Description |
|---|---|---|---|
| `latitude` | yes | — | Latitude (-90 to 90) |
| `longitude` | yes | — | Longitude (-180 to 180) |
| `date` | yes | — | `YYYY-MM-DD` |
| `method` | no | `MWL` | Calculation method code |
| `school` | no | `STANDARD` | `STANDARD` or `HANAFI` |
| `timezone` | no | auto | IANA timezone |
| `latitudeAdjustment` | no | `ANGLE_BASED` | `ANGLE_BASED`, `MIDDLE_OF_THE_NIGHT`, `ONE_SEVENTH`, `NONE` |
| `midnightMode` | no | `STANDARD` | `STANDARD` or `JAFARI` |
| `format` | no | `24h` | `24h`, `12h`, `12hNS`, `Float`, `iso8601` |
| `shafaq` | no | `general` | `general`, `ahmer`, `abyad` (Moonsighting only) |

### Response

```json
{
  "times": {
    "Imsak": "03:57",
    "Fajr": "04:07",
    "Sunrise": "05:42",
    "Dhuhr": "12:58",
    "Asr": "16:42",
    "Sunset": "20:14",
    "Maghrib": "20:14",
    "Isha": "21:32",
    "Midnight": "00:58",
    "Firstthird": "23:30",
    "Lastthird": "02:26"
  },
  "meta": {
    "latitude": 51.5085,
    "longitude": -0.1255,
    "timezone": "Europe/London",
    "method": {
      "id": 3,
      "name": "Muslim World League",
      "params": { "Fajr": 18, "Isha": 17 }
    },
    "latitudeAdjustmentMethod": "ANGLE_BASED",
    "midnightMode": "STANDARD",
    "school": "STANDARD",
    "offset": {}
  }
}
```

### Errors

Invalid requests return `400` with field-level messages:

```json
{
  "error": {
    "date": ["must be YYYY-MM-DD"]
  }
}
```
