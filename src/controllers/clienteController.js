import ClienteModel from '../models/clienteModel.js';
import prisma from '../utils/prismaClient.js';

export const getClimaCliente = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const clima = await ClienteModel.buscarClima(id);
        return res.json(clima);
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao buscar o clima para o cliente',
            error: error.message,
        });
    }
};
export const criar = async (req, res) => {
    try {
        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome || !telefone || !email || !cpf || !cep) {
            return res.status(400).json({
                message: 'Todos os campos são obrigatórios',
            });
        }

        if (nome.length < 3 || nome.length > 100) {
            return res.status(400).json({ message: 'O nome deve ter entre 3 e 100 caracteres' });
        }

        if (cep.length !== 9) {
            return res.status(400).json({ message: 'O CEP deve ter exatamente 9 dígitos (ex: 12345-678)' });
        }
        
        const eValidoEmail = req.body.email;


        const temArroba = eValidoEmail.includes('@');
        const temPonto = eValidoEmail.includes('.');

        if (!temArroba || !temPonto) {
            return res.status(400).json({ message: 'O formato do e-mail é inválido.' });
        }

        const emailEmUso = await prisma.cliente.findUnique({
            where: { email: email }
        });


        if (emailEmUso) {
        return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }



        const cpfLimpo = ClienteModel.limparTexto(cpf);
        const telLimpo = ClienteModel.limparTexto(telefone);
        const cepLimpo = ClienteModel.limparTexto(cep);

        if (cpfLimpo.length !== 11) {
            return res.status(400).json({ message: 'O CPF deve ter exatamente 11 dígitos' });
        }

        if (telLimpo.length < 10 || telLimpo.length > 11) {
            return res.status(400).json({ message: 'O telefone deve ter 10 ou 11 dígitos' });
        }

        await ClienteModel.validarCamposUnicos({
            email,
            cpf: cpfLimpo,
            telefone: telLimpo,
        });

        const endereco = await ClienteModel.buscarEnderecoPorCep(cepLimpo);
        if (!endereco) {
            return res.status(400).json({ message: 'CEP inválido ou não encontrado' });
        }

        const cliente = new ClienteModel({
            nome,
            telefone: telLimpo,
            email,
            cpf: cpfLimpo,
            cep: cepLimpo,
            logradouro: endereco.logradouro || null,
            bairro: endereco.bairro || null,
            localidade: endereco.localidade || null,
            uf: endereco.uf || null,
            ativo: true,
        });

        await cliente.criar();

        return res.status(201).json({
            message: 'Cliente criado com sucesso!',
            cliente,
        });
    } catch (error) {
        if (error.code) {
            return res.status(400).json({
                error: error.message,
                message: 'CPF ou Email já cadastrado no sistema',
            });
        }

        return res.status(500).json({
            error: error.message,
            message: 'Erro interno ao tentar salvar o cliente.',
        });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const clientes = await ClienteModel.buscarTodos(req.query);
        return res.json(clientes);
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Erro ao tentar buscar clientes.',
        });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({ message: `O cliente com o id ${id} não existe.` });
        }

        return res.json(cliente);
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Erro ao buscar o cliente pelo o id informado.',
        });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({
                error: error.message,
                message: 'O cliente com id informado não foi encontrado',
            });
        }

        if (req.body.cep && req.body.cep !== cliente.cep) {
            const novoEndereco = await ClienteModel.buscarEnderecoPorCep(req.body.cep);
            if (novoEndereco) {
                cliente.logradouro = novoEndereco.logradouro;
                cliente.bairro = novoEndereco.bairro;
                cliente.localidade = novoEndereco.localidade;
                cliente.uf = novoEndereco.uf;
            }
        }

        const camposPermitidos = ['nome', 'telefone', 'email', 'cpf', 'cep', 'ativo'];

        camposPermitidos.forEach((campo) => {
            if (req.body[campo] !== undefined) {
                if (campo === 'cpf' || campo === 'telefone') {
                    cliente[campo] = ClienteModel.limparTexto(req.body[campo]);
                } else {
                    cliente[campo] = req.body[campo];
                }
            }
        });

        await cliente.atualizar();
        return res.json({ message: 'Atualizado com sucesso!' });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Erro ao tentar atualizar o cliente.',
        });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const temPedidosAbertos = await ClienteModel.verificarPedidosAbertos(id);
        if (temPedidosAbertos) {
            return res.status(400).json({ message: 'Cliente tem pedidos abertos!' });
        }

        const cliente = await ClienteModel.buscarPorId(id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado.' });
        }

        await cliente.deletar();
        return res.json({ message: 'Removido com sucesso!' });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Erro ao deletar.',
        });
    }
};
