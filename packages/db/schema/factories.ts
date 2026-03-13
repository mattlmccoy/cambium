import {
  pgTable,
  text,
  varchar,
  integer,
  jsonb,
  timestamp,
  real,
} from "drizzle-orm/pg-core";

export const regions = pgTable("regions", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  statesServiced: jsonb("states_serviced").notNull(), // string[]
  lat: real("lat"),
  lng: real("lng"),
  status: varchar("status", { length: 20 }).notNull().default("planned"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const costModels = pgTable("cost_models", {
  id: text("id").primaryKey(),
  regionId: text("region_id")
    .notNull()
    .references(() => regions.id),
  cncRatePerHour: integer("cnc_rate_per_hour").notNull(), // cents
  laborRate: integer("labor_rate").notNull(), // cents
  shippingBase: integer("shipping_base").notNull(), // cents
  marginPercent: integer("margin_percent").notNull(),
  hardwareCosts: jsonb("hardware_costs"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
