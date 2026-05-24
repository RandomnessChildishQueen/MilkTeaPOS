import { Hono } from "hono";
import { db } from "#/db/index";
import { flavorsTable, variantsTable } from "#/db/schema";
import { eq, ilike } from "drizzle-orm";
import { flavorService } from "#/services/flavorsServices";

export const flavors = new Hono()
  //get all fields of flavors
  /* .get("/", async (c) => {
    const rows = await db.select().from(flavorsTable);
    return c.json(rows);
    })*/
  //get all flavors with only the necessary columns
  .get("/flavor/all", async (c) => {
    const rows = await flavorService.fetchFlavors();
    return c.json(rows);
  })
  //get a specific flavor by name search
  .get("/flavor/search", async (c) => {
    const query = c.req.query("name") || "";
    const results = await db
      .select()
      .from(flavorsTable)
      .where(ilike(flavorsTable.flavor_name, `%${query}%`));
    return c.json(results);
  })

  //get cup sizes
  .get("/flavor/sizes", async (c) => {
    try {
      const sizes = await flavorService.fetchSizes();
      return c.json(sizes);
    } catch (err) {
      return c.json({ error: "Failed to fetch sizes" }, 500);
    }
  })

  //add a flavor
  .post("/flavor/add", async (c) => {
    try {
      const body = await c.req.json();
      const created = await flavorService.createFlavor(body);
      return c.json(created, 201);
    } catch (err: any) {
      if (err.message && err.message.includes("already exists")) {
        return c.json({ error: err.message }, 400);
      }
      return c.json({ error: "Failed to create flavor" }, 500);
    }
  })

  //add a cup size
  .post("/flavor/addsize", async (c) => {
    try {
      const { newSize, flavorPrices } = await c.req.json<{
        newSize: string;
        flavorPrices: { flavor_id: string; price: string }[];
      }>();

      if (!newSize || !flavorPrices || flavorPrices.length === 0) {
        return c.json({ error: "Invalid payload data structure." }, 400);
      }

      const targetUpgrades = await flavorService.addSize(newSize, flavorPrices);
      return c.json(targetUpgrades, 201);
    } catch (err) {
      return c.json({ error: "Failed to add sizes" }, 500);
    }
  })

  //get a specific flavor by id
  .get("/flavor/:id", async (c) => {
    const id = c.req.param("id");
    const [result] = await db
      .select()
      .from(flavorsTable)
      .where(eq(flavorsTable.flavor_id, id));

    if (!result) {
      return c.json({ error: "Flavor code not found" }, 404);
    }

    return c.json(result);
  })

  //update a flavor
  .put("/flavor/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    const [updatedFlavor] = await db
      .update(flavorsTable)
      .set(body)
      .where(eq(flavorsTable.flavor_id, id))
      .returning();

    if (!updatedFlavor) {
      return c.json(
        { error: "Flavor id not found. Can not proceed update." },
        404,
      );
    }

    return c.json(updatedFlavor);
  })

  //toggle flavor stock
  .patch("/flavor/:id/stock", async (c) => {
    const flavor_id = c.req.param("id");
    const [row] = await db
      .select({
        in_stock: flavorsTable.in_stock,
      })
      .from(flavorsTable)
      .where(eq(flavorsTable.flavor_id, flavor_id));

    if (!row) {
      return c.json({ error: "Flavor profile not found." }, 404);
    }

    const toggledStock = !row.in_stock;

    try {
      const updatedFlavorVariant = await db.transaction(async (tx) => {
        const [updatedFlavor] = await tx
          .update(flavorsTable)
          .set({ in_stock: toggledStock })
          .where(eq(flavorsTable.flavor_id, flavor_id))
          .returning();

        const updatedVariants = await tx
          .update(variantsTable)
          .set({ in_stock: toggledStock })
          .where(eq(variantsTable.flavor_id, flavor_id))
          .returning();

        return { updatedFlavor, updatedVariants };
      });

      return c.json(updatedFlavorVariant);
    } catch (err) {
      return c.json(
        { error: "Transaction failure toggling flavor stock status." },
        500,
      );
    }
  })

  //set cup size out of stock
  .patch("/flavor/sizes/:sizeName/stock", async (c) => {
    const sizeName = c.req.param("sizeName");

    const existingVariants = await db
      .select({ in_stock: variantsTable.in_stock })
      .from(variantsTable)
      .where(eq(variantsTable.size, sizeName));

    if (existingVariants.length === 0) {
      return c.json(
        { error: "No variations found matching the specified size name." },
        404,
      );
    }

    const isAnyVariantInStock = existingVariants.some(
      (variant) => variant.in_stock,
    );
    const toggledStock = !isAnyVariantInStock;

    const updatedVariants = await db
      .update(variantsTable)
      .set({ in_stock: toggledStock })
      .where(eq(variantsTable.size, sizeName))
      .returning();

    if (!updatedVariants || updatedVariants.length === 0) {
      return c.json(
        { error: "No variations found matching the specified size name." },
        404,
      );
    }
    return c.json(
      {
        message: `System-wide stock status for size '${sizeName}' updated successfully.`,
        toggledTo: toggledStock,
        updatedCount: updatedVariants.length,
        variants: updatedVariants,
      },
      200,
    );
  })

  //delete a flavor
  .delete("/flavor/:id", async (c) => {
    const id = c.req.param("id");

    const [deletedFlavor] = await db
      .delete(flavorsTable)
      .where(eq(flavorsTable.flavor_id, id))
      .returning();

    if (!deletedFlavor) {
      return c.json(
        { error: "Flavor id not found. Can not proceed update." },
        404,
      );
    }

    return c.json({
      success: true,
      message: `Deleted flavor with id ${deletedFlavor}`,
    });
  });
