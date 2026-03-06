import { Router } from 'express';
import * as controller from '../controllers/clienteController.js';

const router = Router();

router.get('/clientes', controller.getClientes);
router.get('/clientes/:id', controller.getClienteById);
router.post('/clientes', controller.createCliente);
router.put('/clientes/:id', controller.updateCliente);
router.delete('/clientes/:id', controller.deleteCliente);

export default router;