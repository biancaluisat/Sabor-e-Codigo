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

    static validarCriar({ pedidoId, produtoId, quantidade, precoUnitario }) {
        if (!pedidoId || !produtoId || !quantidade || !precoUnitario) {
            throw new Error('pedidoId, produtoId, quantidade e precoUnitario são obrigatórios!');
        }
        if (isNaN(quantidade) || quantidade <= 0) {
            throw new Error('Quantidade deve ser um número maior que 0');
        }
        if (isNaN(precoUnitario) || precoUnitario <= 0) {
            throw new Error('Preco unitário deve ser um número maior que 0');
        }
    }
}
