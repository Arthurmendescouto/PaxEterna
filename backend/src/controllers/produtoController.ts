import { Request, Response } from "express";
import * as produtoModel from "../models/produtoModel";

export const cadastrarProduto = async (req: Request, res: Response) => {
  try {
    const { nome, tipo, valor, quantidade, unidade_medida } = req.body;

    // Validação dos campos obrigatórios conforme o BD
    if (!nome || !tipo || valor === undefined) {
      return res
        .status(400)
        .json({ error: "Nome, tipo e valor são obrigatórios." });
    }

    const novoProduto = await produtoModel.criarProduto({
      nome,
      tipo,
      valor,
      quantidade: quantidade || 0,
      unidade_medida: unidade_medida || "unidade",
    });

    return res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor ao cadastrar produto." });
  }
};
