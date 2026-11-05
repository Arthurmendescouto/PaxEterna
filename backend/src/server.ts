import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import clienteRoutes from "./routes/clienteRoutes";
import produtoRoutes from "./routes/produtoRoutes";
import compraRoutes from "./routes/compraRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", clienteRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/compras", compraRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
