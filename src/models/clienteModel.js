import prisma from '../utils/prismaClient.js';

export default class ClienteModel {
    #cpf;
    #cep;

    constructor({
        id,
        nome,
        telefone,
        email,
        cpf,
        cep,
        logradouro = null,
        bairro = null,
        localidade = null,
        uf = null,
        ativo = true,
    } = {}) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.#cpf = cpf;
        this.#cep = cep;
        this.logradouro = logradouro;
        this.bairro = bairro;
        this.localidade = localidade;
        this.uf = uf;
        this.ativo = ativo;
    }

    async criar() {
        return prisma.cliente.create({
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.#cpf,
                cep: this.#cep,
                logradouro: this.logradouro,
                bairro: this.bairro,
                localidade: this.localidade,
                uf: this.uf,
                ativo: this.ativo,
            },
        });
    }

    async atualizar() {
        return prisma.cliente.update({
            where: { id: this.id },
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.#cpf,
                cep: this.#cep,
                ativo: this.ativo,
            },
        });
    }

    async deletar() {
        return prisma.cliente.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.ativo !== undefined) where.ativo = filtros.ativo === 'true';

        return prisma.cliente.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.cliente.findUnique({ where: { id } });
        if (!data) return null;
        return new this(data);
    }

    static async verificarPedidoAberto(clienteId) {
        const pedidosAbertos = await prisma.pedido.count({
            where: {
                status: 'ABERTO',
            },
        });
        return pedidosAbertos > 0;
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'intensitive' };

        if (filtros.cpf) where.cpf = filtros.cpf;

        if (filtros.ativo !== undefined) where.ativo = filtros.ativo === 'true';

        return prisma.cliente.findMany({ where });
    }



    static async buscarPorCamposUnicos({ email, cpf, telefone }) {
        try {
            const cliente = await prisma.cliente.findFirst({
                where: {
                    OR: [{ email: email }, { cpf: cpf }, { telefone: telefone }],
                },
            });
            return cliente;
        } catch (error) {
            throw new Error('Erro ao buscar campos únicos: ' + error.message);
        }
    }
};
