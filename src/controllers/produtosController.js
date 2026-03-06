import ProdutosModel from '../models/ProdutosModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, descricao, categoria, preco, disponivel } = req.body;

        if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });

        if (nome.length < 3) {
            return res.status(400).json({
                mensagem: 'O nome precisa de no mínimo 3 caracteres'
            });
        }

        if (descricao && descricao.length > 255) {
            return res.status(400).json({
                mensagem: 'A descrição não pode ter mais que 255 caracteres'
            });
        }

        if (!categoria) return res.status(400).json({ error: 'O campo "categoria" é obrigatório!' });

        const categoriaUpper = categoria.toUpperCase();

        const categoriasValidas = ["LANCHE", "BEBIDA", "SOBREMESA", "COMBO"];
        if (!categoriasValidas.includes(categoriaUpper)) {
            return res.status(400).json({
                total: 0,
                mensagem: `Categoria inválida. Categorias aceitas: ${categoriasValidas.join(", ")}`
            });
        }

        if (preco === undefined || preco === null) return res.status(400).json({ error: 'O campo "preco" é obrigatório!' });
        if (preco <= 0) {
            return res.status(400).json({
                mensagem: 'o preco deve ser maior que 0'
            });
        }

        if (preco * 100 % 1 !== 0) {
            return res.status(400).json({
                mensagem: 'O preco deve ter no máximo duas casas decimais'
            });
        }

        const novoProduto = new ProdutosModel({ nome, descricao, categoria: categoriaUpper, preco: parseFloat(preco), disponivel });


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

        const produto = await ProdutosModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        if (req.body.nome !== undefined) {
            if (req.body.nome.length < 3) {
                return res.status(400).json({
                    mensagem: 'O nome precisa de no mínimo 3 caracteres',
                });
            }

            produto.nome = req.body.nome;
        }
        if (req.body.descricao !== undefined) {
            if (req.body.descricao.length > 255) {
                return res.status(400).json({
                    mensagem: 'A descrição não pode ter mais que 255 caracteres',
                });
            }

            produto.descricao = req.body.descricao;
        }

        if (req.body.categoria !== undefined) {
            const categoriaUpper = req.body.categoria.toUpperCase();

            const categoriasValidas = ["LANCHE", "BEBIDA", "SOBREMESA", "COMBO"];
            if (!categoriasValidas.includes(categoriaUpper)) {
                return res.status(400).json({
                    total: 0,
                    mensagem: `Categoria inválida. Categorias aceitas: ${categoriasValidas.join(", ")}`
                });
            }
            produto.categoria = categoriaUpper;
        }

        if (req.body.preco !== undefined) {
            if (parseFloat(req.body.preco) <= 0) {
                return res.status(400).json({
                    mensagem: 'Preco deve ser maior que 0'
                });
            }
            if ((req.body.preco * 100) % 1 !== 0) {
                return res.status(400).json({
                    mensagem: 'O preco deve ter no máximo duas casas decimais',
                });
            }

            produto.preco = parseFloat(req.body.preco);
        }
        if (req.body.disponivel !== undefined) produto.disponivel = req.body.disponivel;

        const data = await produto.atualizar();

        res.json({ message: `O registro "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;
        const produtoId = parseInt(id);

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const produto = await ProdutosModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        const vinculado = await ProdutosModel.pedidoAberto(produtoId);
        if (vinculado) {
            return res.status(400).json({
                mensagem: "Este produto não pode ser excluído, pois está vinculado a pedidos abertos"
            });
        }

        await produto.deletar();

        res.json({ message: `O registro "${produto.nome}" foi deletado com sucesso!`, deletado: produto });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
