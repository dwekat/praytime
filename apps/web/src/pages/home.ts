const API = "https://api.praytime.io";

export function homePage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Praytime</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #fafafa;
      color: #1a1a1a;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1rem;
    }
    h1 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; }
    .subtitle {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    .location {
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #666;
    }
    .location span { color: #1a1a1a; font-weight: 500; }
    .times {
      margin-top: 1.5rem;
      width: 100%;
      max-width: 360px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
      font-size: 0.9375rem;
    }
    .row:last-child { border-bottom: none; }
    .row .name { color: #444; }
    .row .time { font-weight: 500; font-variant-numeric: tabular-nums; }
    .row.active { color: #1a1a1a; font-weight: 600; }
    .row.active .name { color: #1a1a1a; }
    .error {
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #b91c1c;
    }
    .loading {
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #666;
    }
    nav {
      margin-top: 2rem;
      display: flex;
      gap: 1.5rem;
      font-size: 0.8125rem;
    }
    nav a { color: #666; text-decoration: none; }
    nav a:hover { color: #1a1a1a; }
    footer {
      margin-top: auto;
      padding-top: 3rem;
      font-size: 0.75rem;
      color: #999;
    }
  </style>
</head>
<body>
  <h1>Praytime</h1>
  <p class="subtitle">Prayer times for today</p>
  <div class="location" id="loc"></div>
  <div class="times" id="times">
    <div class="loading" id="loading">Detecting location...</div>
  </div>
  <div class="error" id="error" hidden></div>
  <nav>
    <a href="/docs">API Docs</a>
    <a href="https://github.com/dwekat/praytime">GitHub</a>
  </nav>
  <footer>praytime.io</footer>

  <script>
    const API = "${API}";
    const PRAYERS = ["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"];

    async function init() {
      try {
        const pos = await getPosition();
        await fetchAndRender(pos.lat, pos.lng, pos.city, pos.tz);
      } catch (e) {
        showError(e.message || "Could not detect location");
      }
    }

    function getPosition() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return fallbackGeo().then(resolve, reject);
        navigator.geolocation.getCurrentPosition(
          (p) => {
            resolve({
              lat: p.coords.latitude,
              lng: p.coords.longitude,
              tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
              city: null,
            });
          },
          () => fallbackGeo().then(resolve, reject),
          { timeout: 5000 }
        );
      });
    }

    async function fallbackGeo() {
      const r = await fetch("https://ipapi.co/json/");
      if (!r.ok) throw new Error("Location detection failed");
      const d = await r.json();
      return { lat: d.latitude, lng: d.longitude, city: d.city, tz: d.timezone };
    }

    async function fetchAndRender(lat, lng, city, tz) {
      const today = new Date().toISOString().slice(0, 10);
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lng),
        date: today,
      });
      if (tz) params.set("timezone", tz);

      const r = await fetch(API + "/v1/times?" + params);
      if (!r.ok) throw new Error("API request failed");
      const data = await r.json();

      const loc = document.getElementById("loc");
      if (city) {
        loc.innerHTML = '<span>' + escHtml(city) + '</span> &middot; ' + today;
      } else {
        loc.innerHTML = escHtml(lat.toFixed(2) + ', ' + lng.toFixed(2)) + ' &middot; ' + today;
      }

      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      let nextIdx = -1;
      const rows = PRAYERS.map((name, i) => {
        const t = data.times[name];
        if (nextIdx < 0 && t) {
          const [h, m] = t.split(":").map(Number);
          if (h * 60 + m > nowMin) nextIdx = i;
        }
        return { name, time: t };
      });

      const container = document.getElementById("times");
      container.innerHTML = rows
        .map((r, i) =>
          '<div class="row' + (i === nextIdx ? " active" : "") + '">' +
            '<span class="name">' + r.name + '</span>' +
            '<span class="time">' + escHtml(r.time || "--:--") + '</span>' +
          '</div>'
        )
        .join("");
    }

    function showError(msg) {
      document.getElementById("loading").hidden = true;
      const el = document.getElementById("error");
      el.textContent = msg;
      el.hidden = false;
    }

    function escHtml(s) {
      const d = document.createElement("div");
      d.textContent = s;
      return d.innerHTML;
    }

    init();
  </script>
</body>
</html>`;
}
