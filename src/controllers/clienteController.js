import ClienteModel from '../models/ClienteModel.js';

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

        ClienteModel.validarNome(nome);
        const cpfLimpo = ClienteModel.validarCpf(cpf);
        const telLimpo = ClienteModel.validarTelefone(telefone);
        const cepLimpo = ClienteModel.validarCep(cep);

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
