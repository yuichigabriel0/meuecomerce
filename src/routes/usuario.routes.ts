import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';

const usuarioRoutes = Router();
const usuarioController = new UsuarioController();

usuarioRoutes.get('/usuarios', (req, res) => usuarioController.listar(req, res));
usuarioRoutes.get('/usuarios/:id', (req, res) => usuarioController.buscarPorId(req, res));
usuarioRoutes.post('/usuarios', (req, res) => usuarioController.criar(req, res));

export { usuarioRoutes };