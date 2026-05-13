import { Router, type IRouter } from "express";
import healthRouter from "./health";
import medicationsRouter from "./medications";
import profilesRouter from "./profiles";
import simulationsRouter from "./simulations";
import insightsRouter from "./insights";
import recommendationsRouter from "./recommendations";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(medicationsRouter);
router.use(profilesRouter);
router.use(simulationsRouter);
router.use(insightsRouter);
router.use(recommendationsRouter);
router.use(dashboardRouter);

export default router;
