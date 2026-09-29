import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { criarUsuarioSchema } from '../schemas/usuario.schema';

export class UsuarioController {
  // 1. Listar todos os usuários
  async listar(req: Request, res: Response) {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true,
        pedidos: true
      }
    });
    return res.status(200).json(usuarios);
  }

  // 2. Criar um novo usuário com senha criptografada
  async criar(req: Request, res: Response) {
    const validacao = criarUsuarioSchema.safeParse(req.body);

    if (!validacao.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos na requisição.',
        erros: validacao.error.flatten().fieldErrors
      });
    }

    const { nome, email, senha, role } = validacao.data;

    try {
      // Criptografa a senha com custo de hash 8
      const senhaHash = await bcrypt.hash(senha, 8);

      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          role
        },
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          criadoEm: true
        }
      });

      return res.status(201).json(novoUsuario);
    } catch (error) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado no sistema.' });
    }
  }

  // 3. Buscar um usuário por ID
  async buscarPorId(req: Request, res: Response) {
    const id = req.params.id as string;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true,
        pedidos: {
          include: {
            itens: {
              include: {
                produto: true
              }
            }
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    return res.status(200).json(usuario);
  }
}