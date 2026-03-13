import {
  pgTable,
  text,
  varchar,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { regions } from "./factories";

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerName: varchar("customer_name", { length: 200 }),
  shippingAddress: jsonb("shipping_address"),
  regionId: text("region_id")
    .notNull()
    .references(() => regions.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  configuration: jsonb("configuration").notNull(), // SideTableParams
  bom: jsonb("bom").notNull(), // BOMResult
  costBreakdown: jsonb("cost_breakdown").notNull(), // CostBreakdown
  totalPrice: integer("total_price").notNull(), // cents
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  factoryId: text("factory_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
