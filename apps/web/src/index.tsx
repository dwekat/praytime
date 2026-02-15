import { Hono } from "hono";
import { HomePage } from "./pages/home";
import { DocsPage } from "./pages/docs";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/", (c) => c.html(<HomePage />));
app.get("/docs", (c) => c.html(<DocsPage />));

export default app;
