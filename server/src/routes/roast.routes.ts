import { Router } from "express";
import { getRoastData } from "../controllers/roast.controller";

const router = Router();

router.get("/:username", getRoastData);

export default router;