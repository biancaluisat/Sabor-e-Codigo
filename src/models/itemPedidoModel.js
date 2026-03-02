import prisma from '../utils/prismaClient.js';

export default class itemPedidoModel {
    constructor({id, pedidoId, pedido, produtoId, produto, quantidade, precoUnitario }){
        this.id = id,
        this.pedidoId= pedidoId,
        this.pedido = pedido,
        this.produtoId = produtoId,
        this.produto = produto,
        this.quantidade = quantidade,
        this.precoUnitario = precoUnitario
    }
    async criar() {
        return prisma.itemPedido.create({
            data:{
                pedido: this.pedido,
                produto: this.produto,
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario
            }
        });
    }
    async atualizar () {
        return prisma.itemPedido.update({
            where: {id: this.id},
            data: {pedido: this.pedido, produto: this.produto, quantidade: this.quantidade, precoUnitario: this.precoUnitario}
        });
    }
}