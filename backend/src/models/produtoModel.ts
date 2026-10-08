import { pool } from "../config/db";

export interface Produto {
  id_produto?: number;
  nome: string;
  tipo: "caixao" | "urna" | "flores" | "mortalha" | "acessorio";
  valor: number;
  quantidade: number;
  unidade_medida?: "unidade" | "m";
}

export const buscarProdutoPorId = async (id_produto: number) => {
  const query = `SELECT * FROM Produto WHERE id_produto = ?`;
  const [rows]: any = await pool.execute(query, [id_produto]);
  return rows.length > 0 ? rows[0] : null;
};

// Nova função para atualizar o produto
export const atualizarProduto = async (
  id_produto: number,
  produto: Produto,
) => {
  const { nome, tipo, valor, quantidade, unidade_medida } = produto;

  const query = `
    UPDATE Produto 
    SET nome = ?, tipo = ?, valor = ?, quantidade = ?, unidade_medida = ?
    WHERE id_produto = ?
  `;

  const values = [
    nome,
    tipo,
    valor,
    quantidade,
    unidade_medida || "unidade",
    id_produto,
  ];

  await pool.execute(query, values);

  return { id_produto, ...produto };
};

export const buscarProdutoPorNome = async (nome: string) => {
  const query = `SELECT * FROM Produto WHERE nome = ?`;
  const [rows]: any = await pool.execute(query, [nome]);
  return rows.length > 0 ? rows[0] : null;
};

export const criarProduto = async (produto: Produto) => {
  const { nome, tipo, valor, quantidade, unidade_medida } = produto;

  const query = `
    INSERT INTO Produto (nome, tipo, valor, quantidade, unidade_medida)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [nome, tipo, valor, quantidade, unidade_medida || "unidade"];

  const [result]: any = await pool.execute(query, values);

  return {
    id_produto: result.insertId,
    ...produto,
  };
};
