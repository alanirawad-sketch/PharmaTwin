import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProfileBody,
  GetProfileParams,
  DeleteProfileParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const toProfile = (p: typeof profilesTable.$inferSelect) => ({
  ...p,
  sleepHours: Number(p.sleepHours),
});

router.get("/profiles", async (_req, res) => {
  const profiles = await db.select().from(profilesTable).orderBy(profilesTable.createdAt);
  res.json(profiles.map(toProfile));
});

router.post("/profiles", async (req, res) => {
  const parsed = CreateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [profile] = await db.insert(profilesTable).values({
    name: parsed.data.name,
    workSchedule: parsed.data.workSchedule,
    sleepHours: String(parsed.data.sleepHours),
    dietType: parsed.data.dietType,
    exerciseFrequency: parsed.data.exerciseFrequency,
    caffeineIntake: parsed.data.caffeineIntake,
    smokingStatus: parsed.data.smokingStatus,
    fastingPractice: parsed.data.fastingPractice,
    travelFrequency: parsed.data.travelFrequency,
    stressLevel: parsed.data.stressLevel,
    demographicGroup: parsed.data.demographicGroup,
  }).returning();
  res.status(201).json(toProfile(profile));
});

router.get("/profiles/:id", async (req, res) => {
  const params = GetProfileParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, params.data.id));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(toProfile(profile));
});

router.delete("/profiles/:id", async (req, res) => {
  const params = DeleteProfileParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(profilesTable).where(eq(profilesTable.id, params.data.id));
  res.status(204).end();
});

export default router;
