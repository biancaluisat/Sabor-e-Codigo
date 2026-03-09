import PedidoModel from '../models/pedidoModel.js';
import ProdutosModel from '../models/ProdutosModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ erro: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { clienteId } = req.body;

        PedidoModel.validarCriar({ clienteId });

        const pedido = new PedidoModel({ clienteId: parseInt(clienteId) });

        const data = await pedido.criar();

        return res.status(201).json({
            mensagem: 'Pedido criado com sucesso.',
            data,
        });
    } catch (error) {
        console.error('Erro ao criar pedido:', error);

        if (error.message) {
            return res.status(400).json({ erro: error.message });
        }

        return res.status(500).json({ erro: 'Erro interno ao criar pedido.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const pedidos = await PedidoModel.buscarTodos(req.query);

        if (!pedidos || pedidos.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum pedido encontrado.' });
        }

        return res.status(200).json(pedidos);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return res.status(500).json({ erro: 'Erro ao buscar pedidos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }

        return res.status(200).json({ data: pedido });
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        return res.status(500).json({ erro: 'Erro ao buscar pedido.' });
    }
};

export const adicionarItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { produtoId, quantidade } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        PedidoModel.validarAdicionarItem({ produtoId, quantidade });

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }

        const item = await pedido.adicionarItem({
            produtoId: parseInt(produtoId),
            quantidade: parseInt(quantidade),
        });

        return res.status(201).json({
            mensagem: 'Item adicionado ao pedido com sucesso.',
            data: item,
        });
    } catch (error) {
        console.error('Erro ao adicionar item:', error);

        if (error.message) {
            return res.status(400).json({ erro: error.message });
        }

        return res.status(500).json({ erro: 'Erro interno ao adicionar item ao pedido.' });
    }
};

export const cancelar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }

        const data = await pedido.cancelar();

        return res.status(200).json({
            mensagem: 'Pedido cancelado com sucesso.',
            data,
        });
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);

        if (error.message) {
            return res.status(400).json({ erro: error.message });
        }

        return res.status(500).json({ erro: 'Erro interno ao cancelar pedido.' });
    }
};

export const pagar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado.' });
        }

        const data = await pedido.pagar();

        return res.status(200).json({
            mensagem: 'Pedido pago com sucesso.',
            data,
        });
    } catch (error) {
        console.error('Erro ao pagar pedido:', error);

        if (error.message) {
            return res.status(400).json({ erro: error.message });
        }

        return res.status(500).json({ erro: 'Erro interno ao processar pagamento.' });
    }
};
