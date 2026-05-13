import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicationsTable = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  drugClass: text("drug_class").notNull(),
  halfLifeHours: numeric("half_life_hours", { precision: 5, scale: 2 }).notNull(),
  dosingFrequency: text("dosing_frequency").notNull(),
  description: text("description").notNull(),
  indications: text("indications").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicationSchema = createInsertSchema(medicationsTable).omit({ id: true, createdAt: true });
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medicationsTable.$inferSelect;
