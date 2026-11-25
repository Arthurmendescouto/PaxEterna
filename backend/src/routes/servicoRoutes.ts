import { Router } from "express";
import { atualizarServico, cadastrarServico } from "../controllers/servicoController";

const router = Router();

router.post("/", cadastrarServico);
router.put("/:id_recurso", atualizarServico);

export default router;
