import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { criarProdutoSchema, atualizarProdutoSchema } from '../schemas/produto.schema';

export class ProdutoController {
  // 1. Listar todos os produtos
  async listar(req: Request, res: Response) {
    const produtos = await prisma.produto.findMany({
      include: {
        categoria: true
      }
    });
    return res.status(200).json(produtos);
  }

  // 2. Cadastrar um produto com validação Zod
  async criar(req: Request, res: Response) {
    const validacao = criarProdutoSchema.safeParse(req.body);

    if (!validacao.success) {
      // Retorna uma lista organizada com todos os erros de validação
      return res.status(400).json({
        mensagem: 'Dados inválidos na requisição.',
        erros: validacao.error.flatten().fieldErrors
      });
    }

    // A partir daqui, validacao.data está 100% validado e tipado!
    const { nome, preco, estoque, categoriaId } = validacao.data;

    try {
      const novoProduto = await prisma.produto.create({
        data: {
          nome,
          preco,
          estoque,
          categoriaId
        },
        include: {
          categoria: true
        }
      });

      return res.status(201).json(novoProduto);
    } catch (error) {
      return res.status(400).json({ mensagem: 'Erro ao criar produto. Verifique se o categoriaId existe no banco.' });
    }
  }

  // 3. Atualizar um produto com validação Zod
  async atualizar(req: Request, res: Response) {
    const id = req.params.id as string;

    const validacao = atualizarProdutoSchema.safeParse(req.body);

    if (!validacao.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos na requisição.',
        erros: validacao.error.flatten().fieldErrors
      });
    }

    try {
      const produtoAtualizado = await prisma.produto.update({
        where: { id },
        data: validacao.data
      });

      return res.status(200).json(produtoAtualizado);
    } catch (error) {
      return res.status(404).json({ mensagem: 'Produto não encontrado para atualização.' });
    }
  }

  // 4. Deletar um produto
  async deletar(req: Request, res: Response) {
    const id = req.params.id as string;

    try {
      await prisma.produto.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }
  }
}