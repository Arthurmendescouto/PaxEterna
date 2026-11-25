import { Request, Response } from "express";
import * as servicoModel from "../models/servicoModel";

function validarServico(body: { nome?: unknown; valor?: unknown; descricao?: unknown } | null | undefined):
  servicoModel.ServicoInput | { error: string } {
  const { nome, valor, descricao } = body ?? {};
  const nomeServico = typeof nome === "string" ? nome.trim() : "";
  if (!nomeServico || [...nomeServico].length > 100) {
    return { error: "Informe um nome de até 100 caracteres." };
  }

  const valorInformado = typeof valor === "number" || typeof valor === "string"
    ? String(valor).trim()
    : "";
  // O valor deve caber em DECIMAL(7,2) UNSIGNED sem arredondamento.
  if (!/^0*\d{1,5}(?:\.\d{1,2})?$/.test(valorInformado)) {
    return { error: "Informe um valor de 0 a 99999.99 com até duas casas decimais." };
  }

  if (descricao != null && (typeof descricao !== "string" || Buffer.byteLength(descricao, "utf8") > 65535)) {
    return { error: "Descrição inválida." };
  }

  return { nome: nomeServico, valor: Number(valorInformado).toFixed(2), descricao };
}

export const cadastrarServico = async (req: Request, res: Response) => {
  const dados = validarServico(req.body);
  if ("error" in dados) return res.status(400).json(dados);

  try {
    const servico = await servicoModel.criarServico(dados);
    return res.status(201).json({
      message: "Operação realizada com sucesso!",
      servico,
    });
  } catch (error) {
    console.error("Erro ao cadastrar serviço:", error);
    return res.status(500).json({ error: "Erro de conexão. Tente novamente mais tarde." });
  }
};

export const atualizarServico = async (req: Request, res: Response) => {
  const { id_recurso } = req.params;
  const idRecurso = Number(id_recurso);
  if (!/^\d+$/.test(id_recurso) || !Number.isSafeInteger(idRecurso) || idRecurso <= 0) {
    return res.status(400).json({ error: "Identificador de serviço inválido." });
  }

  const dados = validarServico(req.body);
  if ("error" in dados) return res.status(400).json(dados);

  try {
    const servico = await servicoModel.atualizarServico(idRecurso, dados);
    if (!servico) {
      return res.status(404).json({ error: "Serviço não encontrado." });
    }

    return res.status(200).json({
      message: "Operação realizada com sucesso!",
      servico,
    });
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    return res.status(500).json({ error: "Erro de conexão. Tente novamente mais tarde." });
  }
};
