import { loadEnvFile } from "node:process";
loadEnvFile();

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) =>
          str.startsWith("postgres://") || str.startsWith("postgresql://"),
        "DATABASE_URL must start with postgres:// or postgresql://",
      ),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
