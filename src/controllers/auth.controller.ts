import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { loginSchema } from '../schemas/usuario.schema';

// Chave secreta para assinar o token JWT (em produção fica no .env)
export const JWT_SECRET = 'sua_chave_secreta_super_segura_123';

export class AuthController {
  async login(req: Request, res: Response) {
    const validacao = loginSchema.safeParse(req.body);

    if (!validacao.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos.',
        erros: validacao.error.flatten().fieldErrors
      });
    }

    const { email, senha } = validacao.data;

    // 1. Verifica se o usuário existe
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    // 2. Compara a senha informada com a senha criptografada no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    // 3. Gera o Token JWT com validade de 1 dia
    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      },
      token
    });
  }
}