import ItemPedidoModel from "../models/ItemPedidoModel.js";

export const criar = async (req, res) => {
    try {
        const { pedidoId, produtoId, quantidade, precoUnitario } = req.body;

        if (!pedidoId || !produtoId || !quantidade || !precoUnitario) {
            return res.status(400).json({
                error: "pedidoId, produtoId, quantidade e precoUnitario são obrigatórios!"
            });
        }

        const itemPedido = new ItemPedidoModel({
            pedidoId,
            produtoId,
            quantidade,
            precoUnitario
        });

        const data = await itemPedido.criar();

        res.status(201).json({
            message: "Item do pedido criado com sucesso!",
            data
        });

    } catch (error) {
        res.status(500).json({
            error: "Erro ao salvar item do pedido.",
            details: error.message
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
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        if (req.body.pedidoId) item.pedidoId = req.body.pedidoId;
        if (req.body.produtoId) item.produtoId = req.body.produtoId;
        if (req.body.quantidade) item.quantidade = req.body.quantidade;
        if (req.body.precoUnitario) item.precoUnitario = req.body.precoUnitario;

        const data = await item.atualizar();
        res.json({ message: 'Atualizado com sucesso!', data });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar.' });
    }
};

export const deletar = async (req, res) => {
    try {


        const id = parseInt(req.params.id);

        if(!id){
            return res.status(500).json({
                message: `O id:${id} fornecido não consta no banco de dados`
            })
        }

        const item = new ItemPedidoModel({ id });

        await item.deletar();

        res.json({ message: 'Removido com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar.' });
    }
};
