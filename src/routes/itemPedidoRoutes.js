import express from 'express';
import * as controller from '../controllers/itemPedidoController.js';
import autenticarApiKey from '../utils/apiKey.js';


const router = express.Router();


router.post('/itempedido', controller.criar);
router.get('/itempedido', controller.buscarTodos);
router.get('/itempedido/:id', controller.buscarPorId);
router.put('/itempedido/:id', controller.atualizar);
router.delete('/itempedido/:id', controller.deletar);

export default router;
