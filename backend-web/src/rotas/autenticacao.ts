import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const router = Router();
const usuarioController = new UsuarioController();

// Cadastro
router.post("/registro", usuarioController.registro.bind(usuarioController));

// Login
router.post("/login", usuarioController.login.bind(usuarioController));

// Solicitar recuperação de senha (gera token e envia e-mail)
router.post("/recuperacao", usuarioController.recuperacao.bind(usuarioController));

export default router;