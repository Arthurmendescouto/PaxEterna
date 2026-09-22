import { pool } from "../config/db";

export interface Endereco {
  logradouro: string;
  numEndereco: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
}

export interface Cliente {
  cpf: string;
  nome: string;
  rg: string;
  dataNascimento: string;
  telefones: string[]; // um cliente pode ter mais de um telefone
  endereco: Endereco;
}

export async function findClienteByCpf(cpf: string) {
  const [clienteRows]: any = await pool.query(
    "SELECT * FROM Cliente WHERE cpf = ?",
    [cpf]
  );
  const cliente = clienteRows[0];
  if (!cliente) return null;

  const [telefoneRows]: any = await pool.query(
    "SELECT telefone FROM Telefone WHERE cpf = ?",
    [cpf]
  );

  return {
    ...cliente,
    telefones: telefoneRows.map((t: any) => t.telefone),
  };
}

export async function createCliente(cliente: Cliente) {
  const { cpf, nome, rg, dataNascimento, telefones, endereco } = cliente;
  const { logradouro, numEndereco, bairro, cep, cidade, uf } = endereco;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO Cliente
         (cpf, nome, rg, data_nascimento, logradouro, num_endereco, bairro, cep, cidade, uf, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')`,
      [cpf, nome, rg, dataNascimento, logradouro, numEndereco, bairro, cep, cidade, uf]
    );

    for (const telefone of telefones) {
      await conn.query(
        "INSERT INTO Telefone (telefone, cpf) VALUES (?, ?)",
        [telefone, cpf]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return findClienteByCpf(cpf);
}
