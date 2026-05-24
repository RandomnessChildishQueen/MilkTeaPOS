import { Hono } from "hono";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export const upload = new Hono().post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["image"] as File;

  if (!file) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  const uploadDir = join(process.cwd(), "public", "images");
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = join(uploadDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return c.json({ url: `/images/${fileName}` });
});
