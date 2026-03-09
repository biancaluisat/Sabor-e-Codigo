import { Router } from 'express';
import * as clienteController from '../controllers/clienteController.js';
import autenticarApiKey from '../utils/apiKey.js';

const router = Router();

router.get('/clientes',autenticarApiKey, clienteController.buscarTodos);
router.get('/clientes/:id',autenticarApiKey, clienteController.buscarPorId);
router.post('/clientes',autenticarApiKey, clienteController.criar);
router.put('/clientes/:id',autenticarApiKey, clienteController.atualizar);
router.delete('/clientes/:id',autenticarApiKey, clienteController.deletar);

export default router;
