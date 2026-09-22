import { Request, Response } from "express";
import { createCliente, findClienteByCpf } from "../models/clienteModel";
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
