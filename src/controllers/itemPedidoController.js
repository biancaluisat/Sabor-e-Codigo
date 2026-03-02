import ItemPedidoModel from "../models/itemPedidoModel.js";

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