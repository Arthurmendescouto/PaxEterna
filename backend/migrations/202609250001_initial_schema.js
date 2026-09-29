exports.up = async function (knex) {
  await knex.schema.createTable("Cliente", (table) => {
    table.specificType("cpf", "CHAR(11)").notNullable().primary();
    table.string("nome", 100).notNullable();
    table.string("rg", 20).notNullable();
    table.date("data_nascimento").notNullable();
    table.string("logradouro", 100).nullable();
    table.string("num_endereco", 10).nullable();
    table.string("bairro", 100).nullable();
    table.specificType("cep", "CHAR(8)").nullable();
    table.string("cidade", 100).nullable();
    table.specificType("uf", "CHAR(2)").nullable();
    table.string("status", 20).notNullable().defaultTo("ativo");
  });

  await knex.schema.createTable("Telefone", (table) => {
    table.specificType("telefone", "CHAR(11)").notNullable();
    table.specificType("cpf", "CHAR(11)").notNullable();
    table.primary(["telefone", "cpf"]);
    table
      .foreign("cpf", "FK_Telefone_Cliente")
      .references("cpf")
      .inTable("Cliente")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await knex.schema.createTable("Contrato", (table) => {
    table.increments("id_contrato").unsigned();
    table.specificType("fk_Cliente_cpf", "CHAR(11)").notNullable();
    table.date("data_inicio").notNullable();
    table.date("data_termino").notNullable();
    table.decimal("valor_contrato", 6, 2).unsigned().notNullable();
    table.enu("status", ["ativo", "cancelado"]).notNullable();
    table.date("data_obito").nullable();
    table
      .foreign("fk_Cliente_cpf", "FK_Contrato_Cliente")
      .references("cpf")
      .inTable("Cliente")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await knex.schema.createTable("Dependentes", (table) => {
    table.specificType("cpf", "CHAR(11)").notNullable();
    table.integer("fk_Contrato_id_contrato").unsigned().notNullable();
    table.string("nome_dependente", 100).notNullable();
    table.date("data_nascimento").notNullable();
    table.string("parentesco", 50).nullable();
    table.decimal("valor_adicional_dependente", 6, 2).unsigned().notNullable();
    table.date("data_inicio").nullable();
    table.date("data_obito").nullable();
    table.primary(["cpf", "fk_Contrato_id_contrato"]);
    table
      .foreign("fk_Contrato_id_contrato", "FK_Dependentes_Contrato")
      .references("id_contrato")
      .inTable("Contrato")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
  });

  await knex.schema.createTable("Recurso", (table) => {
    table.increments("id_recurso").unsigned();
    table.string("nome", 100).notNullable();
    table.decimal("valor", 7, 2).unsigned().notNullable();
    table.enu("tipo", ["servico", "produto"]).notNullable();
    table.integer("quantidade").unsigned().notNullable().defaultTo(0);
    table
      .enu("classificacao", ["caixao", "flores", "translado", "mortalha", "velorio", "tanatopraxia"])
      .notNullable();
    table.enu("unidade_medida", ["km", "m", "unidade"]).notNullable();
  });

  await knex.schema.createTable("Contrato_Recurso", (table) => {
    table.integer("fk_Recurso_id_recurso").unsigned().notNullable();
    table.integer("fk_Contrato_id_contrato").unsigned().notNullable();
    table.integer("quantidade").unsigned().notNullable();
    table.decimal("valor", 7, 2).unsigned().notNullable();
    table.primary(["fk_Recurso_id_recurso", "fk_Contrato_id_contrato"]);
    table
      .foreign("fk_Recurso_id_recurso", "FK_ContRec_Recurso")
      .references("id_recurso")
      .inTable("Recurso")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
    table
      .foreign("fk_Contrato_id_contrato", "FK_ContRec_Contrato")
      .references("id_contrato")
      .inTable("Contrato")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
  });

  await knex.schema.createTable("Pagamento_contrato", (table) => {
    table.increments("id_pagamento").unsigned();
    table.integer("fk_Contrato_id_contrato").unsigned().notNullable();
    table.decimal("valor", 7, 2).unsigned().notNullable();
    table.date("data_pagamento").nullable();
    table
      .enu("forma_pagamento", ["dinheiro", "cartao de credito", "cartao de debito", "pix", "boleto"])
      .nullable();
    table.enu("status", ["pago", "cancelado", "pendente"]).notNullable();
    table
      .foreign("fk_Contrato_id_contrato", "FK_PagCont_Contrato")
      .references("id_contrato")
      .inTable("Contrato")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
  });

  await knex.schema.createTable("Compra", (table) => {
    table.increments("id_compra").unsigned();
    table.specificType("fk_Cliente_cpf", "CHAR(11)").notNullable();
    table.date("data_compra").notNullable();
    table.decimal("valor_total", 9, 2).unsigned().notNullable();
    table
      .foreign("fk_Cliente_cpf", "FK_Compra_Cliente")
      .references("cpf")
      .inTable("Cliente")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  await knex.schema.createTable("Itens", (table) => {
    table.integer("fk_Compra_id_compra").unsigned().notNullable();
    table.integer("fk_Recurso_id_recurso").unsigned().notNullable();
    table.integer("quantidade").unsigned().notNullable();
    table.decimal("valor", 7, 2).unsigned().notNullable();
    table.primary(["fk_Compra_id_compra", "fk_Recurso_id_recurso"]);
    table
      .foreign("fk_Compra_id_compra", "FK_Itens_Compra")
      .references("id_compra")
      .inTable("Compra")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .foreign("fk_Recurso_id_recurso", "FK_Itens_Recurso")
      .references("id_recurso")
      .inTable("Recurso")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
  });

  await knex.schema.createTable("Pagamento_avulso", (table) => {
    table.increments("id_pagamento").unsigned();
    table.integer("fk_Compra_id_compra").unsigned().notNullable();
    table.decimal("valor", 7, 2).unsigned().notNullable();
    table.date("data_pagamento").nullable();
    table
      .enu("forma_pagamento", ["dinheiro", "cartao de credito", "cartao de debito", "pix", "boleto"])
      .nullable();
    table.enu("status", ["pago", "cancelado", "pendente"]).notNullable();
    table
      .foreign("fk_Compra_id_compra", "FK_PagAvulso_Compra")
      .references("id_compra")
      .inTable("Compra")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("Pagamento_avulso");
  await knex.schema.dropTableIfExists("Itens");
  await knex.schema.dropTableIfExists("Compra");
  await knex.schema.dropTableIfExists("Pagamento_contrato");
  await knex.schema.dropTableIfExists("Contrato_Recurso");
  await knex.schema.dropTableIfExists("Recurso");
  await knex.schema.dropTableIfExists("Dependentes");
  await knex.schema.dropTableIfExists("Contrato");
  await knex.schema.dropTableIfExists("Telefone");
  await knex.schema.dropTableIfExists("Cliente");
};