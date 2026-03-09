import ClienteModel from '../models/ClienteModel.js';

export const getClimaCliente = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID inválido. Informe um número válido.',
            });
        }
        
        const cliente = await ClienteModel.buscarPorId(id);
        
        if (!cliente) {
            return res.status(404).json({
                erro: 'Cliente não encontrado.',
            });
        }
        
        const clima = await ClienteModel.buscarClima(id);
        
        return res.json({
            cidade: cliente.localidade,
            ...clima,
        });
    } catch (error) {
        return res.status(400).json({
            erro: error.message,
        });
    }
};

export const criar = async (req, res) => {
    try {
        const { nome, telefone, email, cpf, cep } = req.body;

        ClienteModel.validarNome(nome);
        const cepValidado = ClienteModel.validarCep(cep);
        ClienteModel.validarCpf(cpf);
        ClienteModel.validarTelefone(telefone);
        ClienteModel.validarEmail(email);

        await ClienteModel.validarCamposUnicos({
            email,
            cpf: ClienteModel.limparTexto(cpf),
            telefone: ClienteModel.limparTexto(telefone),
        });

        let endereco = null;
        try {
            endereco = await ClienteModel.buscarEnderecoPorCep(cepValidado);
        } catch (erroCep) {
            return res.status(400).json({ erro: erroCep.message });
        }

        const cliente = new ClienteModel({
            nome,
            telefone: ClienteModel.limparTexto(telefone),
            email,
            cpf: ClienteModel.limparTexto(cpf),
            cep: cepValidado,
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

        return res.status(400).json({
            erro: error.message,
        });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const clientes = await ClienteModel.buscarTodos(req.query);
        if (!clientes || clientes.length === 0) {
            return res.status(200).json({ 
                mensagem: 'Nenhum cliente encontrado.' 
            });
        }
        return res.json(clientes);
    } catch (error) {
        return res.status(400).json({
            erro: error.message,
        });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({ 
                erro: 'ID inválido. Informe um número válido.' 
            });
        }
        
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({ 
                erro: `O cliente com id ${id} não foi encontrado.` 
            });
        }

        return res.json(cliente);
    } catch (error) {
        return res.status(400).json({
            erro: error.message,
        });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({
                erro: 'O cliente com id informado não foi encontrado',
            });
        }

        if (req.body.cep && req.body.cep !== cliente.cep) {
            try {
                const cepValidado = ClienteModel.validarCep(req.body.cep);
                const novoEndereco = await ClienteModel.buscarEnderecoPorCep(cepValidado);
                if (novoEndereco) {
                    cliente.logradouro = novoEndereco.logradouro;
                    cliente.bairro = novoEndereco.bairro;
                    cliente.localidade = novoEndereco.localidade;
                    cliente.uf = novoEndereco.uf;
                    cliente.cep = cepValidado;
                }
            } catch (erroCep) {
                return res.status(400).json({ erro: erroCep.message });
            }
        }

        if (req.body.nome !== undefined) {
            ClienteModel.validarNome(req.body.nome);
            cliente.nome = req.body.nome;
        }
        
        if (req.body.cpf !== undefined) {
            const cpfValidado = ClienteModel.validarCpf(req.body.cpf);
            cliente.cpf = cpfValidado;
        }
        
        if (req.body.telefone !== undefined) {
            const telValidado = ClienteModel.validarTelefone(req.body.telefone);
            cliente.telefone = telValidado;
        }
        
        if (req.body.email !== undefined) {
            ClienteModel.validarEmail(req.body.email);
            cliente.email = req.body.email;
        }
        
        if (req.body.ativo !== undefined) {
            cliente.ativo = req.body.ativo;
        }

        await cliente.atualizar();
        return res.json({ 
            message: 'Cliente atualizado com sucesso!',
            cliente 
        });
    } catch (error) {
        return res.status(400).json({
            erro: error.message,
        });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return res.status(400).json({
                erro: 'ID inválido. Informe um número válido.',
            });
        }

        const temPedidosAbertos = await ClienteModel.verificarPedidosAbertos(id);
        if (temPedidosAbertos) {
            return res.status(400).json({ 
                erro: 'Não é possível deletar cliente com pedidos abertos.' 
            });
        }

        const cliente = await ClienteModel.buscarPorId(id);
        if (!cliente) {
            return res.status(404).json({ 
                erro: 'Cliente não encontrado.' 
            });
        }

        await cliente.deletar();
        return res.json({ message: 'Cliente removido com sucesso!' });
    } catch (error) {
        return res.status(400).json({
            erro: error.message,
        });
    }
};
