import { pool } from "../config/db";

export interface Endereco {
  logradouro: string;
  numEndereco: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
}

// Campos do RF001/RF002. "Possui contrato" e "Data de criação" não são
// informados pelo usuário: vêm do banco (ver SELECT_CLIENTE).
export interface Cliente {
  cpf: string;
  nome: string;
  dataNascimento: string | null;
  telefone: string;
  email: string | null;
  endereco: Endereco;
}

// Colunas do cliente já no formato usado pela API (camelCase).
// As datas vêm como texto (YYYY-MM-DD) para não sofrer ajuste de fuso.
// O RF prevê um único telefone por cliente; ele fica na tabela Telefone.
// "possuiContrato" indica se o cliente tem algum contrato ativo.
const SELECT_CLIENTE = `
  SELECT c.cpf, c.nome,
         DATE_FORMAT(c.data_nascimento, '%Y-%m-%d') AS dataNascimento,
         (SELECT t.telefone FROM Telefone t WHERE t.cpf = c.cpf LIMIT 1) AS telefone,
         c.email,
         c.logradouro, c.num_endereco AS numEndereco, c.bairro, c.cep,
         c.cidade, c.uf, c.status,
         DATE_FORMAT(c.data_criacao, '%Y-%m-%d') AS dataCriacao,
         EXISTS (
           SELECT 1 FROM Contrato ct
            WHERE ct.fk_Cliente_cpf = c.cpf AND ct.status = 'ativo'
         ) AS possuiContrato
    FROM Cliente c`;

function montarCliente(row: any) {
  return {
    cpf: row.cpf,
    nome: row.nome,
    dataNascimento: row.dataNascimento ?? null,
    telefone: row.telefone ?? "",
    email: row.email ?? null,
    endereco: {
      logradouro: row.logradouro ?? "",
      numEndereco: row.numEndereco ?? "",
      bairro: row.bairro ?? "",
      cep: row.cep ?? "",
      cidade: row.cidade ?? "",
      uf: row.uf ?? "",
    },
    possuiContrato: Boolean(row.possuiContrato),
    dataCriacao: row.dataCriacao,
    status: row.status,
  };
}

// Busca o cliente pelo CPF, independente do status (ativo ou inativo).
export async function findClienteByCpf(cpf: string) {
  const [rows]: any = await pool.query(`${SELECT_CLIENTE} WHERE c.cpf = ?`, [cpf]);
  return rows[0] ? montarCliente(rows[0]) : null;
}

// Lista apenas os clientes ativos (os inativos foram desativados — RF003).
export async function findAllClientes() {
  const [rows]: any = await pool.query(
    `${SELECT_CLIENTE} WHERE c.status = 'ativo' ORDER BY c.nome, c.cpf`
  );
  return rows.map(montarCliente);
}

export async function createCliente(cliente: Cliente) {
  const { cpf, nome, dataNascimento, telefone, email, endereco } = cliente;
  const { logradouro, numEndereco, bairro, cep, cidade, uf } = endereco;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO Cliente
         (cpf, nome, data_nascimento, email, logradouro, num_endereco, bairro, cep, cidade, uf, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')`,
      [cpf, nome, dataNascimento, email, logradouro, numEndereco, bairro, cep, cidade, uf]
    );

    await conn.query("INSERT INTO Telefone (telefone, cpf) VALUES (?, ?)", [telefone, cpf]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return findClienteByCpf(cpf);
}

export async function updateCliente(cpfAtual: string, dados: Cliente) {
  const { cpf: novoCpf, nome, dataNascimento, telefone, email, endereco } = dados;
  const { logradouro, numEndereco, bairro, cep, cidade, uf } = endereco;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Como a FK Telefone.cpf tem ON UPDATE CASCADE,
    // trocar o cpf aqui já propaga para Telefone.
    await conn.query(
      `UPDATE Cliente
          SET cpf = ?, nome = ?, data_nascimento = ?, email = ?,
              logradouro = ?, num_endereco = ?, bairro = ?, cep = ?, cidade = ?, uf = ?
        WHERE cpf = ?`,
      [novoCpf, nome, dataNascimento, email, logradouro, numEndereco, bairro, cep, cidade, uf, cpfAtual]
    );

    // Substitui o telefone pelo enviado na atualização
    await conn.query("DELETE FROM Telefone WHERE cpf = ?", [novoCpf]);
    await conn.query("INSERT INTO Telefone (telefone, cpf) VALUES (?, ?)", [telefone, novoCpf]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return findClienteByCpf(novoCpf);
}

// RF003: o cliente não é apagado, apenas marcado como inativo.
// Assim contratos e compras ligados a ele são preservados.
export async function desativarCliente(cpf: string) {
  await pool.query("UPDATE Cliente SET status = 'inativo' WHERE cpf = ?", [cpf]);
}
