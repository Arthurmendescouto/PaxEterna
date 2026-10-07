exports.up = function (knex) {
  return knex.schema.createTable("Produto", (table) => {
    table.increments("id_produto").unsigned().primary(); // INT UNSIGNED AUTO_INCREMENT
    table.string("nome", 100).notNullable(); // VARCHAR(100) NOT NULL
    table
      .enum("tipo", ["caixao", "urna", "flores", "mortalha", "acessorio"])
      .notNullable();
    table.decimal("valor", 7, 2).unsigned().notNullable(); // DECIMAL(7,2) UNSIGNED NOT NULL
    table.integer("quantidade").unsigned().notNullable().defaultTo(0); // INT UNSIGNED DEFAULT 0
    table
      .enum("unidade_medida", ["unidade", "m"])
      .notNullable()
      .defaultTo("unidade");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("Produto");
};
