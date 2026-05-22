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

export const flavors = pgTable("flavors", {
  flavor_id: varchar({ length: 8 }).primaryKey(),
  flavor_name: varchar({ length: 255 }).notNull(),
  size: varchar({ length: 50 }).notNull(),
  in_stock: boolean().default(true).notNull(),
  base_price: numeric({ precision: 10, scale: 2 }).notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});

export const addons = pgTable("addons", {
  addon_id: varchar({ length: 8 }).primaryKey(),
  add_on_name: varchar({ length: 255 }).notNull(),
  in_stock: boolean().default(true).notNull(),
  price: numeric({ precision: 10, scale: 2 }).notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});

export const orders = pgTable("orders", {
  order_id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  queue_no: integer().generatedByDefaultAsIdentity().notNull(),
  customer_name: varchar({ length: 255 }),
  total_price: numeric({ precision: 10, scale: 2 }).notNull(),
  payment_method: varchar({ enum: ["cash", "cashless"] }),
  created_at: timestamp().defaultNow().notNull(),

  user_id: integer().references(() => users.user_id),
  terminal_id: integer().references(() => terminal.terminal_id),
});

export const items = pgTable("items", {
  item_id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  order_id: integer().references(() => orders.order_id),
  flavor_id: varchar({ length: 255 }).references(() => flavors.flavor_id),
  quantity: integer(),
  sugar_level: varchar({ enum: ["0%", "25%", "50%", "75%", "100%"] }),
  ice_level: varchar({ enum: ["no ice", "less ice", "normal ice"] }),
  sub_price: numeric({ precision: 10, scale: 2 }).notNull(),
});

export const item_addons = pgTable(
  "item_addons",
  {
    item_id: integer().references(() => items.item_id),
    addon_id: varchar({ length: 255 }).references(() => addons.addon_id),
    quantity: integer(),
    sub_price: numeric({ precision: 10, scale: 2 }).notNull(),
  },
  (item_addons) => [
    primaryKey({ columns: [item_addons.item_id, item_addons.addon_id] }),
  ],
);

export const users = pgTable("users", {
  user_id: varchar({ length: 16 })
    .primaryKey()
    .$defaultFn(() => generate16DigitID()),
  username: varchar({ length: 255 }),
  password: varchar({ length: 255 }).notNull(),
  account_type: varchar({ enum: ["admin", "manager", "employee"] }),
  branch_id: integer().references(() => branch.branch_id),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});

export const terminal = pgTable("terminal", {
  terminal_id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  terminal_name: varchar({ length: 255 }),
  branch_id: integer().references(() => branch.branch_id),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});

export const branch = pgTable("branch", {
  branch_id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
  store_name: varchar({ length: 255 }),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp(),
});
