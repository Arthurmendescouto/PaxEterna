import { Request, Response } from "express";
import {
  atualizarCompra as atualizarCompraNoBanco,
  buscarTodasCompras,
  CompraErro,
  criarCompra,
  ItemCompraInput,
  removerCompra,
} from "../models/compraModel";
import { isValidCpf, isValidDate } from "../utils/validators";

function validarCompra(body: unknown):
  | { erro: string }
  | { dados: { cpfCliente: string | null; dataCompra: string; itens: ItemCompraInput[] } } {
  if (!body || typeof body !== "object") {
    return { erro: "Preencha todos os campos obrigatórios!" };
  }

  const dados = body as Record<string, unknown>;
  const cpfInformado = dados.cpfCliente;
  const cpfCliente =
    cpfInformado === null || cpfInformado === ""
      ? null
      : typeof cpfInformado === "string"
        ? cpfInformado.replace(/\D/g, "")
        : undefined;

  if (
    cpfCliente === undefined ||
    (cpfCliente !== null && !isValidCpf(cpfCliente))
  ) {
    return { erro: "CPF inválido! Use o formato: 000.000.000-00" };
  }

  const dataCompra = dados.dataCompra;
  if (
    typeof dataCompra !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dataCompra) ||
    !isValidDate(dataCompra) ||
    new Date(dataCompra).toISOString().slice(0, 10) !== dataCompra
  ) {
    return { erro: "Data da compra inválida!" };
  }

  if (!Array.isArray(dados.itens) || dados.itens.length === 0) {
    return { erro: "Adicione ao menos um item à compra!" };
  }

  const itens: ItemCompraInput[] = [];
  const chaves = new Set<string>();
  for (const item of dados.itens) {
    if (!item || typeof item !== "object") {
      return { erro: "Item da compra inválido!" };
    }

    const itemDados = item as Record<string, unknown>;
    const tipo = itemDados.tipo;
    const itemId = itemDados.itemId;
    const quantidade = itemDados.quantidade;
    if (
      (tipo !== "produto" && tipo !== "servico") ||
      typeof itemId !== "number" ||
      !Number.isInteger(itemId) ||
      itemId <= 0 ||
      typeof quantidade !== "number" ||
      !Number.isInteger(quantidade) ||
      quantidade < 1 ||
      quantidade > 4_294_967_295
    ) {
      return { erro: "Item ou quantidade inválida!" };
    }

    const chave = `${tipo}:${itemId}`;
    if (chaves.has(chave)) {
      return { erro: "Não repita o mesmo item na compra!" };
    }
    chaves.add(chave);
    itens.push({ itemId, tipo, quantidade });
  }

  return { dados: { cpfCliente, dataCompra, itens } };
}

function responderErroCompra(error: unknown, res: Response) {
  if (!(error instanceof CompraErro)) return false;

  switch (error.codigo) {
    case "CLIENTE_NAO_ENCONTRADO":
      res.status(404).json({ error: "Cliente ativo não encontrado." });
      break;
    case "COMPRA_NAO_ENCONTRADA":
      res.status(404).json({ error: "Compra não encontrada." });
      break;
    case "ITEM_NAO_ENCONTRADO":
      res.status(404).json({ error: "Item não encontrado ou tipo inválido." });
      break;
    case "ESTOQUE_INSUFICIENTE":
      res.status(409).json({ error: "Estoque insuficiente para o item selecionado!" });
      break;
    case "VALOR_TOTAL_EXCEDIDO":
      res.status(400).json({ error: "O valor total da compra excede o limite permitido." });
      break;
  }
  return true;
}

export async function buscarCompras(_req: Request, res: Response) {
  try {
    const compras = await buscarTodasCompras();
    return res.status(200).json(compras);
  } catch (error) {
    console.error("Erro ao buscar compras:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export async function cadastrarCompra(req: Request, res: Response) {
  const validacao = validarCompra(req.body);
  if ("erro" in validacao) {
    return res.status(400).json({ error: validacao.erro });
  }

  try {
    const compra = await criarCompra(validacao.dados);
    return res.status(201).json({
      message: "Operação realizada com sucesso!",
      compra,
    });
  } catch (error) {
    if (responderErroCompra(error, res)) return;
    console.error("Erro ao cadastrar compra:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export async function atualizarCompra(req: Request, res: Response) {
  const idCompra = Number(req.params.id_compra);
  if (!Number.isInteger(idCompra) || idCompra <= 0) {
    return res.status(400).json({ error: "Identificador da compra inválido." });
  }

  const validacao = validarCompra(req.body);
  if ("erro" in validacao) {
    return res.status(400).json({ error: validacao.erro });
  }

  try {
    const compra = await atualizarCompraNoBanco(idCompra, validacao.dados);
    return res.status(200).json({
      message: "Operação realizada com sucesso!",
      compra,
    });
  } catch (error) {
    if (responderErroCompra(error, res)) return;
    console.error("Erro ao atualizar compra:", error);
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
