import { Router } from 'express';
import { PedidoController } from '../controllers/pedido.controller';
import { autenticar } from '../middlewares/autenticar';

const pedidoRoutes = Router();
const pedidoController = new PedidoController();

pedidoRoutes.get('/pedidos', autenticar, (req, res) => pedidoController.listar(req, res));
pedidoRoutes.post('/pedidos', autenticar, (req, res) => pedidoController.criar(req, res));
pedidoRoutes.patch('/pedidos/:id/status', autenticar, (req, res) => pedidoController.atualizarStatus(req, res));

export { pedidoRoutes };