import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { medicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateMedicationBody,
  GetMedicationParams,
  DeleteMedicationParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/medications", async (req, res) => {
  const medications = await db.select().from(medicationsTable).orderBy(medicationsTable.createdAt);
  res.json(medications.map(m => ({
    ...m,
    halfLifeHours: Number(m.halfLifeHours),
  })));
});

router.post("/medications", async (req, res) => {
  const parsed = CreateMedicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [med] = await db.insert(medicationsTable).values({
    name: parsed.data.name,
    drugClass: parsed.data.drugClass,
    halfLifeHours: String(parsed.data.halfLifeHours),
    dosingFrequency: parsed.data.dosingFrequency,
    description: parsed.data.description,
    indications: parsed.data.indications,
  }).returning();
  res.status(201).json({ ...med, halfLifeHours: Number(med.halfLifeHours) });
});

router.get("/medications/:id", async (req, res) => {
  const params = GetMedicationParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [med] = await db.select().from(medicationsTable).where(eq(medicationsTable.id, params.data.id));
  if (!med) {
    res.status(404).json({ error: "Medication not found" });
    return;
  }
  res.json({ ...med, halfLifeHours: Number(med.halfLifeHours) });
});

router.delete("/medications/:id", async (req, res) => {
  const params = DeleteMedicationParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(medicationsTable).where(eq(medicationsTable.id, params.data.id));
  res.status(204).end();
});

export default router;
