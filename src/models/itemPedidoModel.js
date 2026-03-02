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
                precoUnitario: this.precoUnitario
            }
        });
    };

    async atualizar() {
        return prisma.itemPedido.update({
            where: { id: this.id },
            data: {
                pedido: { connect: { id: this.pedidoId } },
                produto: { connect: { id: this.produtoId } },
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario
            }
        });
    };

    async deletar() {
        return prisma.itemPedido.delete({
            where: { id: this.id }
        });
    };

    static async buscarTodos() {
        const data = await prisma.itemPedido.findMany();
        return data.map(item => new ItemPedidoModel(item));
    };

    static async pegarPorId(id){
        const data = await prisma.itemPedido.findUnique({ where: { id } });
        if (!data) return null;
        return new ItemPedidoModel(data);
    }
}