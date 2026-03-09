import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({ id, clienteId, total = 0, status = 'ABERTO', criadoEm } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.total = total;
        this.status = status;
        this.criadoEm = criadoEm;
    }

    async criar() {
        const clienteExistente = await prisma.cliente.findUnique({
            where: { id: this.clienteId },
        });

        if (!clienteExistente) {
            throw new Error('Cliente não encontrado.');
        }

        return prisma.pedido.create({
            data: {
                clienteId: this.clienteId,
                total: 0,
                status: 'ABERTO',
            },
        });
    }

    async adicionarItem({ produtoId, quantidade }) {
        if (this.status !== 'ABERTO') {
            throw new Error('Não é possível adicionar itens a um pedido que não esteja ABERTO.');
        }

        const produto = await prisma.produto.findUnique({
            where: { id: produtoId },
        });

        if (!produto) {
            throw new Error('Produto não encontrado.');
        }

        if (!produto.disponivel) {
            throw new Error('Produto indisponível não pode ser adicionado ao pedido.');
        }

        if (quantidade <= 0) {
            throw new Error('Quantidade deve ser maior que 0.');
        }

        const itemCriado = await prisma.itemPedido.create({
            data: {
                pedidoId: this.id,
                produtoId,
                quantidade,
                precoUnitario: produto.preco,
            },
        });

        await this.recalcularTotal();

        return itemCriado;
    }
    async recalcularTotal() {
        const itens = await prisma.itemPedido.findMany({
            where: { pedidoId: this.id },
        });

        const totalCalculado = itens.reduce((acc, item) => {
            return acc + item.precoUnitario * item.quantidade;
        }, 0);

        return prisma.pedido.update({
            where: { id: this.id },
            data: { total: totalCalculado },
        });
    }

    async pagar() {
        if (this.status !== 'ABERTO') {
            throw new Error('Apenas pedidos ABERTOS podem ser pagos.');
        }

        return prisma.pedido.update({
            where: { id: this.id },
            data: { status: 'PAGO' },
        });
    }

    async cancelar() {
        if (this.status !== 'ABERTO') {
            throw new Error('Só é possível cancelar pedidos com status ABERTO.');
        }

        return prisma.pedido.update({
            where: { id: this.id },
            data: { status: 'CANCELADO' },
        });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.clienteId && !isNaN(filtros.clienteId)) {
            where.clienteId = parseInt(filtros.clienteId);
        }

        if (filtros.status) {
            where.status = filtros.status;
        }

        return prisma.pedido.findMany({
            where,
            include: {
                cliente: true,
                itens: {
                    include: {
                        produto: true,
                    },
                },
            },
        });
    }

    static async buscarPorId(id) {
        const data = await prisma.pedido.findUnique({
            where: { id },
            include: {
                cliente: true,
                itens: {
                    include: {
                        produto: true,
                    },
                },
            },
        });

        if (!data) return null;

        return new PedidoModel(data);
    }

    static validarCriar({ clienteId }) {
        if (!clienteId) {
            throw new Error("O campo 'clienteId' é obrigatório.");
        }
        if (isNaN(clienteId)) {
            throw new Error('ID inválido. Informe um número válido.');
        }
    }

    static validarAdicionarItem({ produtoId, quantidade }) {
        if (!produtoId) {
            throw new Error("O campo 'produtoId' é obrigatório.");
        }
        if (!quantidade) {
            throw new Error("O campo 'quantidade' é obrigatório.");
        }
        if (quantidade <= 0) {
            throw new Error('Quantidade deve ser maior que 0.');
        }
    }
}
