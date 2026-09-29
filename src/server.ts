import express from 'express';
import cors from 'cors';

import { produtoRoutes } from './routes/produto.routes';
import { categoriaRoutes } from './routes/categoria.routes';
import { usuarioRoutes } from './routes/usuario.routes';
import { pedidoRoutes } from './routes/pedido.routes';
import { authRoutes } from './routes/auth.routes';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Registro das rotas
app.use(authRoutes);
app.use(categoriaRoutes);
app.use(produtoRoutes);
app.use(usuarioRoutes);
app.use(pedidoRoutes);

app.listen(3000, () => {
  console.log('🚀 API REST rodando em http://localhost:3000');
});