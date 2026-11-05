import { Request, Response } from "express";
import { buscarTodasCompras } from "../models/compraModel";

export async function buscarCompras(_req: Request, res: Response) {
  try {
    const compras = await buscarTodasCompras();
    return res.status(200).json(compras);
  } catch (error) {
    console.error("Erro ao buscar compras:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
