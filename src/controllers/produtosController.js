import ProdutosModel from '../models/ProdutosModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, descricao, categoria, preco, disponivel } = req.body;

        ProdutosModel.validarNome(nome);
        ProdutosModel.validarDescricao(descricao);
        const categoriaUpper = ProdutosModel.validarCategoria(categoria);
        const precoValidado = ProdutosModel.validarPreco(preco);

        const novoProduto = new ProdutosModel({
            nome,
            descricao,
            categoria: categoriaUpper,
            preco: precoValidado,
            disponivel,
        });

        const data = await novoProduto.criar();

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(400).json({ error: error.message });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ProdutosModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum produto encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(400).json({ erro: error.message });
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

        const produto = await ProdutosModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        if (req.body.nome !== undefined) {
            ProdutosModel.validarNome(req.body.nome);
            produto.nome = req.body.nome;
        }
        if (req.body.descricao !== undefined) {
            ProdutosModel.validarDescricao(req.body.descricao);
            produto.descricao = req.body.descricao;
        }
        if (req.body.categoria !== undefined) {
            produto.categoria = ProdutosModel.validarCategoria(req.body.categoria);
        }
        if (req.body.preco !== undefined) {
            produto.preco = ProdutosModel.validarPreco(req.body.preco);
        }
        if (req.body.disponivel !== undefined) produto.disponivel = req.body.disponivel;

        const data = await produto.atualizar();

        res.json({ message: `O registro "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(400).json({ error: error.message });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const produtoId = parseInt(id);

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const produto = await ProdutosModel.buscarPorId(produtoId);

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        const vinculado = await ProdutosModel.pedidoAberto(produtoId);
        if (vinculado) {
            return res.status(400).json({
                mensagem:
                    'Este produto não pode ser excluído, pois está vinculado a pedidos abertos',
            });
        }

        await produto.deletar();

        res.json({
            message: `O registro "${produto.nome}" foi deletado com sucesso!`,
            deletado: produto,
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
