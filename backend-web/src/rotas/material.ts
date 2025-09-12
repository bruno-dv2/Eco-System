import { Router } from 'express';
import { MaterialController } from '../controllers/MaterialController';
import { authMiddleware } from '../middlewares/autenticacao';

const router = Router();
const materialController = new MaterialController();

router.get('/', authMiddleware, (req, res) => materialController.listar(req, res));
router.post('/', authMiddleware, (req, res) => materialController.criar(req, res));
router.put('/:id', authMiddleware, (req, res) => materialController.atualizar(req, res));
router.delete('/:id', authMiddleware, (req, res) => materialController.excluir(req, res));

export default router;