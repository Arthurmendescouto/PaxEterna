import { RowDataPacket } from "mysql2";
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
