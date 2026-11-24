import { Router } from "express";
import {
  buscarPagamento,
  buscarPagamentos,
  cadastrarPagamento,
  editarPagamento,
} from "../controllers/pagamentoController";

const router = Router();

router.get("/", buscarPagamentos);
router.get("/:tipo/:id_pagamento", buscarPagamento);
router.post("/", cadastrarPagamento);
router.put("/:tipo/:id_pagamento", editarPagamento);

export default router;
