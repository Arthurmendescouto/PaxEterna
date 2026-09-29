import { Router } from "express";
import {
	atualizarCliente,
	buscarCliente,
	buscarClientes,
	cadastrarCliente,
} from "../controllers/clienteController";

const router = Router();

router.post("/clientes", cadastrarCliente);
router.get("/clientes", buscarClientes);
router.get("/clientes/:cpf", buscarCliente);
router.put("/clientes/:cpf", atualizarCliente);

export default router;
