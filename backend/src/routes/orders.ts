import { Hono } from "hono";
import { db } from "#/db/index";
import { ordersTable, itemsTable, itemAddonsTable } from "#/db/schema";
import { eq, ilike } from "drizzle-orm";

export const orders = new Hono();

//get all orders

//get a specific order by queue no filtered by today's date

//get a specific order by id

//create an order

//add items in order

//add addons in item
