exports.up = async function (knex) {
  await knex.schema.alterTable("Produto", (table) => {
    table.string("marca", 100).nullable();
    table.text("descricao").nullable();
    table.string("fornecedor", 100).nullable();
  });

  // RF013 não define categorias fixas para "Tipo" — o ENUM antigo rejeitava
  // qualquer valor digitado livremente no formulário do frontend.
  await knex.raw(
    "ALTER TABLE Produto MODIFY COLUMN tipo VARCHAR(100) NOT NULL"
  );
};

exports.down = async function (knex) {
  await knex.schema.alterTable("Produto", (table) => {
    table.dropColumn("marca");
    table.dropColumn("descricao");
    table.dropColumn("fornecedor");
  });

  await knex.raw(
    "ALTER TABLE Produto MODIFY COLUMN tipo ENUM('caixao','urna','flores','mortalha','acessorio') NOT NULL"
  );
};
