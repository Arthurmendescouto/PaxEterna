import { Router } from "express";
import {
  buscarCompras,
  excluirCompra,
} from "../controllers/compraController";

const router = Router();

router.get("/", buscarCompras);
router.delete("/:id_compra", excluirCompra);

export default router;
