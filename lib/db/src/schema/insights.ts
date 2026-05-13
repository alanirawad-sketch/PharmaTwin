import { pgTable, serial, integer, text, numeric } from "drizzle-orm/pg-core";
import { simulationsTable } from "./simulations";

export const insightsTable = pgTable("adherence_insights", {
  id: serial("id").primaryKey(),
  simulationId: integer("simulation_id").notNull().references(() => simulationsTable.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  affectedPercentage: numeric("affected_percentage", { precision: 5, scale: 2 }).notNull(),
});

export type Insight = typeof insightsTable.$inferSelect;
