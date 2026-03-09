import prisma from '../utils/prismaClient.js';

export default class ClienteModel {
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
        this.cpf = cpf;
        this.cep = cep;
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
                cpf: this.cpf,
                cep: this.cep,
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
                cpf: this.cpf,
                cep: this.cep,
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
        if (filtros.cpf) where.cpf = filtros.cpf;
        if (filtros.ativo !== undefined) where.ativo = filtros.ativo === 'true';

        return prisma.cliente.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.cliente.findUnique({ where: { id } });
        if (!data) return null;
        return new this(data);
    }

    static async verificarPedidosAbertos(clienteId) {
        const pedidosAbertos = await prisma.pedido.count({
            where: {
                clienteId: clienteId,
                status: 'ABERTO',
            },
        });
        return pedidosAbertos > 0;
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

    static limparTexto(texto) {
        if (!texto) return '';
        return texto
            .split('')
            .filter((caractere) => caractere >= '0' && caractere <= '9')
            .join('');
    }

    static async buscarEnderecoPorCep(cep) {
        const cepLimpo = this.limparTexto(cep);
        if (cepLimpo.length !== 8) return null;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            
            if (data.erro) {
                throw new Error(`CEP ${cepLimpo} não encontrado.`);
            }
            
            return data;
        } catch (error) {
            if (error.message.includes('não encontrado')) {
                throw error;
            }
            throw new Error('Serviço ViaCEP indisponível no momento.');
        }
    }

    static validarNome(nome) {
        if (!nome || nome.length < 3 || nome.length > 100) {
            throw new Error('O nome deve ter entre 3 e 100 caracteres');
        }
    }

    static validarCpf(cpf) {
        const cpfLimpo = this.limparTexto(cpf);
        if (cpfLimpo.length !== 11) {
            throw new Error('CPF deve conter exatamente 11 dígitos numéricos.');
        }
        
        if (/^(\d)\1{10}$/.test(cpfLimpo)) {
            throw new Error('CPF informado é inválido.');
        }
        
        let soma = 0;
        let resto;
        
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
        }
        
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        
        if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
            throw new Error('CPF informado é inválido.');
        }
        
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
        }
        
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        
        if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
            throw new Error('CPF informado é inválido.');
        }
        
        return cpfLimpo;
    }

    static validarTelefone(telefone) {
        const telLimpo = this.limparTexto(telefone);
        if (telLimpo.length < 10 || telLimpo.length > 11) {
            throw new Error('O telefone deve ter 10 ou 11 dígitos');
        }
        return telLimpo;
    }

    static validarCep(cep) {
        const cepLimpo = this.limparTexto(cep);
        if (cepLimpo.length !== 8) {
            throw new Error('CEP deve conter exatamente 9 dígitos numéricos.');
        }
        return cepLimpo;
    }

    static validarEmail(email) {
        if (!email) {
            throw new Error('O email é obrigatório');
        }
        const temArroba = email.includes('@');
        const temPonto = email.includes('.');
        
        if (!temArroba || !temPonto) {
            throw new Error('O formato do e-mail é inválido.');
        }
    }

    static async validarCamposUnicos({ email, cpf, telefone }) {
        const conflito = await this.buscarPorCamposUnicos({ email, cpf, telefone });
        if (conflito) {
            let campo =
                conflito.cpf === cpf ? 'CPF' : conflito.email === email ? 'Email' : 'Telefone';
            throw new Error(`Este ${campo} já está cadastrado.`);
        }
    }

    static async buscarClima(clienteId) {
        const cliente = await this.buscarPorId(clienteId);
        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }
        if (!cliente.localidade) {
            throw new Error('Cliente sem cidade cadastrada');
        }
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            cliente.localidade,
        )}&count=1&language=pt&countryCode=BR`;
        
        try {
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();
            if (!geoData.results || geoData.results.length === 0) {
                return {
                    temperatura: null,
                    chove: null,
                    quente: null,
                    sugestao: null,
                };
            }
            
            const { latitude, longitude } = geoData.results[0];
            const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=America/Sao_Paulo`;
            const climaRes = await fetch(climaUrl);
            const climaData = await climaRes.json();
            
            const temp = climaData.current.temperature_2m;
            const code = climaData.current.weathercode;
            
            const chove = code >= 51 && code <= 67;
            const quente = temp >= 28;
            const frio = temp <= 18;
            
            let sugestao = 'Clima agradável! Aproveite para divulgar combos da casa.';
            
            if (chove) {
                sugestao = 'Dia chuvoso! Ofereça promoções para delivery.';
            } else if (quente) {
                sugestao = 'Dia quente! Destaque combos com bebida gelada.';
            } else if (frio) {
                sugestao = 'Dia frio! Destaque cafés e lanches quentes.';
            }
            
            return {
                temperatura: temp,
                chove,
                quente,
                sugestao,
            };
        } catch (error) {
            return {
                temperatura: null,
                chove: null,
                quente: null,
                sugestao: null,
            };
        }
    }
}
