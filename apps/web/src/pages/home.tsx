import { html } from "hono/html";

const API = "https://api.praytime.io";

export function HomePage() {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Praytime</title>
        {html`<style>
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
          .subtitle { color: #666; font-size: 0.875rem; margin-top: 0.25rem; }
          .location { margin-top: 1.5rem; font-size: 0.875rem; color: #666; }
          .location span { color: #1a1a1a; font-weight: 500; }
          .method { margin-top: 1rem; }
          .controls { margin-top: 1rem; display: flex; gap: 0.75rem; align-items: center; }
          .controls select, .controls input[type="date"] {
            font-size: 0.8125rem;
            padding: 0.25rem 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fff;
            color: #333;
            cursor: pointer;
          }
          .times { margin-top: 1.5rem; width: 100%; max-width: 360px; }
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
          .error { margin-top: 1.5rem; font-size: 0.875rem; color: #b91c1c; }
          .loading { margin-top: 1.5rem; font-size: 0.875rem; color: #666; }
          nav { margin-top: 2rem; display: flex; gap: 1.5rem; font-size: 0.8125rem; }
          nav a { color: #666; text-decoration: none; }
          nav a:hover { color: #1a1a1a; }
          footer { margin-top: auto; padding-top: 3rem; font-size: 0.75rem; color: #999; }
        </style>`}
      </head>
      <body>
        <h1>Praytime</h1>
        <p class="subtitle" id="subtitle">Prayer times for today</p>
        <div class="location" id="loc"></div>
        <div class="controls" id="controls" hidden>
          <input type="date" id="date" />
          <select id="method"></select>
        </div>
        <div class="times" id="times">
          <div class="loading" id="loading">Detecting location...</div>
        </div>
        <div class="error" id="error" hidden></div>
        <nav>
          <a href="/docs">API Docs</a>
          <a href="https://github.com/dwekat/praytime">GitHub</a>
        </nav>
        <footer>praytime.io</footer>
        {html`<script>
          const API = "${API}";
          const PRAYERS = ["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"];
          const METHODS = {
            MAKKAH: "Umm al-Qura",
            MWL: "Muslim World League",
            ISNA: "ISNA",
            EGYPT: "Egyptian General Authority",
            KARACHI: "University of Islamic Sciences, Karachi",
            TEHRAN: "Institute of Geophysics, Tehran",
            JAFARI: "Shia Ithna-Ashari",
            GULF: "Gulf Region",
            KUWAIT: "Kuwait",
            QATAR: "Qatar",
            SINGAPORE: "MUIS, Singapore",
            FRANCE: "UOIF, France",
            TURKEY: "Diyanet, Turkey",
            RUSSIA: "Spiritual Administration of Muslims, Russia",
            MOONSIGHTING: "Moonsighting Committee",
            DUBAI: "IACAD, Dubai",
            JAKIM: "JAKIM, Malaysia",
            TUNISIA: "Ministry of Religious Affairs, Tunisia",
            ALGERIA: "Ministry of Religious Affairs, Algeria",
            KEMENAG: "KEMENAG, Indonesia",
            MOROCCO: "Ministry of Habous and Islamic Affairs, Morocco",
            PORTUGAL: "CRCFI, Portugal",
            JORDAN: "Ministry of Awqaf, Jordan",
          };

          let currentPos = null;

          async function init() {
            try {
              currentPos = await getPosition();
              setupControls();
              await loadTimes();
            } catch (e) {
              showError(e.message || "Could not detect location");
            }
          }

          function setupControls() {
            const dateEl = document.getElementById("date");
            dateEl.value = localDateStr(new Date());
            dateEl.addEventListener("change", () => loadTimes());

            const sel = document.getElementById("method");
            for (const [code, label] of Object.entries(METHODS)) {
              const opt = document.createElement("option");
              opt.value = code;
              opt.textContent = label;
              sel.appendChild(opt);
            }
            sel.value = "MAKKAH";
            sel.addEventListener("change", () => loadTimes());
            document.getElementById("controls").hidden = false;
          }

          function getPosition() {
            return new Promise((resolve, reject) => {
              if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
              navigator.geolocation.getCurrentPosition(
                (p) => resolve({
                  lat: p.coords.latitude,
                  lng: p.coords.longitude,
                  tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
                () => reject(new Error("Could not detect location. Please enable location access.")),
                { timeout: 5000 }
              );
            });
          }

          function localDateStr(d) {
            return d.getFullYear() + "-" +
              String(d.getMonth() + 1).padStart(2, "0") + "-" +
              String(d.getDate()).padStart(2, "0");
          }

          async function fetchTimes(lat, lng, date, tz, method) {
            const params = new URLSearchParams({
              latitude: String(lat),
              longitude: String(lng),
              date: date,
              format: "12h",
              method: method,
            });
            if (tz) params.set("timezone", tz);
            const r = await fetch(API + "/v1/times?" + params);
            if (!r.ok) throw new Error("API request failed");
            return await r.json();
          }

          function parseTime(t) {
            const m = t.match(/(\d+):(\d+)\s*(am|pm)/i);
            if (!m) return -1;
            let h = Number(m[1]);
            const min = Number(m[2]);
            const ap = m[3].toLowerCase();
            if (ap === "am" && h === 12) h = 0;
            if (ap === "pm" && h !== 12) h += 12;
            return h * 60 + min;
          }

          async function loadTimes() {
            const { lat, lng, tz } = currentPos;
            const method = document.getElementById("method").value;
            const date = document.getElementById("date").value;
            const data = await fetchTimes(lat, lng, date, tz, method);

            const now = new Date();
            const today = localDateStr(now);
            const isToday = date === today;
            document.getElementById("subtitle").textContent =
              isToday ? "Prayer times for today" : "Prayer times for " + date;

            let nextIdx = -1;
            if (isToday) {
              const nowMin = now.getHours() * 60 + now.getMinutes();
              for (let i = 0; i < PRAYERS.length; i++) {
                const t = data.times[PRAYERS[i]];
                if (t && parseTime(t) > nowMin) { nextIdx = i; break; }
              }
            }
            render(data, lat, lng, date, nextIdx);
          }

          function render(data, lat, lng, date, nextIdx) {
            document.getElementById("loc").innerHTML =
              escHtml(lat.toFixed(2) + ", " + lng.toFixed(2)) + " &middot; " + date;

            document.getElementById("times").innerHTML = PRAYERS.map((name, i) =>
              '<div class="row' + (i === nextIdx ? " active" : "") + '">' +
                '<span class="name">' + name + '</span>' +
                '<span class="time">' + escHtml(data.times[name] || "--:--") + '</span>' +
              '</div>'
            ).join("");
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
        </script>`}
      </body>
    </html>
  );
}
