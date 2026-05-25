import { env } from "../env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  flavorsTable,
  variantsTable,
  flavorsRelations,
  variantsRelations,
} from "./schema";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 3,
});

pool.on("error", (err) => {
  console.error("Unexpected database client pool error: ", err);
});

export const db = drizzle({
  client: pool,
  schema: {
    flavors: flavorsTable,
    variants: variantsTable,
    flavorsRelations: flavorsRelations,
    variantsRelations: variantsRelations,
  },
});

export const testConnection = async () => {
  const res = await db.execute("SELECT NOW()");

  console.log(`Drizzle connection success! Server time: ${res.rows[0].now}`);
};
