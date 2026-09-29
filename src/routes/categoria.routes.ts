import { Router } from 'express';
import { CategoriaController } from '../controllers/categoria.controller';

const categoriaRoutes = Router();
const categoriaController = new CategoriaController();

categoriaRoutes.get('/categorias', (req, res) => categoriaController.listar(req, res));
categoriaRoutes.post('/categorias', (req, res) => categoriaController.criar(req, res));
categoriaRoutes.delete('/categorias/:id', (req, res) => categoriaController.deletar(req, res));

export { categoriaRoutes };