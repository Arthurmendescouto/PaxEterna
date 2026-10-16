import { pool } from "../config/db";

export interface Produto {
  id_produto?: number;
  nome: string;
  tipo: string;
  valor: number;
  quantidade: number;
  marca?: string | null;
  descricao?: string | null;
  fornecedor?: string | null;
  unidade_medida?: "unidade" | "m";
}

export const buscarProdutoPorId = async (id_produto: number) => {
  const query = `SELECT * FROM Produto WHERE id_produto = ?`;
  const [rows]: any = await pool.execute(query, [id_produto]);
  return rows.length > 0 ? rows[0] : null;
};

export const atualizarProduto = async (
  id_produto: number,
  produto: Produto,
) => {
  const { nome, tipo, valor, quantidade, marca, descricao, fornecedor, unidade_medida } =
    produto;

  const query = `
    UPDATE Produto
    SET nome = ?, tipo = ?, valor = ?, quantidade = ?,
        marca = ?, descricao = ?, fornecedor = ?, unidade_medida = ?
    WHERE id_produto = ?
  `;

  const values = [
    nome,
    tipo,
    valor,
    quantidade,
    marca ?? null,
    descricao ?? null,
    fornecedor ?? null,
    unidade_medida || "unidade",
    id_produto,
  ];

  await pool.execute(query, values);

  return buscarProdutoPorId(id_produto);
};

export const buscarProdutoPorNome = async (nome: string) => {
  const query = `SELECT * FROM Produto WHERE nome = ?`;
  const [rows]: any = await pool.execute(query, [nome]);
  return rows.length > 0 ? rows[0] : null;
};

export const criarProduto = async (produto: Produto) => {
  const { nome, tipo, valor, quantidade, marca, descricao, fornecedor, unidade_medida } =
    produto;

  const query = `
    INSERT INTO Produto (nome, tipo, valor, quantidade, marca, descricao, fornecedor, unidade_medida)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    nome,
    tipo,
    valor,
    quantidade,
    marca ?? null,
    descricao ?? null,
    fornecedor ?? null,
    unidade_medida || "unidade",
  ];

  const [result]: any = await pool.execute(query, values);

  return buscarProdutoPorId(result.insertId);
};

export const buscarTodosProdutos = async () => {
  const query = `SELECT * FROM Produto`;
  const [rows]: any = await pool.execute(query);
  return rows;
};

export const removerProduto = async (id_produto: number) => {
  const query = `DELETE FROM Produto WHERE id_produto = ?`;
  const [result]: any = await pool.execute(query, [id_produto]);
  return result.affectedRows > 0;
};
