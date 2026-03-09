import { Router } from 'express';
import * as clienteController from '../controllers/clienteController.js';
import autenticarApiKey from '../utils/apiKey.js';

const router = Router();

router.get('/clientes', clienteController.buscarTodos);
router.get('/clientes/:id', clienteController.buscarPorId);
router.post('/clientes', clienteController.criar);
router.put('/clientes/:id', clienteController.atualizar);
router.delete('/clientes/:id', clienteController.deletar);
router.get('/clientes/:id/clima', clienteController.getClimaCliente);


export default router;
