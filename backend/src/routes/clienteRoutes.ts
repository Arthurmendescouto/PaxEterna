import { Router } from "express";
import {
	atualizarCliente,
	buscarCliente,
	buscarClientes,
	cadastrarCliente,
	deletarCliente,
} from "../controllers/clienteController";

const router = Router();

router.post("/clientes", cadastrarCliente);
router.get("/clientes", buscarClientes);
router.get("/clientes/:cpf", buscarCliente);
router.put("/clientes/:cpf", atualizarCliente);
router.delete("/clientes/:cpf", deletarCliente);

export default router;
