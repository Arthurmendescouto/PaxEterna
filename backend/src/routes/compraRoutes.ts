import { Router } from "express";
import {
  atualizarCompra,
  buscarCompras,
  cadastrarCompra,
  excluirCompra,
} from "../controllers/compraController";

const router = Router();

router.get("/", buscarCompras);
router.post("/", cadastrarCompra);
router.put("/:id_compra", atualizarCompra);
router.delete("/:id_compra", excluirCompra);

export default router;
