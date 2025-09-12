import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';

const router = Router();
const usuarioController = new UsuarioController();

router.post('/registro', (req, res) => usuarioController.registro(req, res));
router.post('/login', (req, res) => usuarioController.login(req, res));

export default router;