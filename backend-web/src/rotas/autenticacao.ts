import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middlewares/autenticacao';

const router = Router();
const usuarioController = new UsuarioController();

router.post('/registro', (req, res) => usuarioController.registro(req, res));
router.post('/login', (req, res) => usuarioController.login(req, res));
router.post('/logout', authMiddleware, (req, res) => usuarioController.logout(req, res));

export default router;