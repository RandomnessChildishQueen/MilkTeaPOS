import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { testConnection } from "#/db/index";
import { env } from "#/env";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: env.FRONTEND_URL,
  }),
);

const routes = app.get("/", (c) => {
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
