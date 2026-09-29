import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class CategoriaController {
  // 1. Listar todas as categorias (incluindo os produtos de cada uma)
  async listar(req: Request, res: Response) {
    const categorias = await prisma.categoria.findMany({
      include: {
        produtos: true
      }
    });
    return res.status(200).json(categorias);
  }

  // 2. Criar uma nova categoria
  async criar(req: Request, res: Response) {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ mensagem: "O campo 'nome' é obrigatório." });
    }

    try {
      const novaCategoria = await prisma.categoria.create({
        data: { nome }
      });
      return res.status(201).json(novaCategoria);
    } catch (error) {
      return res.status(400).json({ mensagem: "Categoria com este nome já existe." });
    }
  }

  // 3. Deletar uma categoria
  async deletar(req: Request, res: Response) {
    const id = req.params.id as string;

    try {
      await prisma.categoria.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(404).json({ mensagem: "Categoria não encontrada." });
    }
  }
}