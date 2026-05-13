import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { simulationsTable } from "./simulations";

export const recommendationsTable = pgTable("packaging_recommendations", {
  id: serial("id").primaryKey(),
  simulationId: integer("simulation_id").notNull().references(() => simulationsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(),
});

export type Recommendation = typeof recommendationsTable.$inferSelect;
