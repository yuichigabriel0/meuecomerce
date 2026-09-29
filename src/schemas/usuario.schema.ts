import { z } from 'zod';

// 1. Schema para cadastro de novo usuário
export const criarUsuarioSchema = z.object({
  nome: z
    .string()
    .min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),
  email: z
    .string()
    .email({ message: 'Forneça um endereço de e-mail válido.' }),
  senha: z
    .string()
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
  role: z
    .enum(['CLIENTE', 'ADMIN'], {
      message: "O papel do usuário deve ser 'CLIENTE' ou 'ADMIN'."
    })
    .optional()
    .default('CLIENTE')
});

// 2. Schema para a rota de Login
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Forneça um e-mail válido para o login.' }),
  senha: z
    .string()
    .min(1, { message: 'A senha é obrigatória.' })
});