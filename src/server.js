import express from 'express';
import 'dotenv/config';
import produtosRoute from './routes/produtosRoute.js';
import itemPedidoRoute from './routes/itemPedidoRoutes.js'
import clienteRoute from './routes/clienteRoute.js';
import pedidoRoute from './routes/pedidoRoute.js'

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🚀 API funcionando');
});

app.use('/api',  produtosRoute, itemPedidoRoute, clienteRoute, pedidoRoute);


app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
