import {
  pgTable,
  text,
  varchar,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { regions } from "./factories";

export const woodSpecies = pgTable("wood_species", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  commonName: varchar("common_name", { length: 100 }).notNull(),
  description: text("description"),
  density: integer("density"), // kg/m3
  hardness: integer("hardness"), // janka
  color: varchar("color", { length: 7 }), // hex
  grainPattern: varchar("grain_pattern", { length: 20 }),
  typicalUses: jsonb("typical_uses"),
});

export const regionWoodSpecies = pgTable("region_wood_species", {
  id: text("id").primaryKey(),
  regionId: text("region_id")
    .notNull()
    .references(() => regions.id),
  speciesId: text("species_id")
    .notNull()
    .references(() => woodSpecies.id),
  pricePerBoardFoot: integer("price_per_board_foot").notNull(), // cents
  availability: varchar("availability", { length: 20 }).notNull().default("medium"),
  supplierNotes: text("supplier_notes"),
});

export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey(),
  regionId: text("region_id")
    .notNull()
    .references(() => regions.id),
  name: varchar("name", { length: 200 }).notNull(),
  contact: text("contact"),
  speciesOffered: jsonb("species_offered"),
  leadTimeDays: integer("lead_time_days"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
