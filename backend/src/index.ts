import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { buildRoutes } from "./routes/builds";
import { importRoutes } from "./routes/import";
import { partsRoutes } from "./routes/parts";
import { recommendRoutes } from "./routes/recommend";

const app = new Hono();

app.use(logger());
app.use("*", cors({ origin: (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",") }));

app.get("/health", (c) => c.json({ ok: true }));
app.route("/", partsRoutes);
app.route("/", recommendRoutes);
app.route("/", buildRoutes);
app.route("/", importRoutes);

const port = Number(process.env.PORT ?? 4000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});
