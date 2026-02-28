import ClienteModel from '../models/ClienteModel.js';

export const criar = async (req, res) => {
    try {
        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome || !telefone || !email || !cpf || !cep) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
        }

        if (cpf.length !== 11) {
            return res.status(400).json({ error: 'O CPF deve ter 11 dígitos.' });
        }

        if (cep.length !== 8) {
            return res.status(400).json({ error: 'O CEP deve ter 8 dígitos.' });
        }

        const cliente = new ClienteModel({
            nome,
            telefone,
            email,
            cpf,
            cep,
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
            ativo: true
        });

        const data = await cliente.criar();
        res.status(201).json({ message: 'Cliente criado!', data });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar o cliente.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const clientes = await ClienteModel.buscarTodos(req.query);
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar clientes.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cliente.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        if (req.body.nome) cliente.nome = req.body.nome;
        if (req.body.telefone) cliente.telefone = req.body.telefone;
        if (req.body.email) cliente.email = req.body.email;
        if (req.body.ativo !== undefined) cliente.ativo = req.body.ativo;

        const data = await cliente.atualizar();
        res.json({ message: 'Atualizado com sucesso!', data });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar.' });
    }
};