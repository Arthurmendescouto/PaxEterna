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

// Colunas do cliente já no formato usado pela API (camelCase).
// A data vem como texto (YYYY-MM-DD) para não sofrer ajuste de fuso.
// "possuiContrato" indica se o cliente tem algum contrato ativo.
const SELECT_CLIENTE = `
  SELECT c.cpf, c.nome, c.rg,
         DATE_FORMAT(c.data_nascimento, '%Y-%m-%d') AS dataNascimento,
         c.logradouro, c.num_endereco AS numEndereco, c.bairro, c.cep,
         c.cidade, c.uf, c.status,
         EXISTS (
           SELECT 1 FROM Contrato ct
            WHERE ct.fk_Cliente_cpf = c.cpf AND ct.status = 'ativo'
         ) AS possuiContrato
    FROM Cliente c`;

function montarCliente(row: any, telefones: string[]) {
  return {
    cpf: row.cpf,
    nome: row.nome,
    rg: row.rg,
    dataNascimento: row.dataNascimento,
    telefones,
    endereco: {
      logradouro: row.logradouro ?? "",
      numEndereco: row.numEndereco ?? "",
      bairro: row.bairro ?? "",
      cep: row.cep ?? "",
      cidade: row.cidade ?? "",
      uf: row.uf ?? "",
    },
    status: row.status,
    possuiContrato: Boolean(row.possuiContrato),
  };
}

// Busca o cliente pelo CPF, independente do status (ativo ou inativo).
export async function findClienteByCpf(cpf: string) {
  const [clienteRows]: any = await pool.query(
    `${SELECT_CLIENTE} WHERE c.cpf = ?`,
    [cpf]
  );
  const cliente = clienteRows[0];
  if (!cliente) return null;

  const [telefoneRows]: any = await pool.query(
    "SELECT telefone FROM Telefone WHERE cpf = ?",
    [cpf]
  );

  return montarCliente(
    cliente,
    telefoneRows.map((t: any) => t.telefone)
  );
}

// Lista apenas os clientes ativos (os inativos foram "deletados" — RF003).
export async function findAllClientes() {
  const [clienteRows]: any = await pool.query(
    `${SELECT_CLIENTE} WHERE c.status = 'ativo' ORDER BY c.nome, c.cpf`
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

  return clienteRows.map((cliente: any) =>
    montarCliente(cliente, telefonesPorCpf.get(cliente.cpf) ?? [])
  );
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

// RF003: o cliente não é apagado, apenas marcado como inativo.
// Assim contratos e compras ligados a ele são preservados.
export async function desativarCliente(cpf: string) {
  await pool.query("UPDATE Cliente SET status = 'inativo' WHERE cpf = ?", [cpf]);
}
