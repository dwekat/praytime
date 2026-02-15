import { Hono } from "hono";
import { z } from "zod";
import { PrayerTimes, getMethodCodes } from "@prayer-times/core";
import type {
  CalculationMethod,
  LatitudeAdjustment,
  MidnightMode,
  School,
  Shafaq,
  TimeFormat,
} from "@prayer-times/core";

const methodCodes = getMethodCodes();

const querySchema = z.object({
  latitude: z.string().refine((v) => !Number.isNaN(Number(v)), "must be a number"),
  longitude: z.string().refine((v) => !Number.isNaN(Number(v)), "must be a number"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
  method: z.string().refine(
    (v) => methodCodes.includes(v as CalculationMethod),
    "unknown method",
  ).optional(),
  school: z.enum(["STANDARD", "HANAFI"]).optional(),
  timezone: z.string().optional(),
  latitudeAdjustment: z.enum(["MIDDLE_OF_THE_NIGHT", "ANGLE_BASED", "ONE_SEVENTH", "NONE"]).optional(),
  midnightMode: z.enum(["STANDARD", "JAFARI"]).optional(),
  format: z.enum(["24h", "12h", "12hNS", "Float", "iso8601"]).optional(),
  shafaq: z.enum(["general", "ahmer", "abyad"]).optional(),
});

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/v1/times", (c) => {
  const parsed = querySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
  }

  const q = parsed.data;
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

  return c.json({
    times,
    meta: pt.getMeta(),
  });
});

export default app;
