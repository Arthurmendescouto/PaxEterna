require("dotenv").config();

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3307,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "0000",
      database: process.env.DB_NAME || "paxeterna",
    },
    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
      extension: "js",
    },
  },
};