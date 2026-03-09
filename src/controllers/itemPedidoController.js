import ItemPedidoModel from '../models/itemPedidoModel.js';

export const criar = async (req, res) => {
    try {
        const { pedidoId, produtoId, quantidade, precoUnitario } = req.body;

        ItemPedidoModel.validarCriar({ pedidoId, produtoId, quantidade, precoUnitario });

        const itemPedido = new ItemPedidoModel({
            pedidoId,
            produtoId,
            quantidade,
            precoUnitario,
        });

        const data = await itemPedido.criar();

        await ItemPedidoModel.recalcularTotalPedido(pedidoId);

        res.status(201).json({
            message: 'Item do pedido criado com sucesso!',
            data,
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const itensPedidos = await ItemPedidoModel.buscarTodos(req.query);
        res.json(itensPedidos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar itens do pedido.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID fornecido é inválido.' });
        }

        const item = await ItemPedidoModel.buscarPorId(id);

        if (!item) {
            return res.status(404).json({ error: `O itemPedido com id:${id} não foi encontrado` });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar item.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const item = await ItemPedidoModel.buscarPorId(id);

        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado.' });
        }

        if (req.body.pedidoId || req.body.produtoId || req.body.quantidade || req.body.precoUnitario) {
            ItemPedidoModel.validarCriar({
                pedidoId: req.body.pedidoId || item.pedidoId,
                produtoId: req.body.produtoId || item.produtoId,
                quantidade: req.body.quantidade || item.quantidade,
                precoUnitario: req.body.precoUnitario || item.precoUnitario,
            });
        }

        if (req.body.pedidoId) item.pedidoId = req.body.pedidoId;
        if (req.body.produtoId) item.produtoId = req.body.produtoId;
        if (req.body.quantidade) item.quantidade = req.body.quantidade;
        if (req.body.precoUnitario) item.precoUnitario = req.body.precoUnitario;

        const data = await item.atualizar();

        await ItemPedidoModel.recalcularTotalPedido(item.pedidoId);

        res.json({ message: 'Atualizado com sucesso!', data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                message: 'O id fornecido é inválido',
            });
        }

        const resultado = await ItemPedidoModel.removerItem(id);

        res.json({ 
            message: 'Item removido com sucesso!',
            data: resultado 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
