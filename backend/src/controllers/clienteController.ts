import { Request, Response } from "express";
import {
  Cliente,
  createCliente,
  desativarCliente,
  findAllClientes,
  findClienteByCpf,
  updateCliente,
} from "../models/clienteModel";
import { isValidCpf, isValidCpfFormat, isValidDate } from "../utils/validators";

const somenteDigitos = (valor: string) => String(valor ?? "").replace(/\D/g, "");

// Valida o corpo enviado no cadastro/atualização.
// Retorna a mensagem de erro ou os dados já normalizados para o banco.
function validarCliente(
  body: any
): { erro: string } | { dados: Cliente } {
  const { nome, cpf, dataNascimento, telefone, email, endereco } = body ?? {};

  // Exceção 8.1 (RF001) / 10.1 (RF002) — campos obrigatórios:
  // Nome, CPF, Telefone, Endereço, Cidade e UF.
  // Data de nascimento e Email são opcionais.
  const telefoneDigitos = somenteDigitos(telefone);
  if (
    !nome?.trim() ||
    !cpf ||
    !telefoneDigitos ||
    !endereco ||
    !endereco.logradouro?.trim() ||
    !endereco.numEndereco?.trim() ||
    !endereco.bairro?.trim() ||
    !endereco.cep ||
    !endereco.cidade?.trim() ||
    !endereco.uf
  ) {
    return { erro: "Preencha todos os campos obrigatórios!" };
  }

  // Exceção 8.2 (RF001) / 10.2 (RF002) — CPF com formato inválido
  if (!isValidCpfFormat(cpf) || !isValidCpf(cpf)) {
    return { erro: "CPF inválido! Use o formato: 000.000.000-00" };
  }

  if (
    dataNascimento &&
    (!isValidDate(dataNascimento) || new Date(dataNascimento) > new Date())
  ) {
    return { erro: "Data de nascimento inválida!" };
  }

  if (telefoneDigitos.length < 10 || telefoneDigitos.length > 11) {
    return { erro: "Telefone inválido! Use o formato: (00) 00000-0000" };
  }

  const emailLimpo = String(email ?? "").trim();
  if (emailLimpo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
    return { erro: "Email inválido!" };
  }

  const cep = somenteDigitos(endereco.cep);
  if (cep.length !== 8) {
    return { erro: "CEP inválido! Use o formato: 00000-000" };
  }

  const uf = String(endereco.uf).trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(uf)) {
    return { erro: "UF inválida!" };
  }

  return {
    dados: {
      cpf: somenteDigitos(cpf),
      nome: nome.trim(),
      dataNascimento: dataNascimento || null,
      telefone: telefoneDigitos,
      email: emailLimpo || null,
      endereco: {
        logradouro: endereco.logradouro.trim(),
        numEndereco: endereco.numEndereco.trim(),
        bairro: endereco.bairro.trim(),
        cep,
        cidade: endereco.cidade.trim(),
        uf,
      },
    },
  };
}

// Busca o cliente ativo pelo CPF da URL (aceita com ou sem máscara).
async function buscarClienteAtivo(cpfParam: string) {
  const cpf = somenteDigitos(cpfParam);
  if (!isValidCpf(cpf)) return { cpf, cliente: null, cpfInvalido: true };

  const cliente = await findClienteByCpf(cpf);
  return {
    cpf,
    cliente: cliente && cliente.status === "ativo" ? cliente : null,
    cpfInvalido: false,
  };
}

// [RF001] Cadastrar Cliente
export async function cadastrarCliente(req: Request, res: Response) {
  const resultado = validarCliente(req.body);
  if ("erro" in resultado) {
    return res.status(400).json({ message: resultado.erro });
  }

  try {
    // Exceção 8.3 — cliente já cadastrado (mesmo CPF, ativo ou inativo)
    const existente = await findClienteByCpf(resultado.dados.cpf);
    if (existente) {
      return res
        .status(409)
        .json({ message: "Existe um cliente cadastrado com esses dados!" });
    }

    const cliente = await createCliente(resultado.dados);

    return res.status(201).json({
      message: "Operação realizada com sucesso!",
      cliente,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// [RF004] Consultar Cliente — listagem
export async function buscarClientes(_req: Request, res: Response) {
  try {
    const clientes = await findAllClientes();
    return res.status(200).json(clientes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// [RF004] Consultar Cliente — detalhes por CPF
export async function buscarCliente(req: Request, res: Response) {
  try {
    const { cliente, cpfInvalido } = await buscarClienteAtivo(req.params.cpf);

    if (cpfInvalido) {
      return res
        .status(400)
        .json({ message: "CPF inválido! Use o formato: 000.000.000-00" });
    }
    if (!cliente) {
      return res.status(404).json({ message: "Nenhum resultado encontrado!" });
    }

    return res.status(200).json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// [RF002] Atualizar Cliente
export async function atualizarCliente(req: Request, res: Response) {
  const resultado = validarCliente(req.body);
  if ("erro" in resultado) {
    return res.status(400).json({ message: resultado.erro });
  }
  const dados = resultado.dados;

  try {
    const { cpf: cpfAtual, cliente } = await buscarClienteAtivo(req.params.cpf);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado!" });
    }

    // Exceção 10.3 — CPF alterado para um que já pertence a outro cliente
    if (dados.cpf !== cpfAtual) {
      const outroCliente = await findClienteByCpf(dados.cpf);
      if (outroCliente) {
        return res
          .status(409)
          .json({ message: "Existe outro cliente cadastrado com este CPF!" });
      }
    }

    const clienteAtualizado = await updateCliente(cpfAtual, dados);

    return res.status(200).json({
      message: "Operação realizada com sucesso!",
      cliente: clienteAtualizado,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// [RF003] Deletar Cliente — marca o cliente como inativo
export async function deletarCliente(req: Request, res: Response) {
  try {
    const { cpf, cliente } = await buscarClienteAtivo(req.params.cpf);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado!" });
    }

    await desativarCliente(cpf);

    return res.status(200).json({ message: "Cliente deletado com sucesso!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
