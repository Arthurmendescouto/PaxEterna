import { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";

export interface ServicoInput {
  nome: string;
  valor: string;
  descricao?: string | null;
}

export async function criarServico({ nome, valor, descricao = null }: ServicoInput) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO Recurso (nome, valor, descricao, tipo, unidade_medida)
     VALUES (?, ?, ?, 'servico', 'unidade')`,
    [nome, valor, descricao],
  );

  return { id_recurso: result.insertId, nome, valor, descricao };
}

export async function atualizarServico(
  idRecurso: number,
  { nome, valor, descricao = null }: ServicoInput,
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE Recurso
        SET nome = ?, valor = ?, descricao = ?
      WHERE id_recurso = ? AND tipo = 'servico'`,
    [nome, valor, descricao, idRecurso],
  );

  // O mysql2 usa FOUND_ROWS, então uma atualização sem mudanças também encontra o registro.
  if (result.affectedRows === 0) return null;

  return { id_recurso: idRecurso, nome, valor, descricao };
}
