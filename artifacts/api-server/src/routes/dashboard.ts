import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  medicationsTable,
  profilesTable,
  simulationsTable,
  insightsTable,
  recommendationsTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const [[meds], [profiles], [sims], completedSims, [ins], [recs]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(medicationsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(profilesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(simulationsTable),
    db.select().from(simulationsTable).where(eq(simulationsTable.status, "complete")),
    db.select({ count: sql<number>`count(*)::int` }).from(insightsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(recommendationsTable),
  ]);

  const avgScore = completedSims.length > 0
    ? completedSims.reduce((sum, s) => sum + (s.adherenceScore ? Number(s.adherenceScore) : 0), 0) / completedSims.length
    : 0;

  // Find most common insight category
  const categoryRows = await db
    .select({ category: insightsTable.category, count: sql<number>`count(*)::int` })
    .from(insightsTable)
    .groupBy(insightsTable.category)
    .orderBy(sql`count(*) desc`)
    .limit(1);

  const topRisk = categoryRows[0]?.category ?? "N/A";

  res.json({
    totalMedications: meds.count,
    totalProfiles: profiles.count,
    totalSimulations: sims.count,
    completedSimulations: completedSims.length,
    averageAdherenceScore: Math.round(avgScore * 10) / 10,
    topAdherenceRisk: topRisk,
    totalInsights: ins.count,
    totalRecommendations: recs.count,
  });
});

router.get("/dashboard/friction-heatmap", async (_req, res) => {
  // Join simulations with profiles and insights to aggregate friction by demographic + category
  const rows = await db
    .select({
      demographicGroup: profilesTable.demographicGroup,
      category: insightsTable.category,
      frictionScore: sql<number>`avg(${insightsTable.affectedPercentage}::numeric)::float`,
      simulationCount: sql<number>`count(distinct ${simulationsTable.id})::int`,
    })
    .from(insightsTable)
    .innerJoin(simulationsTable, eq(insightsTable.simulationId, simulationsTable.id))
    .innerJoin(profilesTable, eq(simulationsTable.profileId, profilesTable.id))
    .groupBy(profilesTable.demographicGroup, insightsTable.category)
    .orderBy(sql`avg(${insightsTable.affectedPercentage}::numeric) desc`);

  res.json(rows.map(r => ({
    ...r,
    frictionScore: Math.round(Number(r.frictionScore) * 10) / 10,
  })));
});

export default router;
