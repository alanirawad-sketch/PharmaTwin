import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { recommendationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListRecommendationsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recommendations", async (req, res) => {
  const parsed = ListRecommendationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.simulationId !== undefined) {
    const rows = await db.select().from(recommendationsTable).where(eq(recommendationsTable.simulationId, parsed.data.simulationId));
    res.json(rows);
    return;
  }

  const rows = await db.select().from(recommendationsTable);
  res.json(rows);
});

export default router;
