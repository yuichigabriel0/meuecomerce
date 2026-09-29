import { Router } from 'express';
import { ProdutoController } from '../controllers/produto.controller';

const produtoRoutes = Router();
const produtoController = new ProdutoController();

produtoRoutes.get('/produtos', (req, res) => produtoController.listar(req, res));
produtoRoutes.post('/produtos', (req, res) => produtoController.criar(req, res));
produtoRoutes.put('/produtos/:id', (req, res) => produtoController.atualizar(req, res));
produtoRoutes.delete('/produtos/:id', (req, res) => produtoController.deletar(req, res));

export { produtoRoutes };