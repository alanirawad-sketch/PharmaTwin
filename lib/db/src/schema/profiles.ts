import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("lifestyle_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  workSchedule: text("work_schedule").notNull(),
  sleepHours: numeric("sleep_hours", { precision: 4, scale: 1 }).notNull(),
  dietType: text("diet_type").notNull(),
  exerciseFrequency: text("exercise_frequency").notNull(),
  caffeineIntake: text("caffeine_intake").notNull(),
  smokingStatus: text("smoking_status").notNull(),
  fastingPractice: text("fasting_practice").notNull(),
  travelFrequency: text("travel_frequency").notNull(),
  stressLevel: text("stress_level").notNull(),
  demographicGroup: text("demographic_group").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, createdAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
