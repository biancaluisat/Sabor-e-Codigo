import ClienteModel from '../models/clienteModel.js';

export const criar = async (req, res) => {
    try {
        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome || !telefone || !email || !cpf || !cep) {
            return res.status(400).json({

                message: 'Todos os campos são obrigatórios'

            });
        }

        if (cpf.length !== 11) {
            return res.status(400).json({

                message: 'O CPF deve ter pelo menos 11 dígitos'

            });
        }

        if (cep.length !== 8) {
            return res.status(400).json({

                message: 'O CEP deve ter pelo menos 8 dígitos'

             });
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
        res.status(201).json({

            message: 'Cliente criado!'

         });
    } catch (error) {
        res.status(500).json({

             message: 'Erro ao tentar salvar o cliente.'

            });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const clientes = await ClienteModel.buscarTodos(req.query);
        res.json(clientes);
    } catch (error) {
        res.status(500).json({


            message: 'Erro ao tentar busca clientes.'

        });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({

                message: `O cliente com o id ${id} não existe.`

            });
        }

        res.json(cliente);
    } catch (error) {
        res.status(500).json({

            error: 'Erro ao buscar cliente.',
            message: 'Erro ao buscar o cliente pelo o id informado.'

        });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({


                message: 'O cliente com id informado não foi encontrado'

            });
        }

        const camposPermitidos = [ 'nome', 'telefone', 'email', 'cpf', 'cep' ];

        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                cliente[campo] = req.body[campo];
            }
        });

        const data = await cliente.atualizar();
        res.json({

            message: 'Atualizado com sucesso!'

        });
    } catch (error) {
        res.status(500).json({

            message: 'Erro ao tentar atualizar o cliente.'

        });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const temPedidos = await ClienteModel.verificarPedidosAbertos(id);
        if (temPedidos) {
            return res.status(400).json({

                message: 'Cliente tem pedidos abertos!'

            });
        }

        const cliente = await ClienteModel.buscarPorId(id);
        if (!cliente) {
            return res.status(404).json({

                message: 'Cliente não encontrado.'

            });
        }

        await cliente.deletar();
        res.json({

            message: 'Removido com sucesso!'

        });
    } catch (error) {
        res.status(500).json({

            message: 'Erro ao deletar.'

        });
    }
};
