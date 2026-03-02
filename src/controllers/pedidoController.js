import PedidoModel from '../models/pedidoModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ erro: "Corpo da requisição vazio. Envie os dados!" });
        }

        const { clienteId } = req.body;

        if (!clienteId) {
            return res.status(400).json({ erro: "O campo 'clienteId' é obrigatório." });
        }

        if (isNaN(clienteId)) {
            return res.status(400).json({ erro: "ID inválido. Informe um número válido." });
        }

        const pedido = new PedidoModel({ clienteId: parseInt(clienteId) });

        const data = await pedido.criar();

        return res.status(201).json({
            mensagem: "Pedido criado com sucesso.",
            data
        });

    } catch (error) {
        console.error("Erro ao criar pedido:", error);

        if (error.message) {
            return res.status(400).json({ erro: error.message });
        }

        return res.status(500).json({ erro: "Erro interno ao criar pedido." });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const pedidos = await PedidoModel.buscarTodos(req.query);

        if (!pedidos || pedidos.length === 0) {
            return res.status(200).json({ mensagem: "Nenhum pedido encontrado." });
        }

        return res.status(200).json(pedidos);

    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        return res.status(500).json({ erro: "Erro ao buscar pedidos." });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ erro: "ID inválido. Informe um número válido." });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ erro: "Pedido não encontrado." });
        }

        return res.status(200).json({ data: pedido });

    } catch (error) {
        console.error("Erro ao buscar pedido:", error);
        return res.status(500).json({ erro: "Erro ao buscar pedido." });
    }
};
