import ProdutosModel from '../models/ProdutosModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, descricao, categoria, preco, disponivel } = req.body;

        if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
        if (!categoria) return res.status(400).json({ error: 'O campo "categoria" é obrigatório!' });

        const categoriaUpper = categoria.toUpperCase();

        const categoriasValidas = ["LANCHE", "BEBIDA", "SOBREMESA", "COMBO"];
        if (!categoriasValidas.includes(categoriaUpper)) {
            return res.status(400).json({
                total: 0,
                mensagem: `Categoria inválido. Categorias aceitas: ${categoriasValidas.join(", ")}`
            });
        }

        if (preco === undefined || preco === null) return res.status(400).json({ error: 'O campo "preco" é obrigatório!' });
        const novoProduto = new ProdutosModel({ nome, descricao, categoria: categoriaUpper, preco: parseFloat(preco), disponivel });

        if (preco <= 0) {
            return res.status(400).json({
                error: 'Preco deve ser maior que 0'
            });
        }

        const data = await novoProduto.criar();

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ProdutosModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum registro encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const produto = await ProdutosModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        res.json({ data: produto });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const exemplo = await ExemploModel.buscarPorId(parseInt(id));

        if (!exemplo) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        if (req.body.nome !== undefined) exemplo.nome = req.body.nome;
        if (req.body.estado !== undefined) exemplo.estado = req.body.estado;
        if (req.body.preco !== undefined) exemplo.preco = parseFloat(req.body.preco);

        const data = await exemplo.atualizar();

        res.json({ message: `O registro "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const produto = await ProdutosModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        await produto.deletar();

        res.json({ message: `O registro "${produto.nome}" foi deletado com sucesso!`, deletado: produto });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};