import ClienteModel from '../models/ClienteModel.js';

export const criar = async (req, res) => {
    try {
        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome || !telefone || !email || !cpf || !cep) {
            return res.status(400).json({ 
                
                error: 'Todos os campos acima solicitados acima, são obrigatórios!',
                message: 'Todos os campos são obrigatórios para o cadastro do cliente.'

            });
        }

        if (cpf.length !== 11) {
            return res.status(400).json({ 
                
                error: 'O CPF deve ter pelo menos 11 dígitos.',
                message: 'O CPF deve ter pelo menos 11 dígitos para ser cadastrado.'

            });
        }

        if (cep.length !== 8) {
            return res.status(400).json({ 

                error: error,
                message: 'O CEP deve ter pelo menos 8 dígitos para ser cadastrado.'

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
            
             error: 'Erro ao salvar o cliente.',
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
            
            error: 'Erro ao buscar clientes.' ,
            message: 'Erro ao tentar buscar pelos clientes.'
        
        });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({ 
                
                error: 'Cliente não encontrado.',
                message: 'O cliente com o id informado não existe.'
            
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
                
                error: 'Cliente não encontrado.',
                message: 'O cliente com id informado não foi encontrado para ser atualizado'
            
            });
        }

        if (req.body.nome) cliente.nome = req.body.nome;
        if (req.body.telefone) cliente.telefone = req.body.telefone;
        if (req.body.email) cliente.email = req.body.email;
        if (req.body.ativo !== undefined) cliente.ativo = req.body.ativo;

        const data = await cliente.atualizar();
        res.json({ 
            
            message: 'Atualizado com sucesso!', data 
        
        });
    } catch (error) {
        res.status(500).json({ 
            
            error: 'Erro ao atualizar.',
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
                
                error: 'Cliente tem pedidos abertos!'
            
            });
        }

        const cliente = await ClienteModel.buscarPorId(id);
        if (!cliente) {
            return res.status(404).json({ 
                
                error: 'Cliente não encontrado.'
            
            });
        }

        await cliente.deletar();
        res.json({ 
            
            message: 'Removido com sucesso!'
        
        });
    } catch (error) {
        res.status(500).json({ 
            
            error: 'Erro ao deletar.'
        
        });
    }
};