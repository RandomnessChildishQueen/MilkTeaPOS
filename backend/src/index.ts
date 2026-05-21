import { serve } from "@hono/node-server";
import { Hono } from "hono";

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!);

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

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
