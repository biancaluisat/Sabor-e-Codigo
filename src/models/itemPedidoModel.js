import prisma from '../utils/prismaClient.js';

export default class ItemPedidoModel {
    constructor({ id, pedidoId, produtoId, quantidade, precoUnitario }) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    async criar() {
        return prisma.itemPedido.create({
            data: {
                pedido: { connect: { id: this.pedidoId } },
                produto: { connect: { id: this.produtoId } },
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
            },
        });
    }

    async atualizar() {
        return prisma.itemPedido.update({
            where: { id: this.id },
            data: {
                pedido: { connect: { id: this.pedidoId } },
                produto: { connect: { id: this.produtoId } },
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
            },
        });
    }

    async deletar() {
        return prisma.itemPedido.delete({
            where: { id: this.id },
        });
    }

    static async buscarTodos() {
        const data = await prisma.itemPedido.findMany();
        return data.map((item) => new ItemPedidoModel(item));
    }

    static async buscarPorId(id) {
        const data = await prisma.itemPedido.findUnique({
            where: { id: Number(id) },
        });

        if (!data) return null;
        return new ItemPedidoModel(data);
    }
    static async verificarItemAberto(itemPedido) {
        const pedidosAbertos = await prisma.itemPedido.count({
            where: {
                itemPedido: itemPedido,
                status: ['PAGO', 'CANCELADO'],
            },
        });
        return pedidosAbertos > 0;
    }
}
