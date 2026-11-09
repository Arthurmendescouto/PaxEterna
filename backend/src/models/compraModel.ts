import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export interface Compra extends RowDataPacket {
  id_compra: number;
  fk_Cliente_cpf: string;
  data_compra: string;
  valor_total: string;
}

export async function buscarTodasCompras(): Promise<Compra[]> {
  const [rows] = await pool.query<Compra[]>(`
    SELECT id_compra,
           fk_Cliente_cpf,
           DATE_FORMAT(data_compra, '%Y-%m-%d') AS data_compra,
           valor_total
      FROM Compra
     ORDER BY id_compra DESC
  `);

  return rows;
}

export async function removerCompra(idCompra: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM Compra WHERE id_compra = ?",
    [idCompra],
  );

  return result.affectedRows > 0;
}
