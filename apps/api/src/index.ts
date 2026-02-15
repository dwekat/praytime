import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { PrayerTimes } from "@praytime/core";
import type {
  CalculationMethod,
  LatitudeAdjustment,
  MidnightMode,
  School,
  Shafaq,
  TimeFormat,
} from "@praytime/core";

const methods = [
  "MWL", "ISNA", "EGYPT", "MAKKAH", "KARACHI", "TEHRAN", "JAFARI",
  "GULF", "KUWAIT", "QATAR", "SINGAPORE", "FRANCE", "TURKEY", "RUSSIA",
  "MOONSIGHTING", "DUBAI", "JAKIM", "TUNISIA", "ALGERIA", "KEMENAG",
  "MOROCCO", "PORTUGAL", "JORDAN", "CUSTOM",
] as const;

const timeValue = z.union([z.string(), z.number()]).openapi({ example: "05:22" });

const timesSchema = z.object({
  Imsak: timeValue,
  Fajr: timeValue,
  Sunrise: timeValue,
  Dhuhr: timeValue,
  Asr: timeValue,
  Sunset: timeValue,
  Maghrib: timeValue,
  Isha: timeValue,
  Midnight: timeValue,
  Firstthird: timeValue,
  Lastthird: timeValue,
});

const metaSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  method: z.object({
    id: z.number(),
    name: z.string(),
    params: z.record(z.union([z.number(), z.string()])),
    location: z.object({ latitude: z.number(), longitude: z.number() }).optional(),
  }),
  latitudeAdjustmentMethod: z.string(),
  midnightMode: z.string(),
  school: z.string(),
  offset: z.record(z.number().optional()),
});

const querySchema = z.object({
  latitude: z.string().refine((v) => !Number.isNaN(Number(v)), "must be a number").openapi({ example: "31.95" }),
  longitude: z.string().refine((v) => !Number.isNaN(Number(v)), "must be a number").openapi({ example: "35.93" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD").openapi({ example: "2026-02-15" }),
  method: z.enum(methods).optional().default("MWL").openapi({ description: "Calculation method" }),
  school: z.enum(["STANDARD", "HANAFI"]).optional().default("STANDARD").openapi({ description: "Juristic school for Asr" }),
  timezone: z.string().optional().openapi({ example: "Asia/Amman", description: "IANA timezone. Auto-detected if omitted." }),
  latitudeAdjustment: z.enum(["MIDDLE_OF_THE_NIGHT", "ANGLE_BASED", "ONE_SEVENTH", "NONE"]).optional().default("ANGLE_BASED").openapi({ description: "High-latitude adjustment method" }),
  midnightMode: z.enum(["STANDARD", "JAFARI"]).optional().openapi({ description: "How midnight is computed" }),
  format: z.enum(["24h", "12h", "12hNS", "Float", "iso8601"]).optional().default("24h").openapi({ description: "Time output format" }),
  shafaq: z.enum(["general", "ahmer", "abyad"]).optional().openapi({ description: "Shafaq type for Moonsighting method" }),
});

const timesRoute = createRoute({
  method: "get",
  path: "/v1/times",
  operationId: "getPrayerTimes",
  summary: "Get prayer times for a location and date",
  request: { query: querySchema },
  responses: {
    200: {
      description: "Prayer times with calculation metadata",
      content: { "application/json": { schema: z.object({ times: timesSchema, meta: metaSchema }) } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: z.object({ error: z.record(z.array(z.string())) }) } },
    },
  },
});

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  operationId: "healthCheck",
  summary: "Health check",
  responses: {
    200: {
      description: "Service is healthy",
      content: { "application/json": { schema: z.object({ status: z.string().openapi({ example: "ok" }) }) } },
    },
  },
});

const app = new OpenAPIHono();

app.use("*", cors());

app.openapi(healthRoute, (c) => c.json({ status: "ok" }, 200));

app.openapi(timesRoute, (c) => {
  const q = c.req.valid("query");
  const [year, month, day] = q.date.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const method = (q.method ?? "MWL") as CalculationMethod;
  const school = (q.school ?? "STANDARD") as School;
  const pt = new PrayerTimes(method, school);

  if (q.shafaq) {
    pt.setShafaq(q.shafaq as Shafaq);
  }

  const times = pt.getTimes(
    date,
    q.latitude,
    q.longitude,
    null,
    (q.latitudeAdjustment ?? "ANGLE_BASED") as LatitudeAdjustment,
    (q.midnightMode as MidnightMode) ?? null,
    (q.format ?? "24h") as TimeFormat,
    q.timezone ?? null,
  );

  return c.json({ times, meta: pt.getMeta() }, 200);
});

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Praytime API",
    description: "Islamic prayer time calculation API supporting 24 methods, multiple schools, and high-latitude adjustments.",
    version: "1.0.0",
    license: { name: "GPL-3.0-or-later", url: "https://www.gnu.org/licenses/gpl-3.0.html" },
  },
  servers: [{ url: "https://api.praytime.io", description: "Production" }],
});

export default app;
