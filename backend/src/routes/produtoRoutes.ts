import { Router } from "express";
import {
  cadastrarProduto,
  atualizarProduto,
} from "../controllers/produtoController";

const router = Router();

// Rota POST para criar um novo produto
router.post("/", cadastrarProduto);

// Rota PUT para atualizar um produto existente
router.put("/:id_produto", atualizarProduto);

export default router;
