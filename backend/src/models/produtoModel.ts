import { pool } from "../config/db"; // Importação corrigida!

export interface Produto {
  id_produto?: number;
  nome: string;
  tipo: "caixao" | "urna" | "flores" | "mortalha" | "acessorio";
  valor: number;
  quantidade?: number;
  unidade_medida?: "unidade" | "m";
}

export const criarProduto = async (produto: Produto) => {
  const { nome, tipo, valor, quantidade, unidade_medida } = produto;

  // Usando SQL puro com o pool de conexão
  const query = `
    INSERT INTO Produto (nome, tipo, valor, quantidade, unidade_medida)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    nome,
    tipo,
    valor,
    quantidade || 0,
    unidade_medida || "unidade",
  ];

  // Executa a query no banco de dados
  const [result]: any = await pool.execute(query, values);

  // Retorna o produto recém-criado junto com o ID gerado pelo banco
  return {
    id_produto: result.insertId,
    ...produto,
  };
};
