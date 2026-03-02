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

