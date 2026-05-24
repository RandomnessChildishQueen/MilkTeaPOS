import {
  integer,
  primaryKey,
  pgTable,
  varchar,
  boolean,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

import { generate16DigitID } from "./generateID";

export const flavorsTable = pgTable("flavors", {
  flavor_id: varchar({ length: 5 }).primaryKey(),
  flavor_name: varchar({ length: 255 }).notNull(),
  in_stock: boolean().default(true).notNull(),
  image_url: varchar({ length: 512 }),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export const variantsTable = pgTable("drink_variants", {
  variant_id: varchar({ length: 8 }).primaryKey(),
  flavor_id: varchar().references(() => flavorsTable.flavor_id, {
    onDelete: "cascade",
  }),
  size: varchar({ length: 50 }).notNull(),
  base_price: numeric({ precision: 10, scale: 2 }).notNull(),
  in_stock: boolean().default(true).notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export const addonsTable = pgTable("addons", {
  addon_id: varchar({ length: 8 }).primaryKey(),
  addon_name: varchar({ length: 255 }).notNull(),
  in_stock: boolean().default(true).notNull(),
  price: numeric({ precision: 10, scale: 2 }).notNull(),
  image_url: varchar({ length: 512 }),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export const ordersTable = pgTable("orders", {
  order_id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  queue_no: integer().generatedByDefaultAsIdentity().notNull(),
  customer_name: varchar({ length: 255 }),
  total_price: numeric({ precision: 10, scale: 2 }).notNull(),
  payment_method: varchar({ enum: ["cash", "cashless"] }),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),

  user_id: varchar().references(() => usersTable.user_id),
  terminal_id: integer().references(() => terminalTable.terminal_id),
});

export const itemsTable = pgTable("items", {
  item_id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  order_id: integer().references(() => ordersTable.order_id, {
    onDelete: "cascade",
  }),
  drink_id: varchar({ length: 255 }).references(() => variantsTable.variant_id),
  quantity: integer(),
  sugar_level: varchar({ enum: ["0%", "25%", "50%", "75%", "100%"] }),
  ice_level: varchar({ enum: ["no ice", "less ice", "normal ice"] }),
  sub_price: numeric({ precision: 10, scale: 2 }).notNull(),
});

export const itemAddonsTable = pgTable("item_addons", {
  id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  item_id: integer().references(() => itemsTable.item_id, {
    onDelete: "cascade",
  }),
  addon_id: varchar({ length: 255 }).references(() => addonsTable.addon_id),
  quantity: integer(),
  sub_price: numeric({ precision: 10, scale: 2 }).notNull(),
});

export const usersTable = pgTable("users", {
  user_id: varchar({ length: 16 })
    .primaryKey()
    .$defaultFn(() => generate16DigitID()),
  username: varchar({ length: 255 }),
  password: varchar({ length: 255 }).notNull(),
  account_type: varchar({ enum: ["admin", "manager", "employee"] }),
  branch_id: integer().references(() => branchTable.branch_id),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export const terminalTable = pgTable("terminal", {
  terminal_id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  terminal_name: varchar({ length: 255 }),
  branch_id: integer().references(() => branchTable.branch_id),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});

export const branchTable = pgTable("branch", {
  branch_id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  store_name: varchar({ length: 255 }),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});
