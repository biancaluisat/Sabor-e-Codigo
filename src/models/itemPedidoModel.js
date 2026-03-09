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
    static async verificarItemAberto(itemPedidoId) {
        const item = await prisma.itemPedido.findUnique({
            where: { id: itemPedidoId },
            include: { pedido: true },
        });
        if (!item) return false;
        return item.pedido.status !== 'ABERTO';
    }

    static async removerItem(itemPedidoId) {
        const item = await prisma.itemPedido.findUnique({
            where: { id: itemPedidoId },
            include: { pedido: true },
        });

        if (!item) {
            throw new Error('Item não encontrado.');
        }

        if (item.pedido.status !== 'ABERTO') {
            throw new Error('Não pode remover item de pedido PAGO ou CANCELADO.');
        }

        await prisma.itemPedido.delete({
            where: { id: itemPedidoId },
        });

        const itensRestantes = await prisma.itemPedido.findMany({
            where: { pedidoId: item.pedidoId },
        });

        const totalCalculado = itensRestantes.reduce((acc, itemAtual) => {
            return acc + itemAtual.precoUnitario * itemAtual.quantidade;
        }, 0);

        return prisma.pedido.update({
            where: { id: item.pedidoId },
            data: { total: totalCalculado },
        });
    }

    static async recalcularTotalPedido(pedidoId) {
        const itens = await prisma.itemPedido.findMany({
            where: { pedidoId },
        });

        const totalCalculado = itens.reduce((acc, item) => {
            return acc + item.precoUnitario * item.quantidade;
        }, 0);

        return prisma.pedido.update({
            where: { id: pedidoId },
            data: { total: totalCalculado },
        });
    }
}
