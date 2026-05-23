import { Hono } from "hono";
import { db } from "#/db/index";
import { addonsTable } from "#/db/schema";
import { eq, like, ilike } from "drizzle-orm";
import { addonService } from "#/services/addonsServices";

export const addons = new Hono();

//get all addons
addons.get("/", async (c) => {
  const rows = await db.select().from(addonsTable);

  return c.json(rows);
});

//get a specific addon by name search
addons.get("/search", async (c) => {
  const query = c.req.query("name") || "";
  const results = await db
    .select()
    .from(addonsTable)
    .where(ilike(addonsTable.addon_name, `%${query}%`));
  return c.json(results);
});

//get a specific addon by id
addons.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [result] = await db
    .select()
    .from(addonsTable)
    .where(eq(addonsTable.addon_id, id));

  if (!result) {
    return c.json({ error: "addon code not found" }, 404);
  }

  return c.json(result);
});

//add an addon
addons.post("/add", async (c) => {
  try {
    const body = await c.req.json();
    const created = await addonService.createAddon(body);
    return c.json(created, 201);
  } catch (err: any) {
    if (err.message && err.message.includes("already exists")) {
      return c.json({ error: err.message }, 400);
    }
    return c.json({ error: "Failed to create add-on" }, 500);
  }
});

//update an addon
addons.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const [updatedAddon] = await db
    .update(addonsTable)
    .set(body)
    .where(eq(addonsTable.addon_id, id))
    .returning();

  if (!updatedAddon) {
    return c.json(
      { error: "Addon id not found. Can not proceed update." },
      404,
    );
  }

  return c.json(updatedAddon);
});

//toggle addon stock
addons.patch("/:id/stock", async (c) => {
  const addon_id = c.req.param("id");
  const [row] = await db
    .select({
      in_stock: addonsTable.in_stock,
    })
    .from(addonsTable)
    .where(eq(addonsTable.addon_id, addon_id));

  if (!row) {
    return c.json({ error: "Addon profile not found." }, 404);
  }

  const toggledStock = !row.in_stock;

  try {
    const [updatedAddon] = await db
      .update(addonsTable)
      .set({ in_stock: toggledStock })
      .where(eq(addonsTable.addon_id, addon_id))
      .returning();

    return c.json(updatedAddon);
  } catch (err) {
    return c.json(
      { error: "Transaction failure toggling addon stock status." },
      500,
    );
  }
});

//delete an addon
addons.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [deletedAddon] = await db
    .delete(addonsTable)
    .where(eq(addonsTable.addon_id, id))
    .returning();

  if (!deletedAddon) {
    return c.json(
      { error: "Addon id not found. Can not proceed update." },
      404,
    );
  }

  return c.json({
    success: true,
    message: `Deleted addon with id ${deletedAddon}`,
  });
});
