import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

// avulso = Pagamento_avulso (venda/compra); assinatura = Pagamento_contrato
export type TipoPagamento = "avulso" | "assinatura";

export interface Pagamento extends RowDataPacket {
  id_pagamento: number;
  tipo: TipoPagamento;
  valor: string;
  forma_pagamento: string | null;
  status: "pago" | "cancelado" | "pendente";
  data_pagamento: string | null;
  id_compra: number | null;
  id_contrato: number | null;
  cpf: string | null;
  nome: string | null;
}

export interface VinculoPagamento extends RowDataPacket {
  id: number;
  valor: string;
  data_inicio: string;
  data_termino: string | null;
}

export async function buscarVinculosPagamento(
  tipo: TipoPagamento,
  cpf: string
): Promise<VinculoPagamento[]> {
  const consulta =
    tipo === "avulso"
      ? `SELECT id_compra AS id,
                valor_total AS valor,
                DATE_FORMAT(data_compra, '%Y-%m-%d') AS data_inicio,
                NULL AS data_termino
           FROM Compra
          WHERE fk_Cliente_cpf = ?
          ORDER BY id_compra DESC`
      : `SELECT id_contrato AS id,
                valor_contrato AS valor,
                DATE_FORMAT(data_inicio, '%Y-%m-%d') AS data_inicio,
                DATE_FORMAT(data_termino, '%Y-%m-%d') AS data_termino
           FROM Contrato
          WHERE fk_Cliente_cpf = ? AND status = 'ativo'
          ORDER BY id_contrato DESC`;

  const [rows] = await pool.query<VinculoPagamento[]>(consulta, [cpf]);
  return rows;
}

// Junta as duas tabelas de pagamento numa única listagem.
// O CPF vem da compra (avulso) ou do contrato (assinatura); compra sem
// cliente fica com cpf e nome nulos.
const SELECT_PAGAMENTOS = `
  SELECT * FROM (
    SELECT pa.id_pagamento,
           'avulso' AS tipo,
           pa.valor,
           pa.forma_pagamento,
           pa.status,
           DATE_FORMAT(pa.data_pagamento, '%Y-%m-%d') AS data_pagamento,
           pa.fk_Compra_id_compra AS id_compra,
           NULL AS id_contrato,
           c.fk_Cliente_cpf AS cpf,
           cl.nome
      FROM Pagamento_avulso pa
      JOIN Compra c ON c.id_compra = pa.fk_Compra_id_compra
      LEFT JOIN Cliente cl ON cl.cpf = c.fk_Cliente_cpf
    UNION ALL
    SELECT pc.id_pagamento,
           'assinatura' AS tipo,
           pc.valor,
           pc.forma_pagamento,
           pc.status,
           DATE_FORMAT(pc.data_pagamento, '%Y-%m-%d') AS data_pagamento,
           NULL AS id_compra,
           pc.fk_Contrato_id_contrato AS id_contrato,
           ct.fk_Cliente_cpf AS cpf,
           cl.nome
      FROM Pagamento_contrato pc
      JOIN Contrato ct ON ct.id_contrato = pc.fk_Contrato_id_contrato
      LEFT JOIN Cliente cl ON cl.cpf = ct.fk_Cliente_cpf
  ) pagamentos
`;

export async function buscarTodosPagamentos(
  tipo?: TipoPagamento
): Promise<Pagamento[]> {
  const [rows] = await pool.query<Pagamento[]>(
    `${SELECT_PAGAMENTOS}
     ${tipo ? "WHERE tipo = ?" : ""}
     ORDER BY id_pagamento DESC, tipo`,
    tipo ? [tipo] : []
  );
  return rows;
}

// O id_pagamento se repete entre as duas tabelas, por isso a busca
// precisa do tipo junto.
export async function buscarPagamentoPorId(
  tipo: TipoPagamento,
  idPagamento: number
): Promise<Pagamento | null> {
  const [rows] = await pool.query<Pagamento[]>(
    `${SELECT_PAGAMENTOS} WHERE tipo = ? AND id_pagamento = ?`,
    [tipo, idPagamento]
  );
  return rows[0] ?? null;
}

export type FormaPagamento =
  | "dinheiro"
  | "cartao de credito"
  | "cartao de debito"
  | "pix"
  | "boleto";

export type StatusPagamento = "pago" | "cancelado" | "pendente";

export interface PagamentoInput {
  tipo: TipoPagamento;
  fk_id: number; // id_compra (avulso) ou id_contrato (assinatura)
  valor: number;
  dataPagamento: string | null;
  formaPagamento: FormaPagamento | null;
  status: StatusPagamento;
}

export async function criarPagamento(input: PagamentoInput): Promise<Pagamento | null> {
  const { tipo, fk_id, valor, dataPagamento, formaPagamento, status } = input;

  if (tipo === "avulso") {
    const [result]: any = await pool.execute(
      `INSERT INTO Pagamento_avulso (fk_Compra_id_compra, valor, data_pagamento, forma_pagamento, status)
       VALUES (?, ?, ?, ?, ?)`,
      [fk_id, valor, dataPagamento || null, formaPagamento || null, status]
    );
    return buscarPagamentoPorId("avulso", result.insertId);
  } else {
    const [result]: any = await pool.execute(
      `INSERT INTO Pagamento_contrato (fk_Contrato_id_contrato, valor, data_pagamento, forma_pagamento, status)
       VALUES (?, ?, ?, ?, ?)`,
      [fk_id, valor, dataPagamento || null, formaPagamento || null, status]
    );
    return buscarPagamentoPorId("assinatura", result.insertId);
  }
}

export async function atualizarPagamento(
  tipo: TipoPagamento,
  idPagamento: number,
  input: Omit<PagamentoInput, "tipo" | "fk_id">
): Promise<Pagamento | null> {
  const { valor, dataPagamento, formaPagamento, status } = input;

  if (tipo === "avulso") {
    await pool.execute(
      `UPDATE Pagamento_avulso
          SET valor = ?, data_pagamento = ?, forma_pagamento = ?, status = ?
        WHERE id_pagamento = ?`,
      [valor, dataPagamento || null, formaPagamento || null, status, idPagamento]
    );
  } else {
    await pool.execute(
      `UPDATE Pagamento_contrato
          SET valor = ?, data_pagamento = ?, forma_pagamento = ?, status = ?
        WHERE id_pagamento = ?`,
      [valor, dataPagamento || null, formaPagamento || null, status, idPagamento]
    );
  }

  return buscarPagamentoPorId(tipo, idPagamento);
}

export async function removerPagamento(
  tipo: TipoPagamento,
  idPagamento: number
): Promise<boolean> {
  const tabela = tipo === "avulso" ? "Pagamento_avulso" : "Pagamento_contrato";
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM ${tabela} WHERE id_pagamento = ?`,
    [idPagamento]
  );
  return result.affectedRows > 0;
}
