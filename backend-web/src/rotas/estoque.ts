import { Router } from 'express';
import { EstoqueController } from '../controllers/EstoqueController';
import { authMiddleware } from '../middlewares/autenticacao';

const router = Router();
const estoqueController = new EstoqueController();

router.post('/entrada', authMiddleware, (req, res) => estoqueController.registrarEntrada(req, res));
router.post('/saida', authMiddleware, (req, res) => estoqueController.registrarSaida(req, res));
router.get('/saldo', authMiddleware, (req, res) => estoqueController.consultarSaldo(req, res));

export default router;