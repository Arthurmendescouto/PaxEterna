import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export type TipoItemCompra = "produto" | "servico";

export interface ItemCompraInput {
  itemId: number;
  tipo: TipoItemCompra;
  quantidade: number;
}

export interface CompraInput {
  cpfCliente: string | null;
  dataCompra: string;
  itens: ItemCompraInput[];
}

interface CompraRow extends RowDataPacket {
  id_compra: number;
  fk_Cliente_cpf: string | null;
  data_compra: string;
  valor_total: string;
  id_item_compra: number | null;
  item_id: number | null;
  item_tipo: TipoItemCompra | null;
  item_nome: string | null;
  item_quantidade: number | null;
  item_valor: string | null;
}

export class CompraErro extends Error {
  constructor(
    public readonly codigo:
      | "CLIENTE_NAO_ENCONTRADO"
      | "COMPRA_NAO_ENCONTRADA"
      | "ITEM_NAO_ENCONTRADO"
      | "ESTOQUE_INSUFICIENTE"
      | "VALOR_TOTAL_EXCEDIDO"
  ) {
    super(codigo);
    this.name = "CompraErro";
  }
}

export interface Compra {
  id_compra: number;
  fk_Cliente_cpf: string | null;
  data_compra: string;
  valor_total: string;
  itens: {
    itemId: number;
    tipo: TipoItemCompra;
    nome: string;
    quantidade: number;
    precoUnitario: string;
  }[];
}

async function buscarCompras(idCompra?: number): Promise<Compra[]> {
  const [rows] = await pool.query<CompraRow[]>(
    `SELECT c.id_compra,
            c.fk_Cliente_cpf,
            DATE_FORMAT(c.data_compra, '%Y-%m-%d') AS data_compra,
            c.valor_total,
            i.id_item_compra,
            COALESCE(p.id_produto, r.id_recurso) AS item_id,
            CASE WHEN i.fk_Produto_id_produto IS NOT NULL THEN 'produto'
                 ELSE 'servico' END AS item_tipo,
            COALESCE(p.nome, r.nome) AS item_nome,
            i.quantidade AS item_quantidade,
            i.valor AS item_valor
       FROM Compra c
       LEFT JOIN Item_compra i ON i.fk_Compra_id_compra = c.id_compra
       LEFT JOIN Produto p ON p.id_produto = i.fk_Produto_id_produto
       LEFT JOIN Recurso r ON r.id_recurso = i.fk_Recurso_id_recurso
      ${idCompra === undefined ? "" : "WHERE c.id_compra = ?"}
      ORDER BY c.id_compra DESC, i.id_item_compra`,
    idCompra === undefined ? [] : [idCompra]
  );

  const compras = new Map<number, Compra>();
  for (const row of rows) {
    let compra = compras.get(row.id_compra);
    if (!compra) {
      compra = {
        id_compra: row.id_compra,
        fk_Cliente_cpf: row.fk_Cliente_cpf,
        data_compra: row.data_compra,
        valor_total: row.valor_total,
        itens: [],
      };
      compras.set(row.id_compra, compra);
    }

    if (
      row.id_item_compra !== null &&
      row.item_id !== null &&
      row.item_tipo !== null &&
      row.item_nome !== null &&
      row.item_quantidade !== null &&
      row.item_valor !== null
    ) {
      compra.itens.push({
        itemId: row.item_id,
        tipo: row.item_tipo,
        nome: row.item_nome,
        quantidade: row.item_quantidade,
        precoUnitario: row.item_valor,
      });
    }
  }

  return [...compras.values()];
}

export async function buscarTodasCompras(): Promise<Compra[]> {
  return buscarCompras();
}

export async function buscarCompraPorId(idCompra: number): Promise<Compra | null> {
  return (await buscarCompras(idCompra))[0] ?? null;
}

async function validarCliente(
  connection: Awaited<ReturnType<typeof pool.getConnection>>,
  cpfCliente: string | null
) {
  if (cpfCliente === null) return;

  const [rows] = await connection.execute<RowDataPacket[]>(
    "SELECT cpf FROM Cliente WHERE cpf = ? AND status = 'ativo' FOR UPDATE",
    [cpfCliente]
  );
  if (rows.length === 0) throw new CompraErro("CLIENTE_NAO_ENCONTRADO");
}

async function gravarItens(
  connection: Awaited<ReturnType<typeof pool.getConnection>>,
  idCompra: number,
  itens: ItemCompraInput[]
): Promise<number> {
  let totalCentavos = 0;

  for (const item of itens) {
    const produto = item.tipo === "produto";
    const tabela = produto ? "Produto" : "Recurso";
    const colunaId = produto ? "id_produto" : "id_recurso";
    const condicao = produto ? "" : " AND tipo = 'servico'";
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT ${colunaId} AS id, nome, valor, ${produto ? "quantidade" : "NULL AS quantidade"}
         FROM ${tabela}
        WHERE ${colunaId} = ?${condicao}
        FOR UPDATE`,
      [item.itemId]
    );
    const encontrado = rows[0] as
      | { id: number; nome: string; valor: string; quantidade: number | null }
      | undefined;

    if (!encontrado) throw new CompraErro("ITEM_NAO_ENCONTRADO");
    if (produto && Number(encontrado.quantidade) < item.quantidade) {
      throw new CompraErro("ESTOQUE_INSUFICIENTE");
    }

    const valorCentavos = Math.round(Number(encontrado.valor) * 100);
    totalCentavos += valorCentavos * item.quantidade;
    if (totalCentavos > 999_999_999) {
      throw new CompraErro("VALOR_TOTAL_EXCEDIDO");
    }

    if (produto) {
      await connection.execute(
        "UPDATE Produto SET quantidade = quantidade - ? WHERE id_produto = ?",
        [item.quantidade, item.itemId]
      );
    }

    await connection.execute<ResultSetHeader>(
      `INSERT INTO Item_compra
         (fk_Compra_id_compra, fk_Produto_id_produto, fk_Recurso_id_recurso, quantidade, valor)
       VALUES (?, ?, ?, ?, ?)`,
      [
        idCompra,
        produto ? item.itemId : null,
        produto ? null : item.itemId,
        item.quantidade,
        (valorCentavos / 100).toFixed(2),
      ]
    );
  }

  return totalCentavos;
}

export async function criarCompra(dados: CompraInput): Promise<Compra | null> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await validarCliente(connection, dados.cpfCliente);

    const [result] = await connection.execute<ResultSetHeader>(
      "INSERT INTO Compra (fk_Cliente_cpf, data_compra, valor_total) VALUES (?, ?, 0)",
      [dados.cpfCliente, dados.dataCompra]
    );
    const totalCentavos = await gravarItens(connection, result.insertId, dados.itens);
    await connection.execute(
      "UPDATE Compra SET valor_total = ? WHERE id_compra = ?",
      [(totalCentavos / 100).toFixed(2), result.insertId]
    );
    await connection.commit();
    return buscarCompraPorId(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function atualizarCompra(
  idCompra: number,
  dados: CompraInput
): Promise<Compra | null> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [compras] = await connection.execute<RowDataPacket[]>(
      "SELECT id_compra FROM Compra WHERE id_compra = ? FOR UPDATE",
      [idCompra]
    );
    if (compras.length === 0) throw new CompraErro("COMPRA_NAO_ENCONTRADA");

    await validarCliente(connection, dados.cpfCliente);

    const [itensAntigos] = await connection.execute<RowDataPacket[]>(
      `SELECT fk_Produto_id_produto AS produtoId, quantidade
         FROM Item_compra
        WHERE fk_Compra_id_compra = ? AND fk_Produto_id_produto IS NOT NULL`,
      [idCompra]
    );
    for (const item of itensAntigos as { produtoId: number; quantidade: number }[]) {
      await connection.execute(
        "UPDATE Produto SET quantidade = quantidade + ? WHERE id_produto = ?",
        [item.quantidade, item.produtoId]
      );
    }

    await connection.execute(
      "DELETE FROM Item_compra WHERE fk_Compra_id_compra = ?",
      [idCompra]
    );
    const totalCentavos = await gravarItens(connection, idCompra, dados.itens);
    await connection.execute(
      `UPDATE Compra
          SET fk_Cliente_cpf = ?, data_compra = ?, valor_total = ?
        WHERE id_compra = ?`,
      [
        dados.cpfCliente,
        dados.dataCompra,
        (totalCentavos / 100).toFixed(2),
        idCompra,
      ]
    );

    await connection.commit();
    return buscarCompraPorId(idCompra);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
