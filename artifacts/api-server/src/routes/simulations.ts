import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  simulationsTable,
  insightsTable,
  recommendationsTable,
  medicationsTable,
  profilesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateSimulationBody, GetSimulationParams } from "@workspace/api-zod";
import { runSimulation } from "../lib/simulation-engine";

const router: IRouter = Router();

const toSim = (s: typeof simulationsTable.$inferSelect) => ({
  ...s,
  adherenceScore: s.adherenceScore !== null ? Number(s.adherenceScore) : null,
});

router.get("/simulations", async (_req, res) => {
  const sims = await db.select().from(simulationsTable).orderBy(simulationsTable.createdAt);
  res.json(sims.map(toSim));
});

router.post("/simulations", async (req, res) => {
  const parsed = CreateSimulationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { medicationId, profileId } = parsed.data;

  const [med] = await db.select().from(medicationsTable).where(eq(medicationsTable.id, medicationId));
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, profileId));

  if (!med) {
    res.status(400).json({ error: "Medication not found" });
    return;
  }
  if (!profile) {
    res.status(400).json({ error: "Profile not found" });
    return;
  }

  const [sim] = await db.insert(simulationsTable).values({
    medicationId,
    profileId,
    status: "running",
  }).returning();

  // Run simulation synchronously
  const result = runSimulation(med, profile);

  // Persist insights
  if (result.insights.length > 0) {
    await db.insert(insightsTable).values(
      result.insights.map(i => ({
        simulationId: sim.id,
        category: i.category,
        title: i.title,
        description: i.description,
        severity: i.severity,
        affectedPercentage: String(i.affectedPercentage),
      }))
    );
  }

  // Persist recommendations
  if (result.recommendations.length > 0) {
    await db.insert(recommendationsTable).values(
      result.recommendations.map(r => ({
        simulationId: sim.id,
        type: r.type,
        title: r.title,
        description: r.description,
        priority: r.priority,
      }))
    );
  }

  // Update simulation as complete
  const [completed] = await db.update(simulationsTable)
    .set({
      status: "complete",
      adherenceScore: String(result.adherenceScore),
      completedAt: new Date(),
    })
    .where(eq(simulationsTable.id, sim.id))
    .returning();

  res.status(201).json(toSim(completed));
});

router.get("/simulations/:id", async (req, res) => {
  const params = GetSimulationParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [sim] = await db.select().from(simulationsTable).where(eq(simulationsTable.id, params.data.id));
  if (!sim) {
    res.status(404).json({ error: "Simulation not found" });
    return;
  }

  const [med] = await db.select().from(medicationsTable).where(eq(medicationsTable.id, sim.medicationId));
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.id, sim.profileId));
  const insights = await db.select().from(insightsTable).where(eq(insightsTable.simulationId, sim.id));
  const recommendations = await db.select().from(recommendationsTable).where(eq(recommendationsTable.simulationId, sim.id));

  res.json({
    ...toSim(sim),
    medication: { ...med, halfLifeHours: Number(med.halfLifeHours) },
    profile: { ...profile, sleepHours: Number(profile.sleepHours) },
    insights: insights.map(i => ({ ...i, affectedPercentage: Number(i.affectedPercentage) })),
    recommendations,
  });
});

export default router;
