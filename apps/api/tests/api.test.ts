import { describe, test, expect, beforeAll, afterAll } from "bun:test";

let app: { fetch: (req: Request) => Promise<Response> };

beforeAll(async () => {
  const mod = await import("../src/index");
  app = mod.default;
});

describe("GET /health", () => {
  test("returns 200 with status ok", async () => {
    const res = await app.fetch(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});

describe("GET /v1/times", () => {
  test("ISNA London 2014-04-24", async () => {
    const url = new URL("http://localhost/v1/times");
    url.searchParams.set("latitude", "51.508515");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("method", "ISNA");
    url.searchParams.set("timezone", "Europe/London");

    const res = await app.fetch(new Request(url));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.times.Fajr).toBe("03:57");
    expect(body.times.Sunrise).toBe("05:46");
    expect(body.times.Dhuhr).toBe("12:59");
    expect(body.times.Asr).toBe("16:55");
    expect(body.times.Sunset).toBe("20:12");
    expect(body.times.Maghrib).toBe("20:12");
    expect(body.times.Isha).toBe("22:02");
    expect(body.meta.method.name).toBeDefined();
  });

  test("MOONSIGHTING London with shafaq", async () => {
    const url = new URL("http://localhost/v1/times");
    url.searchParams.set("latitude", "51.508515");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("method", "MOONSIGHTING");
    url.searchParams.set("timezone", "Europe/London");
    url.searchParams.set("shafaq", "general");

    const res = await app.fetch(new Request(url));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.times.Fajr).toBe("04:04");
    expect(body.times.Isha).toBe("21:21");
  });

  test("ISO8601 format", async () => {
    const url = new URL("http://localhost/v1/times");
    url.searchParams.set("latitude", "51.508515");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("method", "ISNA");
    url.searchParams.set("timezone", "Europe/London");
    url.searchParams.set("format", "iso8601");

    const res = await app.fetch(new Request(url));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.times.Fajr).toBe("2014-04-24T03:57:00+01:00");
  });

  test("missing latitude returns 400", async () => {
    const url = new URL("http://localhost/v1/times");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("method", "ISNA");

    const res = await app.fetch(new Request(url));
    expect(res.status).toBe(400);
  });

  test("invalid latitude returns 400", async () => {
    const url = new URL("http://localhost/v1/times");
    url.searchParams.set("latitude", "abc");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("method", "ISNA");

    const res = await app.fetch(new Request(url));
    expect(res.status).toBe(400);
  });

  test("invalid method returns 400", async () => {
    const url = new URL("http://localhost/v1/times");
    url.searchParams.set("latitude", "51.508515");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("method", "INVALID_METHOD");

    const res = await app.fetch(new Request(url));
    expect(res.status).toBe(400);
  });

  test("defaults work (no method, no format)", async () => {
    const url = new URL("http://localhost/v1/times");
    url.searchParams.set("latitude", "51.508515");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("timezone", "Europe/London");

    const res = await app.fetch(new Request(url));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.times.Fajr).toBeDefined();
  });
});
