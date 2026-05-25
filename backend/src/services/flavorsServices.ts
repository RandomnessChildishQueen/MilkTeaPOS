import { db } from "#/db/index";
import { flavorsTable, variantsTable } from "#/db/schema";
import { eq, like, ilike, asc, min } from "drizzle-orm";
import { generateId } from "#/utils/generateId";
import { removeVowel } from "#/utils/vowelRemover";
import { skipLetterBy } from "#/utils/skipLetters";
import { size } from "zod";

type SizePriceInput = {
  size: string;
  base_price: string;
};

type FlavorPriceInput = {
  flavor_id: string;
  price: string;
};

type CreateFlavorInput = {
  flavor_id: string;
  flavor_name: string;
  in_stock?: boolean;
  image_url: string;
  size_prices: SizePriceInput[];
};

export const flavorService = {
  async fetchFlavors() {
    const result = await db.query.flavors.findMany({
      with: {
        variants: {
          columns: {
            size: true,
            base_price: true,
          },
        },
      },
    });
    return result;
  },

  async fetchFlavorNames() {
    const rows = await db
      .selectDistinct({
        flavor_name: flavorsTable.flavor_name,
      })
      .from(flavorsTable);
    return rows;
  },

  async fetchVariantById(variant_id: string) {
    const [variant] = await db
      .select()
      .from(variantsTable)
      .where(eq(variantsTable.variant_id, variant_id));
    return variant;
  },

  async fetchVariantsByFlavor(flavor_id: string) {
    const rows = await db
      .select()
      .from(variantsTable)
      .where(eq(variantsTable.flavor_id, flavor_id));
    return rows;
  },

  async fetchFlavorPrices(flavor_id: string) {
    const rows = await db
      .select({
        price: variantsTable.base_price,
        size: variantsTable.size,
      })
      .from(variantsTable)
      .where(eq(variantsTable.flavor_id, flavor_id));
    return rows;
  },

  async fetchSizes() {
    const sizes = await db
      .select({
        size: variantsTable.size,
      })
      .from(variantsTable)
      .groupBy(variantsTable.size)
      .orderBy(asc(min(variantsTable.base_price)));

    return sizes.length > 0
      ? sizes.map((row) => row.size)
      : ["Medium", "Large"];
  },

  async generateFlavorId(base_name: string) {
    const name = base_name ? base_name.trim() : "";

    if (!base_name) {
      // fallback in case no name provided
      return "FLV" + Math.random().toString(36).substring(2, 5).toUpperCase();
    }

    let flavorCode = generateId(name, 3);
    let isUnique = false;
    let layer = 0;

    while (!isUnique) {
      const [existing] = await db
        .select()
        .from(flavorsTable)
        .where(eq(flavorsTable.flavor_id, flavorCode));

      if (!existing) {
        isUnique = true;
      } else {
        //if existing, immediately add counter for layered case
        layer += 1;

        //layered looping to do if the code exists
        switch (layer) {
          case 1: {
            //remove vowels
            const noVowels = removeVowel(name);
            flavorCode = generateId(noVowels, 3);
            break;
          }

          case 2: {
            // skip even positions letter
            const skipped = skipLetterBy(name, 2);
            flavorCode = generateId(skipped, 3);
            break;
          }

          case 3: {
            //start using 5-letter code
            const words = name.trim().split(/\s+/);
            if (words.length > 1) {
              flavorCode = generateId(name, 5);
            } else {
              const stripped = removeVowel(name).slice(0, 5).toUpperCase();
              flavorCode = stripped || name.slice(0, 5).toUpperCase();
            }
            break;
          }

          default: {
            //all defense layer exhausted: use math random to generate random char
            const base = generateId(name, 5).slice(0, 2);
            const entropy = Math.random()
              .toString(36)
              .slice(2, 5)
              .toUpperCase();
            flavorCode = `${base}${entropy}`;
          }
        }
      }
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
    const { flavor_id, flavor_name, in_stock, image_url, size_prices } = input;

    const [existingFlavor] = await db
      .select()
      .from(flavorsTable)
      .where(ilike(flavorsTable.flavor_name, flavor_name.trim()));

    if (existingFlavor) {
      throw new Error(
        `'${flavor_name}' already exists. Maybe try adding other names if its a similar flavor!`,
      );
    }

    return await db.transaction(async (tx) => {
      const [newFlavor] = await tx
        .insert(flavorsTable)
        .values({
          flavor_id: flavor_id,
          flavor_name: flavor_name,
          in_stock: in_stock ?? true,
          image_url: image_url,
        })
        .returning();

      const createdVariants = await this.addVariant(tx, flavor_id, size_prices);

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
