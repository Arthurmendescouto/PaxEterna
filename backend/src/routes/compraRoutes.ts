import { Router } from "express";
import { buscarCompras } from "../controllers/compraController";

const router = Router();

router.get("/", buscarCompras);

export default router;
