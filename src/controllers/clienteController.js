import ClienteModel from '../models/ClienteModel.js';

const limparTexto = (texto) => {
    if (!texto) return '';
    return texto.split('')
        .filter(caractere => caractere >= '0' && caractere <= '9')
        .join('');
};

const EnderecoViaCEP = async (cep) => {
    const cepLimpo = limparTexto(cep);
    if (cepLimpo.length !== 8) return null;

            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (data.error) return null;
                return data;
            } catch (error) {
                return null;
            }
        };


export const criar = async (req, res) => {
    try {
        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome || !telefone || !email || !cpf || !cep) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        if (nome.length < 3 || nome.length > 100) {
            return res.status(400).json({ message: 'O nome deve ter entre 3 e 100 caracteres' });
        }

        if (cep.length !== 9) {
            return res.status(400).json({ message: 'O CEP deve ter exatamente 9 dígitos (ex: 12345-678)' });
        }

        const cpfLimpo = limparTexto(cpf);
        if (cpfLimpo.length !== 11) {
            return res.status(400).json({ message: 'O CPF deve ter exatamente 11 dígitos' });
        }

        const telLimpo = limparTexto(telefone);
        if (telLimpo.length < 10 || telLimpo.length > 11) {
            return res.status(400).json({ message: 'O telefone deve ter 10 ou 11 dígitos' });
        }

        const endereco = await EnderecoViaCEP(cep);
        if (!endereco) {
            return res.status(400).json({ message: 'CEP inválido ou não encontrado' });
        }

        const cliente = new ClienteModel({
            nome,
            telefone: telLimpo,
            email,
            cpf: cpfLimpo,
            cep,
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            localidade: endereco.localidade,
            uf: endereco.uf,
            ativo: true
        });

        await cliente.criar();
        res.status(201).json({ message: 'Cliente criado com sucesso!' });

    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'CPF ou Email já cadastrado no sistema' });
        }
        res.status(500).json({ message: 'Erro ao tentar salvar o cliente' });
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

    const conflito = await ClienteModel.buscarPorCamposUnicos({ email, cpf, telefone });
        
        if (conflito) {
            return res.status(400).json({ 
                message: 'CPF, Email ou Telefone já cadastrado no sistema.' 
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

        if (req.body.cep && req.body.cep !== cliente.cep) {
            const novoEndereco = await EnderecoViaCEP(req.body.cep);
                if (novoEndereco) {
                    cliente.logradouro = novoEndereco.logradouro;
                    cliente.bairro = novoEndereco.bairro;
                    cliente.localidade = novoEndereco.localidade;
                    cliente.uf = novoEndereco.uf;

                }
            }

        const camposPermitidos = [ 'nome', 'telefone', 'email', 'cpf', 'cep', 'ativo' ];

        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                if (campo === 'cpf' || campo === 'telefone') {
                    cliente[campo] = limparTexto(req.body[campo]);
                } else {
                    cliente[campo] = req.body[campo];
                }
            }
        });

        await cliente.atualizar();
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

        const temPedidosAbertos = await ClienteModel.verificarPedidosAbertos(id);
        if (temPedidosAbertos) {
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
