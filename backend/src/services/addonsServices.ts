import { db } from "#/db/index";
import { addonsTable } from "#/db/schema";
import { eq, like, ilike, asc, min } from "drizzle-orm";
import { generateId } from "#/utils/generateId";
import { removeVowel } from "#/utils/vowelRemover";
import { skipLetterBy } from "#/utils/skipLetters";

type CreateAddonInput = {
  addon_name: string;
  in_stock?: boolean;
  price: string;
  image_url: string;
};

export const addonService = {
  async generateAddonId(base_name: string) {
    const name = base_name ? base_name.trim() : "";

    if (!base_name) {
      // fallback in case no name provided
      return "ADD" + Math.random().toString(36).substring(2, 5).toUpperCase();
    }

    let addonCode = generateId(name, 3);
    let isUnique = false;
    let layer = 0;

    while (!isUnique) {
      const [existing] = await db
        .select()
        .from(addonsTable)
        .where(eq(addonsTable.addon_id, addonCode));

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
            addonCode = generateId(noVowels, 3);
            break;
          }

          case 2: {
            // skip even positions letter
            const skipped = skipLetterBy(name, 2);
            addonCode = generateId(skipped, 3);
            break;
          }

          case 3: {
            //start using 5-letter code
            const words = name.trim().split(/\s+/);
            if (words.length > 1) {
              addonCode = generateId(name, 5);
            } else {
              const stripped = removeVowel(name).slice(0, 5).toUpperCase();
              addonCode = stripped || name.slice(0, 5).toUpperCase();
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
            addonCode = `${base}${entropy}`;
          }
        }
      }
    }
    return addonCode;
  },

  async createAddon(input: CreateAddonInput) {
    const { addon_name, in_stock, price, image_url } = input;

    const [existingAddon] = await db
      .select()
      .from(addonsTable)
      .where(ilike(addonsTable.addon_name, addon_name.trim()));

    if (existingAddon) {
      throw new Error(
        `'${addon_name}' already exists. Maybe try adding other names if its a similar addon!`,
      );
    }

    const newAddonId = await this.generateAddonId(addon_name);

    return await db.transaction(async (tx) => {
      const [newAddon] = await tx
        .insert(addonsTable)
        .values({
          addon_id: newAddonId,
          addon_name: addon_name,
          in_stock: in_stock ?? true,
          image_url: image_url,
        })
        .returning();

      return newAddon;
    });
  },
};
