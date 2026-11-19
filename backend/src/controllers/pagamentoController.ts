import { Request, Response } from "express";
import {
  buscarPagamentoPorId,
  buscarTodosPagamentos,
  criarPagamento,
  type FormaPagamento,
  type StatusPagamento,
  type TipoPagamento,
} from "../models/pagamentoModel";

function tipoValido(valor: unknown): valor is TipoPagamento {
  return valor === "avulso" || valor === "assinatura";
}

const FORMAS_VALIDAS: FormaPagamento[] = [
  "dinheiro",
  "cartao de credito",
  "cartao de debito",
  "pix",
  "boleto",
];

const STATUS_VALIDOS: StatusPagamento[] = ["pago", "cancelado", "pendente"];

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
      return res.status(404).json({ error: "Nenhum resultado encontrado!" });
    }
    return res.status(200).json(pagamento);
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// [RF] Cadastrar pagamento
export async function cadastrarPagamento(req: Request, res: Response) {
  const { tipo, fk_id, valor, dataPagamento, formaPagamento, status } = req.body;

  if (!tipo || !fk_id || valor === undefined || !status) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios!" });
  }

  if (!tipoValido(tipo)) {
    return res.status(400).json({ error: "Tipo inválido! Use 'avulso' ou 'assinatura'." });
  }

  if (typeof valor !== "number" || valor <= 0) {
    return res.status(400).json({ error: "Valor inválido!" });
  }

  if (formaPagamento && !FORMAS_VALIDAS.includes(formaPagamento)) {
    return res.status(400).json({ error: `Forma de pagamento inválida! Use: ${FORMAS_VALIDAS.join(", ")}.` });
  }

  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ error: `Status inválido! Use: ${STATUS_VALIDOS.join(", ")}.` });
  }

  try {
    const pagamento = await criarPagamento({
      tipo,
      fk_id: Number(fk_id),
      valor,
      dataPagamento: dataPagamento || null,
      formaPagamento: formaPagamento || null,
      status,
    });

    return res.status(201).json({
      message: "Operação realizada com sucesso!",
      pagamento,
    });
  } catch (error) {
    console.error("Erro ao cadastrar pagamento:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
