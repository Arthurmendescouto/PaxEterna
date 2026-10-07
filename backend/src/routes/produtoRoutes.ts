import { Router } from "express";
import { cadastrarProduto } from "../controllers/produtoController";

const router = Router();

// Rota POST para criar um novo produto
router.post("/", cadastrarProduto);

export default router;
