import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { testConnection } from "#/db/index";

const app = new Hono();

app.get("/", (c) => {
  return c.text("It's alright.");
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

testConnection();
