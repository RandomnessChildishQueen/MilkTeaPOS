import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { testConnection } from "#/db/index";
import { env } from "#/env";

import { flavors } from "#/routes/flavors";
import { addons } from "#/routes/addons";
import { upload } from "#/routes/upload";

const app = new Hono();

app
  .use(
    "/api/*",
    cors({
      origin: env.FRONTEND_URL,
    }),
  )
  .use("/images/*", serveStatic({ root: "./public" }));

const routes = app
  .route("/api", upload)
  .route("/api", flavors)
  .route("/api", addons);

app.get("/", (c) => {
  return c.text("It's alright.");
});

export type AppType = typeof routes;

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    9;
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

testConnection();
