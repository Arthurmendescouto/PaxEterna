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

export async function findAllClientes() {
  const [clienteRows]: any = await pool.query(
    "SELECT * FROM Cliente ORDER BY nome, cpf"
  );
  if (clienteRows.length === 0) return [];

  const cpfs = clienteRows.map((cliente: any) => cliente.cpf);
  const placeholders = cpfs.map(() => "?").join(", ");
  const [telefoneRows]: any = await pool.query(
    `SELECT cpf, telefone FROM Telefone WHERE cpf IN (${placeholders})`,
    cpfs
  );

  const telefonesPorCpf = new Map<string, string[]>();
  for (const telefoneRow of telefoneRows) {
    const telefones = telefonesPorCpf.get(telefoneRow.cpf) ?? [];
    telefones.push(telefoneRow.telefone);
    telefonesPorCpf.set(telefoneRow.cpf, telefones);
  }

  return clienteRows.map((cliente: any) => ({
    ...cliente,
    telefones: telefonesPorCpf.get(cliente.cpf) ?? [],
  }));
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

export async function updateCliente(cpfAtual: string, dados: Cliente) {
  const { cpf: novoCpf, nome, rg, dataNascimento, telefones, endereco } = dados;
  const { logradouro, numEndereco, bairro, cep, cidade, uf } = endereco;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Atualiza os dados do cliente. Como a FK Telefone.cpf tem
    // ON UPDATE CASCADE, trocar o cpf aqui já propaga para Telefone.
    await conn.query(
      `UPDATE Cliente
          SET cpf = ?, nome = ?, rg = ?, data_nascimento = ?,
              logradouro = ?, num_endereco = ?, bairro = ?, cep = ?, cidade = ?, uf = ?
        WHERE cpf = ?`,
      [novoCpf, nome, rg, dataNascimento, logradouro, numEndereco, bairro, cep, cidade, uf, cpfAtual]
    );

    // Substitui a lista de telefones pela enviada na atualização
    await conn.query("DELETE FROM Telefone WHERE cpf = ?", [novoCpf]);
    for (const telefone of telefones) {
      await conn.query(
        "INSERT INTO Telefone (telefone, cpf) VALUES (?, ?)",
        [telefone, novoCpf]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return findClienteByCpf(novoCpf);
}
