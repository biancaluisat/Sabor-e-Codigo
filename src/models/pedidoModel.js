import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({ id, clienteId, total = 0, status = "ABERTO", criadoEm } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.total = total;
        this.status = status;
        this.criadoEm = criadoEm;
    }

    async criar() {
        const clienteExistente = await prisma.cliente.findUnique({
            where: { id: this.clienteId }
        });

        if (!clienteExistente) {
            throw new Error("Cliente não encontrado.");
        }

        return prisma.pedido.create({
            data: {
                clienteId: this.clienteId,
                total: 0,
                status: "ABERTO"
            }
        });
    }

    async adicionarItem({ produtoId, quantidade }) {

        if (this.status !== "ABERTO") {
            throw new Error("Não é possível adicionar itens a um pedido que não esteja ABERTO.");
        }

        const produto = await prisma.produto.findUnique({
            where: { id: produtoId }
        });

        if (!produto) {
            throw new Error("Produto não encontrado.");
        }

        if (!produto.disponivel) {
            throw new Error("Produto indisponível não pode ser adicionado ao pedido.");
        }

        if (quantidade <= 0) {
            throw new Error("Quantidade deve ser maior que 0.");
        }

        const itemCriado = await prisma.itemPedido.create({
            data: {
                pedidoId: this.id,
                produtoId,
                quantidade,
                precoUnitario: produto.preco
            }
        });

        await this.recalcularTotal();

        return itemCriado;
    }
}
