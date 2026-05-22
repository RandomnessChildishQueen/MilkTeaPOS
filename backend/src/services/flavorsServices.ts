import { db } from "#/db/index";
import {
  flavors as flavorsTable,
  drink_variants as variantsTable,
} from "#/db/schema";
import { eq, like, ilike, asc, min } from "drizzle-orm";

interface SizePriceInput {
  size: string;
  base_price: string;
}

interface FlavorPriceInput {
  flavor_id: string;
  price: string;
}

interface CreateFlavorInput {
  flavor_name: string;
  in_stock?: boolean;
  image_url: string;
  size_prices: SizePriceInput[];
}

export const flavorService = {
  async fetchFlavors() {
    const rows = await db
      .select({
        flavor_id: flavorsTable.flavor_id,
        flavor_name: flavorsTable.flavor_name,
        image_url: flavorsTable.image_url,
        in_stock: flavorsTable.in_stock,
      })
      .from(flavorsTable);

    return rows;
  },

  async fetchFlavorNames() {
    const rows = await db
      .selectDistinct({
        flavor_name: flavorsTable.flavor_name,
      })
      .from(flavorsTable);
    return rows;
  },

  async fetchSizes() {
    const sizes = await db
      .selectDistinct({
        size: variantsTable.size,
      })
      .from(variantsTable)
      .groupBy(variantsTable.size)
      .orderBy(asc(min(variantsTable.base_price)));

    return sizes.length > 0
      ? sizes.map((row) => row.size)
      : ["Medium", "Large"];
  },

  generateFlavorId(name: string) {
    let flavorCode = "";

    const nameWord = name.trim().split(/\s+/);

    if (nameWord.length >= 2) {
      flavorCode = nameWord
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    } else {
      flavorCode = name.substring(0, 3).toUpperCase();
    }

    return flavorCode;
  },

  generateVariantId(size: string, flavor: string) {
    let variantCode = "";
    let sizeCode = "";

    const sizeWord = size.trim().split(/\s+/);
    if (sizeWord.length >= 2) {
      if (sizeWord[0].toLowerCase() == "extra") {
        sizeCode += "X";
      } else {
        sizeCode += sizeWord[0].slice(0, 1).toUpperCase();
      }
      sizeCode += sizeWord
        .slice(1)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    } else {
      sizeCode = sizeWord[0].slice(0, 1).toUpperCase();
    }

    variantCode += sizeCode + "_" + flavor;

    return variantCode;
  },

  async createFlavor(input: CreateFlavorInput) {
    const { flavor_name, in_stock, image_url, size_prices } = input;

    const newFlavorId = this.generateFlavorId(flavor_name);

    return await db.transaction(async (tx) => {
      const [newFlavor] = await tx
        .insert(flavorsTable)
        .values({
          flavor_id: newFlavorId,
          flavor_name: flavor_name,
          in_stock: in_stock ?? true,
          image_url: image_url,
        })
        .returning();

      const createdVariants = await this.addVariant(
        tx,
        newFlavorId,
        size_prices,
      );

      return { newFlavor, createdVariants };
    });
  },

  async addVariant(tx: any, flavor_id: string, size_prices: SizePriceInput[]) {
    const created = [];
    for (const i of size_prices) {
      const variant_id = this.generateVariantId(i.size, flavor_id);

      const [newVariant] = await tx
        .insert(variantsTable)
        .values({
          variant_id: variant_id,
          flavor_id: flavor_id,
          size: i.size,
          base_price: i.base_price,
          in_stock: true,
        })
        .returning();

      created.push(newVariant);
    }

    return created;
  },

  async addSize(newSize: string, flavorPrices: FlavorPriceInput[]) {
    return await db.transaction(async (tx) => {
      const createdVariants = [];
      for (const item of flavorPrices) {
        const variant_id = this.generateVariantId(newSize, item.flavor_id);

        const [newVariant] = await tx
          .insert(variantsTable)
          .values({
            variant_id,
            flavor_id: item.flavor_id,
            size: newSize.trim(),
            base_price: item.price,
          })
          .returning();

        createdVariants.push(newVariant);
      }
      return createdVariants;
    });
  },
};
