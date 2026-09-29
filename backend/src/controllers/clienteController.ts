import { Request, Response } from "express";
import {
  createCliente,
  findAllClientes,
  findClienteByCpf,
  updateCliente,
} from "../models/clienteModel";
import { isValidCpf, isValidCpfFormat, isValidDate } from "../utils/validators";

// [RF001] Cadastrar Cliente
export async function cadastrarCliente(req: Request, res: Response) {
  const { nome, cpf, rg, dataNascimento, telefones, endereco } = req.body;

  // Exceção 8.1 — campos obrigatórios não preenchidos
  if (
    !nome ||
    !cpf ||
    !rg ||
    !dataNascimento ||
    !Array.isArray(telefones) ||
    telefones.length === 0 ||
    !endereco ||
    !endereco.logradouro ||
    !endereco.numEndereco ||
    !endereco.bairro ||
    !endereco.cep ||
    !endereco.cidade ||
    !endereco.uf
  ) {
    return res
      .status(400)
      .json({ message: "Preencha todos os campos obrigatórios!" });
  }

  // Exceção 8.2 — CPF com formato inválido
  if (!isValidCpfFormat(cpf) || !isValidCpf(cpf)) {
    return res
      .status(400)
      .json({ message: "CPF inválido! Use o formato: 000.000.000-00" });
  }

  if (!isValidDate(dataNascimento)) {
    return res.status(400).json({ message: "Data de nascimento inválida!" });
  }

  try {
    // Exceção 8.3 — cliente já cadastrado
    const cpfDigits = cpf.replace(/\D/g, "");
    const existente = await findClienteByCpf(cpfDigits);
    if (existente) {
      return res
        .status(409)
        .json({ message: "Existe um cliente cadastrado com esses dados!" });
    }

    const cliente = await createCliente({
      cpf: cpfDigits,
      nome,
      rg,
      dataNascimento,
      telefones: telefones.map((t: string) => t.replace(/\D/g, "")),
      endereco,
    });

    return res.status(201).json({
      message: "Operação realizada com sucesso!",
      cliente,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// [RF002] Buscar Cliente por CPF
export async function buscarCliente(req: Request, res: Response) {
  const cpfDigits = req.params.cpf.replace(/\D/g, "");

  if (!isValidCpfFormat(req.params.cpf) || !isValidCpf(cpfDigits)) {
    return res
      .status(400)
      .json({ message: "CPF inválido! Use o formato: 000.000.000-00" });
  }

  try {
    const cliente = await findClienteByCpf(cpfDigits);

    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    return res.status(200).json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// [RF003] Buscar todos os clientes
export async function buscarClientes(req: Request, res: Response) {
  try {
    const clientes = await findAllClientes();
    return res.status(200).json(clientes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}





// [RF002] Atualizar Cliente
export async function atualizarCliente(req: Request, res: Response) {
  const cpfAtual = req.params.cpf.replace(/\D/g, "");
  const { nome, cpf, rg, dataNascimento, telefones, endereco } = req.body;

  // Exceção 10.1 — campos obrigatórios apagados ou não preenchidos
  if (
    !nome ||
    !cpf ||
    !rg ||
    !dataNascimento ||
    !Array.isArray(telefones) ||
    telefones.length === 0 ||
    !endereco ||
    !endereco.logradouro ||
    !endereco.numEndereco ||
    !endereco.bairro ||
    !endereco.cep ||
    !endereco.cidade ||
    !endereco.uf
  ) {
    return res
      .status(400)
      .json({ message: "Preencha todos os campos obrigatórios!" });
  }

  // Exceção 10.2 — CPF alterado para um formato inválido
  if (!isValidCpfFormat(cpf) || !isValidCpf(cpf)) {
    return res
      .status(400)
      .json({ message: "CPF inválido! Use o formato: 000.000.000-00" });
  }

  if (!isValidDate(dataNascimento)) {
    return res.status(400).json({ message: "Data de nascimento inválida!" });
  }

  try {
    const novoCpf = cpf.replace(/\D/g, "");

    const clienteAtual = await findClienteByCpf(cpfAtual);
    if (!clienteAtual) {
      return res.status(404).json({ message: "Cliente não encontrado!" });
    }

    // Exceção 10.3 — CPF alterado para um que já pertence a outro cliente
    if (novoCpf !== cpfAtual) {
      const outroCliente = await findClienteByCpf(novoCpf);
      if (outroCliente) {
        return res
          .status(409)
          .json({ message: "Existe outro cliente cadastrado com este CPF!" });
      }
    }

    const cliente = await updateCliente(cpfAtual, {
      cpf: novoCpf,
      nome,
      rg,
      dataNascimento,
      telefones: telefones.map((t: string) => t.replace(/\D/g, "")),
      endereco,
    });

    return res.status(200).json({
      message: "Operação realizada com sucesso!",
      cliente,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
