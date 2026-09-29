import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface ItemEntrada {
  produtoId: String;
  quantidade: number;
}

export class PedidoController {
  // 1. Criar um novo pedido com validação e baixa de estoque
  async criar(req: Request, res: Response) {
    const { usuarioId, itens } = req.body as { usuarioId: string; itens: ItemEntrada[] };

    if (!usuarioId || !itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        mensagem: "Envie 'usuarioId' e um array de 'itens' com 'produtoId' e 'quantidade'."
      });
    }

    try {
      // Executa todas as operações dentro de uma transação
      const resultado = await prisma.$transaction(async (tx) => {
        let valorTotal = 0;
        const itensParaCriar = [];

        // Valida cada produto e verifica o estoque
        for (const item of itens) {
          const produto = await tx.produto.findUnique({
            where: { id: String(item.produtoId) }
          });

          if (!produto) {
            throw new Error(`Produto com ID ${item.produtoId} não foi encontrado.`);
          }

          if (produto.estoque < item.quantidade) {
            throw new Error(`Estoque insuficiente para o produto '${produto.nome}'. Disponível: ${produto.estoque}`);
          }

          const subtotal = produto.preco * item.quantidade;
          valorTotal += subtotal;

          itensParaCriar.push({
            produtoId: produto.id,
            quantidade: item.quantidade,
            precoUnit: produto.preco
          });

          // Dá baixa no estoque
          await tx.produto.update({
            where: { id: produto.id },
            data: {
              estoque: {
                decrement: item.quantidade
              }
            }
          });
        }

        // Cria o Pedido e vincula os itens
        const novoPedido = await tx.pedido.create({
          data: {
            usuarioId,
            total: valorTotal,
            status: "PENDENTE",
            itens: {
              create: itensParaCriar
            }
          },
          include: {
            itens: {
              include: {
                produto: true
              }
            }
          }
        });

        return novoPedido;
      });

      return res.status(201).json(resultado);
    } catch (error: any) {
      return res.status(400).json({ mensagem: error.message || "Erro ao processar o pedido." });
    }
  }

  // 2. Listar todos os pedidos
  async listar(req: Request, res: Response) {
    const pedidos = await prisma.pedido.findMany({
      include: {
        usuario: {
          select: { id: true, nome: true, email: true }
        },
        itens: {
          include: { produto: true }
        }
      }
    });
    return res.status(200).json(pedidos);
  }

  // 3. Atualizar o status do pedido (ex: PENDENTE -> PAGO)
  async atualizarStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ mensagem: "O campo 'status' é obrigatório." });
    }

    try {
      const pedidoAtualizado = await prisma.pedido.update({
        where: { id },
        data: { status }
      });
      return res.status(200).json(pedidoAtualizado);
    } catch (error) {
      return res.status(404).json({ mensagem: "Pedido não encontrado." });
    }
  }
}