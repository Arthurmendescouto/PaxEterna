import { Router } from "express";
import { cadastrarCliente } from "../controllers/clienteController";

const router = Router();

router.post("/clientes", cadastrarCliente);

export default router;
