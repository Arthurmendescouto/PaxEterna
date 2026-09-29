import { Router } from "express";
import {
	buscarCliente,
	buscarClientes,
	cadastrarCliente,
} from "../controllers/clienteController";

const router = Router();

router.post("/clientes", cadastrarCliente);
router.get("/clientes", buscarClientes);
router.get("/clientes/:cpf", buscarCliente);

export default router;
