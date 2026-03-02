import prisma from '../utils/prismaClient.js';

export default class ProdutosModel {
    constructor({ id = null, nome, descricao = null, categoria, preco, disponivel = true } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;
    }

    async criar() {
        return prisma.produto.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel,
            },
        });
    }

    async atualizar() {
        return prisma.produto.update({
            where: { id: this.id },
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel,
        }});
    }

    async deletar() {
        return prisma.produto.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.categoria) { where.categoria = { in: filtros.categoria.split(',').map(c => c.toUpperCase()) }; }
        if (filtros.disponivel !== undefined) { where.disponivel = filtros.disponivel === 'true' };
        if (filtros.precoMin || filtros.precoMax) {
            where.preco = {};

            if (filtros.precoMin) {
                where.preco.gte = Number(filtros.precoMin);
            }

            if (filtros.precoMax) {
                where.preco.lte = Number(filtros.precoMax);
            }
    }

        return prisma.produto.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.produto.findUnique({ where: { id } });
        if (!data) return null;
        return new ProdutosModel(data);
    }

    static async pedidoAberto(produtoId) {
        const contagem = await prisma.itemPedido.count({
            where: {
                produtoId: produtoId,
                pedido: {
                    status: "ABERTO"
                }
            }
        });
        return contagem > 0;
    }
}
