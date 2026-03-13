import {
  pgTable,
  text,
  varchar,
  integer,
  jsonb,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  basePrice: integer("base_price").notNull(), // cents
  status: varchar("status", { length: 20 }).notNull().default("active"),
  subframeSpec: jsonb("subframe_spec"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productParameters = pgTable("product_parameters", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // number, select, boolean
  min: integer("min"),
  max: integer("max"),
  defaultValue: text("default_value"),
  options: jsonb("options"), // for select type
  constraints: jsonb("constraints"),
  sortOrder: integer("sort_order").default(0),
});

export const finishes = pgTable("finishes", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  costPerSqFt: integer("cost_per_sqft").notNull(), // cents
  active: boolean("active").default(true),
});
