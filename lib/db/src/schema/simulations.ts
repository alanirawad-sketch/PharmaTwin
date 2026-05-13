import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { medicationsTable } from "./medications";
import { profilesTable } from "./profiles";

export const simulationsTable = pgTable("simulations", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull().references(() => medicationsTable.id, { onDelete: "cascade" }),
  profileId: integer("profile_id").notNull().references(() => profilesTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  adherenceScore: numeric("adherence_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Simulation = typeof simulationsTable.$inferSelect;
