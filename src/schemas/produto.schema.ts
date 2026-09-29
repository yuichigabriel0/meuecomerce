import { z } from 'zod';

// Schema para criação de produto
export const criarProdutoSchema = z.object({
  nome: z.string().min(2, { message: 'O nome deve ter no mínimo 2 caracteres.' }),
  preco: z.number().positive({ message: 'O preço deve ser um valor maior que zero.' }),
  estoque: z.number().int().nonnegative({ message: 'O estoque não pode ser negativo.' }).optional().default(0),
  categoriaId: z.string().uuid({ message: 'O ID da categoria deve ser um UUID válido.' })
});

// Schema para atualização de produto (todos os campos são opcionais)
export const atualizarProdutoSchema = criarProdutoSchema.partial();