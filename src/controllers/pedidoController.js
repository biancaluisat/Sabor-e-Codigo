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

