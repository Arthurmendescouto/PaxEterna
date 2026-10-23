import { Router } from "express";
import {
  cadastrarProduto,
  atualizarProduto,
  buscarProduto,
  buscarProdutos,
  removerProduto,
} from "../controllers/produtoController";

const router = Router();

// Rota POST para criar um novo produto
router.post("/", cadastrarProduto);

// Rota GET para buscar todos os produtos
router.get("/", buscarProdutos);

// Rota GET para buscar um produto por ID
router.get("/:id_produto", buscarProduto);

// Rota PUT para atualizar um produto existente
router.put("/:id_produto", atualizarProduto);

// Rota DELETE para remover um produto
router.delete("/:id_produto", removerProduto);

export default router;
