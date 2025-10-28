import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authMiddleware } from '../middlewares/autenticacao';

const router = Router();
const usuarioController = new UsuarioController();

router.post('/registro', (req, res) => usuarioController.registro(req, res));
router.post('/login', (req, res) => usuarioController.login(req, res));
router.post('/logout', authMiddleware, (req, res) => usuarioController.logout(req, res));
router.post("/recuperacao", usuarioController.recuperacao.bind(usuarioController));
router.put('/alterar-senha', authMiddleware, (req, res) => usuarioController.alterarSenha(req, res));


export default router;