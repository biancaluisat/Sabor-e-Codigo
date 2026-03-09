import ClienteModel from '../models/ClienteModel.js';

const limparTexto = (texto) => {
    if (!texto) return '';
    return texto
        .split('')
        .filter((caractere) => caractere >= '0' && caractere <= '9')
        .join('');
};

const EnderecoViaCEP = async (cep) => {
    const cepLimpo = limparTexto(cep);
    if (cepLimpo.length !== 8) return null;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        if (data.erro) return null;
        return data;
    } catch (error) {
        return null;
    }
};

export const getClimaCliente = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({
                message: ('Cliente não encontrado')
            });
        }

if (!cliente.localidade) {
    return res.status(400).json({
        message: ('Cliente sem cidade cadastrada')
    });
}

const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cliente.localidade)}&count=1&language=pt&countryCode=BR`;
const geoRes = await fetch(geoUrl);
const geoData = await geoRes.json();

if (!geoData.results || geoData.results.length === 0) {
    return res.status(404).json({
        message: ( `Não foi possível encontrar a localização para a cidade ${cliente.localidade}` )
    });
}

const { latitude, logitude } = geoData.results[0];

const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${logitude}&current_weather=true`;
const climaRes = await fetch(climaUrl);
const climaData = await climaRes.json();


const isChovendo = code >= 51;
const isQuente = temp > 25;

let sugestao = "Dia quente! que tal conferir os lançamentos ? ";
if (isQuente) {
    sugestao = "Dia quente! Destaque combos com bebida gelada ";
} else if (isChovendo) {
    sugestao = "Dia chuvoso! Perfeito para pedir um lanche quentinho em casa ";
} else if (temp < 18) {
    sugestao = "Clima fresquinho! Otimo para acompanhar um Petit Gâteau ";
}

return res.json({
    cidade: cliente.localidade,
    temperatura: temp,
    quente: isQuente,
    chuva: isChovendo,
    sugestao
});

    } catch (error) {
            return res.status(500).json({
            message: 'Erro ao buscar o clima para o cliente'
        });
    }
};
export const criar = async (req, res) => {
    try {
        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome || !telefone || !email || !cpf || !cep) {
            return res.status(400).json({
                message: 'Todos os campos são obrigatórios'
            });
        }

        if (nome.length < 3 || nome.length > 100) {
            return res.status(400).json({ message: 'O nome deve ter entre 3 e 100 caracteres' });
        }

        if (cep.length !== 9) {
            return res.status(400).json({ message: 'O CEP deve ter exatamente 9 dígitos (ex: 12345-678)' });
        }

        const cpfLimpo = limparTexto(cpf);
        const telLimpo = limparTexto(telefone);
        const cepLimpo = limparTexto(cep);

        if (cpfLimpo.length !== 11) {
            return res.status(400).json({ message: 'O CPF deve ter exatamente 11 dígitos' });
        }

        if (telLimpo.length < 10 || telLimpo.length > 11) {
            return res.status(400).json({ message: 'O telefone deve ter 10 ou 11 dígitos' });
        }

        const conflito = await ClienteModel.buscarPorCamposUnicos({
            email,
            cpf: cpfLimpo,
            telefone: telLimpo,
        });

        if (conflito) {
            let campo = conflito.cpf === cpfLimpo ? 'CPF' : conflito.email === email ? 'Email' : 'Telefone';
            return res.status(400).json({ message: `Este ${campo} já está cadastrado.` });
        }

        const endereco = await EnderecoViaCEP(cepLimpo);
        if (!endereco) {
            return res.status(400).json({ message: 'CEP inválido ou não encontrado' });
        }

        const cliente = new ClienteModel({
            nome,
            telefone: telLimpo,
            email,
            cpf: cpfLimpo,
            cep: cep,
            logradouro: endereco.logradouro || null,
            bairro: endereco.bairro || null,
            localidade: endereco.localidade || null,
            uf: endereco.uf || null,
            ativo: true,
        });

        await cliente.criar();

        return res.status(201).json({

            message: 'Cliente criado com sucesso!',
            cliente
        });

    } catch (error) {
        if (error.code) {
            return res.status(400).json({
                error: error.message,
                message:
                    'CPF ou Email já cadastrado no sistema',
            });
        }

        return res.status(500).json({

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
            message:
                'Erro ao tentar buscar clientes.'
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
                error: error.message,
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

        const camposPermitidos = ['nome', 'telefone', 'email', 'cpf', 'cep', 'ativo'];

        camposPermitidos.forEach((campo) => {
            if (req.body[campo] !== undefined) {
                if (campo === 'cpf' || campo === 'telefone') {
                    cliente[campo] = limparTexto(req.body[campo]);
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
            message: 'Erro ao tentar atualizar o cliente.'
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
            message: 'Erro ao deletar.'
        });
    }
};
