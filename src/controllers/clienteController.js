import ExemploModel from '../models/ClienteModel.js';

const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, telefone, email, cpf, cep, logradouro = null, localidade = null, uf = null, ativo = true} = req.body;

        if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
        if (!telefone) return res.status(400).json({ error: 'O campo "telefone" é obrigatório!' });
        if (!email) return res.status(400).json({ error: 'O campo "email" é obrigatório!' });
        if (!cpf) return res.status(400).json({ error: 'O campo "cpf" é obrigatório!' });
        if (!cep) return res.status(400).json({ error: 'O campo "cep" é obrigatório!' });

        const cliente = new ExemploModel({ nome, telefone, email, cpf, cep, logradouro, localidade, uf, ativo });
        const data = await cliente.criar();

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
}