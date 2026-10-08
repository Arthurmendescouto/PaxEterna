import { Request, Response } from "express";
import * as produtoModel from "../models/produtoModel";

export const cadastrarProduto = async (req: Request, res: Response) => {
  try {
    const { nome, tipo, valor, quantidade, unidade_medida } = req.body;

    if (!nome || !tipo || valor === undefined || quantidade === undefined) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios!" });
    }

    // Exceção: Valor com formato inválido (negativo)
    if (valor < 0) {
      return res.status(400).json({ error: "Valor inválido!" });
    }

    // Exceção: Produto com o mesmo nome já existe
    const produtoExistente = await produtoModel.buscarProdutoPorNome(nome);
    if (produtoExistente) {
      return res
        .status(409)
        .json({ error: "Um produto com o mesmo nome exato já existe!" });
    }

    const novoProduto = await produtoModel.criarProduto({
      nome,
      tipo,
      valor,
      quantidade,
      unidade_medida: unidade_medida || "unidade",
    });

    return res.status(201).json({
      message: "Operação realizada com sucesso!",
      produto: novoProduto,
    });
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    return res
      .status(500)
      .json({ error: "Erro de conexão. Tente novamente mais tarde." });
  }
};

export const atualizarProduto = async (req: Request, res: Response) => {
  try {
    const { id_produto } = req.params;
    const { nome, tipo, valor, quantidade, unidade_medida } = req.body;

    // Verificar se o produto existe no banco
    const produtoExistente = await produtoModel.buscarProdutoPorId(
      Number(id_produto),
    );
    if (!produtoExistente) {
      return res.status(404).json({ error: "Nenhum resultado encontrado!" }); // Mensagem do fluxo alternativo
    }

    // Exceção: Campos obrigatórios apagados ou não preenchidos
    if (!nome || !tipo || valor === undefined || quantidade === undefined) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios!" });
    }

    // Exceção: Valor com formato inválido (negativo)
    if (valor < 0) {
      return res.status(400).json({ error: "Valor inválido!" });
    }

    // Exceção: Quantidade com formato inválido (negativa)
    if (quantidade < 0) {
      return res.status(400).json({ error: "Quantidade inválida!" });
    }

    // Atualização do produto
    const produtoAtualizado = await produtoModel.atualizarProduto(
      Number(id_produto),
      {
        nome,
        tipo,
        valor,
        quantidade,
        unidade_medida: unidade_medida || produtoExistente.unidade_medida,
      },
    );

    return res.status(200).json({
      message: "Operação realizada com sucesso!",
      produto: produtoAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return res
      .status(500)
      .json({ error: "Erro de conexão. Tente novamente mais tarde." });
  }
};
