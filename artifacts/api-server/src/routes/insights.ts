import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { insightsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListInsightsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/insights", async (req, res) => {
  const parsed = ListInsightsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let query = db.select().from(insightsTable);

  if (parsed.data.simulationId !== undefined) {
    const rows = await db.select().from(insightsTable).where(eq(insightsTable.simulationId, parsed.data.simulationId));
    res.json(rows.map(i => ({ ...i, affectedPercentage: Number(i.affectedPercentage) })));
    return;
  }

  const rows = await query;
  res.json(rows.map(i => ({ ...i, affectedPercentage: Number(i.affectedPercentage) })));
});

export default router;
