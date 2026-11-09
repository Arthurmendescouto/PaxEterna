import { Router } from "express";
import {
  atualizarCompra,
  buscarCompras,
  cadastrarCompra,
} from "../controllers/compraController";

const router = Router();

router.get("/", buscarCompras);
router.post("/", cadastrarCompra);
router.put("/:id_compra", atualizarCompra);

export default router;
