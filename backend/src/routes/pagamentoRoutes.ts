import { Router } from "express";
import {
  buscarPagamento,
  buscarPagamentos,
  cadastrarPagamento,
} from "../controllers/pagamentoController";

const router = Router();

router.get("/", buscarPagamentos);
router.get("/:tipo/:id_pagamento", buscarPagamento);
router.post("/", cadastrarPagamento);

export default router;
