import { Request, Response } from "express";
import { buscarTodasCompras, removerCompra } from "../models/compraModel";

export async function buscarCompras(_req: Request, res: Response) {
  try {
    const compras = await buscarTodasCompras();
    return res.status(200).json(compras);
  } catch (error) {
    console.error("Erro ao buscar compras:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export async function excluirCompra(req: Request, res: Response) {
  const idCompra = Number(req.params.id_compra);
  if (!Number.isSafeInteger(idCompra) || idCompra <= 0) {
    return res.status(400).json({ message: "ID da compra inválido." });
  }

  try {
    const removida = await removerCompra(idCompra);
    if (!removida) {
      return res.status(404).json({ message: "Compra não encontrada." });
    }

    return res.status(200).json({ message: "Compra removida com sucesso." });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "ER_ROW_IS_REFERENCED_2" ||
        error.code === "ER_ROW_IS_REFERENCED")
    ) {
      return res.status(409).json({
        message:
          "Não é possível remover esta compra porque existem registros vinculados a ela.",
      });
    }

    console.error("Erro ao remover compra:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
