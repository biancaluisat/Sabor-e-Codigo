import express from 'express';
import * as controller from '../controllers/pedidoController.js';

const router = express.Router();


router.post('/pedido', controller.criar);
router.get('/pedido', controller.buscarTodos);
router.get('/pedido/:id', controller.buscarPorId);
router.put('/pedido/:id', controller.cancelar);
router.delete('/pedido/:id', controller.pagar);

export default router;
