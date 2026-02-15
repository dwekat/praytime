import { Hono } from "hono";
import { homePage } from "./pages/home";
import { docsPage } from "./pages/docs";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/", (c) => c.html(homePage()));
app.get("/docs", (c) => c.html(docsPage()));

export default app;
