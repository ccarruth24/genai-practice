import { Router, type IRouter } from "express";
import healthRouter from "./health";
import smartPantryRouter from "./smart-pantry";

const router: IRouter = Router();

router.use(healthRouter);
router.use(smartPantryRouter);

export default router;
