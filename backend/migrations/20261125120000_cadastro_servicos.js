exports.up = async function (knex) {
  await knex.raw(`
    ALTER TABLE Recurso
      ADD COLUMN descricao TEXT NULL,
      MODIFY COLUMN classificacao
        ENUM('caixao', 'flores', 'translado', 'mortalha', 'velorio', 'tanatopraxia') NULL
  `);
};

exports.down = async function (knex) {
  const recursoSemClassificacao = await knex("Recurso").whereNull("classificacao").first("id_recurso");
  if (recursoSemClassificacao) {
    throw new Error("Preencha a classificação dos recursos antes de reverter esta migration.");
  }

  await knex.raw(`
    ALTER TABLE Recurso
      MODIFY COLUMN classificacao
        ENUM('caixao', 'flores', 'translado', 'mortalha', 'velorio', 'tanatopraxia') NOT NULL,
      DROP COLUMN descricao
  `);
};
