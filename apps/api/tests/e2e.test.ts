import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { GenericContainer, type StartedTestContainer } from "testcontainers";

let container: StartedTestContainer;
let baseUrl: string;

beforeAll(async () => {
  const image = await GenericContainer.fromDockerfile("../../", "apps/api/Dockerfile").build();

  container = await image
    .withExposedPorts(3000)
    .withWaitStrategy(
      // @ts-expect-error -- testcontainers Wait import varies by version
      (await import("testcontainers")).Wait.forHttp("/health", 3000),
    )
    .start();

  const port = container.getMappedPort(3000);
  baseUrl = `http://localhost:${port}`;
}, 120_000);

afterAll(async () => {
  await container?.stop();
});

describe("e2e: GET /health", () => {
  test("returns 200 with status ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});

describe("e2e: GET /v1/times", () => {
  test("ISNA London 2014-04-24", async () => {
    const url = new URL(`${baseUrl}/v1/times`);
    url.searchParams.set("latitude", "51.508515");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("method", "ISNA");
    url.searchParams.set("timezone", "Europe/London");

    const res = await fetch(url);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.times.Fajr).toBe("03:57");
    expect(body.times.Sunrise).toBe("05:46");
    expect(body.times.Dhuhr).toBe("12:59");
    expect(body.times.Sunset).toBe("20:12");
    expect(body.times.Maghrib).toBe("20:12");
    expect(body.times.Isha).toBe("22:02");
    expect(body.meta.method.name).toBeDefined();
  });

  test("MOONSIGHTING with shafaq", async () => {
    const url = new URL(`${baseUrl}/v1/times`);
    url.searchParams.set("latitude", "51.508515");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("method", "MOONSIGHTING");
    url.searchParams.set("timezone", "Europe/London");
    url.searchParams.set("shafaq", "general");

    const res = await fetch(url);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.times.Fajr).toBe("04:04");
    expect(body.times.Isha).toBe("21:21");
  });

  test("missing required params returns 400", async () => {
    const url = new URL(`${baseUrl}/v1/times`);
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");

    const res = await fetch(url);
    expect(res.status).toBe(400);
  });

  test("invalid method returns 400", async () => {
    const url = new URL(`${baseUrl}/v1/times`);
    url.searchParams.set("latitude", "51.508515");
    url.searchParams.set("longitude", "-0.1254872");
    url.searchParams.set("date", "2014-04-24");
    url.searchParams.set("method", "INVALID_METHOD");

    const res = await fetch(url);
    expect(res.status).toBe(400);
  });
});
