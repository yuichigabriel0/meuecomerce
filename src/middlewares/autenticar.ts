import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../controllers/auth.controller';

interface PayloadToken {
  id: string;
  role: string;
}

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Token de autenticação não fornecido.' });
  }

  // O header vem no formato "Bearer <TOKEN>"
  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PayloadToken;

    // Injeta os dados do usuário dentro da requisição para uso posterior
    req.usuario = {
      id: decoded.id,
      role: decoded.role
    };

    return next(); // Libera o acesso para o controller
  } catch (error) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
}