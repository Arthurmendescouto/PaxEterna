import { Router } from "express";
import {
  buscarPagamento,
  buscarPagamentos,
} from "../controllers/pagamentoController";

const router = Router();

router.get("/", buscarPagamentos);
router.get("/:tipo/:id_pagamento", buscarPagamento);

export default router;
