const assert = require("node:assert/strict");
const { test } = require("node:test");
const { pool } = require("../dist/config/db");
const router = require("../dist/routes/pagamentoRoutes").default;

async function excluirPagamento(tipo, id_pagamento) {
  const camada = router.stack.find(
    ({ route }) => route?.path === "/:tipo/:id_pagamento" && route.methods.delete
  );
  assert.ok(camada, "A rota DELETE de pagamentos deve estar registrada");
  const handler = camada.route.stack.find(({ method }) => method === "delete");
  assert.ok(handler, "A rota DELETE deve ter um controlador");

  const resposta = {};
  const res = {
    status(codigo) {
      resposta.status = codigo;
      return this;
    },
    json(corpo) {
      resposta.corpo = corpo;
      return this;
    },
  };
  await handler.handle({ params: { tipo, id_pagamento } }, res);
  return resposta;
}

test("exclui avulso e assinatura separadamente mesmo com IDs iguais", async (t) => {
  const avulsos = new Set([1]);
  const assinaturas = new Set([1]);
  t.mock.method(pool, "execute", async (sql, valores) => {
    const [, tabela] =
      /^DELETE FROM (Pagamento_avulso|Pagamento_contrato) WHERE id_pagamento = \?$/.exec(sql);
    assert.deepEqual(valores, [1]);
    const registros = tabela === "Pagamento_avulso" ? avulsos : assinaturas;
    return [{ affectedRows: Number(registros.delete(valores[0])) }];
  });

  const sucesso = { status: 200, corpo: { message: "Operação realizada com sucesso!" } };
  assert.deepEqual(await excluirPagamento("avulso", "1"), sucesso);
  assert.equal(avulsos.size, 0);
  assert.equal(assinaturas.has(1), true);
  assert.deepEqual(await excluirPagamento("avulso", "1"), {
    status: 404,
    corpo: { error: "Nenhum resultado encontrado!" },
  });
  assert.deepEqual(await excluirPagamento("assinatura", "1"), sucesso);
  assert.equal(assinaturas.size, 0);
});

test("rejeita tipo e IDs inválidos antes de executar SQL", async (t) => {
  const executar = t.mock.method(pool, "execute", async () => [{ affectedRows: 0 }]);
  assert.equal((await excluirPagamento("invalido", "1")).status, 400);
  for (const id of ["0", "-1", "1.5", "abc", "9007199254740992"]) {
    assert.equal((await excluirPagamento("avulso", id)).status, 400);
  }
  assert.equal(executar.mock.callCount(), 0);
});

test("responde com erro interno quando o banco falha", async (t) => {
  t.mock.method(console, "error", () => {});
  t.mock.method(pool, "execute", async () => {
    throw new Error("Falha simulada");
  });
  assert.deepEqual(await excluirPagamento("assinatura", "1"), {
    status: 500,
    corpo: { message: "Erro interno do servidor." },
  });
});
