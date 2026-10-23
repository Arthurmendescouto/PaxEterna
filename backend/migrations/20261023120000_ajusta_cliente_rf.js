// Ajusta a tabela Cliente aos campos do RF001/RF002/RF004:
// - remove o RG (não existe nos RFs)
// - data de nascimento passa a ser opcional
// - adiciona Email (opcional) e Data de criação (preenchida automaticamente)
exports.up = async function (knex) {
  await knex.schema.alterTable("Cliente", (table) => {
    table.dropColumn("rg");
    table.date("data_nascimento").nullable().alter();
    table.string("email", 100).nullable();
    table.timestamp("data_criacao").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("Cliente", (table) => {
    table.dropColumn("data_criacao");
    table.dropColumn("email");
    table.string("rg", 20).notNullable().defaultTo("");
  });
  // só volta a ser obrigatória se nenhum cliente estiver sem data
  await knex.raw(
    "UPDATE Cliente SET data_nascimento = '1900-01-01' WHERE data_nascimento IS NULL"
  );
  await knex.schema.alterTable("Cliente", (table) => {
    table.date("data_nascimento").notNullable().alter();
  });
};
