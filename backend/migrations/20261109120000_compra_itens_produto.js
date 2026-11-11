exports.up = async function (knex) {
  await knex.raw(
    "ALTER TABLE Compra MODIFY COLUMN fk_Cliente_cpf CHAR(11) NULL"
  );

  await knex.schema.createTable("Item_compra", (table) => {
    table.increments("id_item_compra").unsigned().primary();
    table.integer("fk_Compra_id_compra").unsigned().notNullable();
    table.integer("fk_Produto_id_produto").unsigned().nullable();
    table.integer("fk_Recurso_id_recurso").unsigned().nullable();
    table.integer("quantidade").unsigned().notNullable();
    table.decimal("valor", 7, 2).unsigned().notNullable();

    table
      .foreign("fk_Compra_id_compra", "FK_ItemCompra_Compra")
      .references("id_compra")
      .inTable("Compra")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .foreign("fk_Produto_id_produto", "FK_ItemCompra_Produto")
      .references("id_produto")
      .inTable("Produto")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
    table
      .foreign("fk_Recurso_id_recurso", "FK_ItemCompra_Recurso")
      .references("id_recurso")
      .inTable("Recurso")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("Item_compra");
  await knex.raw(
    "ALTER TABLE Compra MODIFY COLUMN fk_Cliente_cpf CHAR(11) NOT NULL"
  );
};
