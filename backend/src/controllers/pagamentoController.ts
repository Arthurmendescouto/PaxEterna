import { Request, Response } from "express";
import {
  buscarPagamentoPorId,
  buscarTodosPagamentos,
  TipoPagamento,
} from "../models/pagamentoModel";

function tipoValido(valor: unknown): valor is TipoPagamento {
  return valor === "avulso" || valor === "assinatura";
}

// [RF024] Lista os pagamentos. Aceita ?tipo=avulso ou ?tipo=assinatura.
export async function buscarPagamentos(req: Request, res: Response) {
  const { tipo } = req.query;
  if (tipo !== undefined && !tipoValido(tipo)) {
    return res
      .status(400)
      .json({ error: "Tipo de pagamento inválido! Use avulso ou assinatura." });
  }

  try {
    const pagamentos = await buscarTodosPagamentos(tipo);
    return res.status(200).json(pagamentos);
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// [RF024] Detalhes de um pagamento pelo tipo e id_pagamento.
export async function buscarPagamento(req: Request, res: Response) {
  const { tipo } = req.params;
  const idPagamento = Number(req.params.id_pagamento);

  if (!tipoValido(tipo)) {
    return res
      .status(400)
      .json({ error: "Tipo de pagamento inválido! Use avulso ou assinatura." });
  }
  if (!Number.isSafeInteger(idPagamento) || idPagamento <= 0) {
    return res.status(400).json({ error: "ID do pagamento inválido." });
  }

  try {
    const pagamento = await buscarPagamentoPorId(tipo, idPagamento);
    if (!pagamento) {
      // RF024 exceção 5.1.1
      return res.status(404).json({ error: "Nenhum resultado encontrado!" });
    }
    return res.status(200).json(pagamento);
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
