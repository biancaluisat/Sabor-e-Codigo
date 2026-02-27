import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🧹 Limpando dados existentes...');

    await prisma.cliente.deleteMany();
    await prisma.produto.deleteMany();

    console.log('📦 Inserindo Clientes...');
    await prisma.cliente.createMany({
        data: [
            {
                nome: 'João Silva',
                telefone: '11999999999',
                email: 'joao@email.com',
                cpf: '12345678901',
                cep: '01001000',
                logradouro: 'Praça da Sé',
                bairro: 'Sé',
                localidade: 'São Paulo',
                uf: 'SP',
            },
            {
                nome: 'Maria Oliveira',
                telefone: '21988887777',
                email: 'maria.oliveira@provedor.com',
                cpf: '98765432100',
                cep: '20040002',
                logradouro: 'Avenida Rio Branco',
                bairro: 'Centro',
                localidade: 'Rio de Janeiro',
                uf: 'RJ',
            },
            {
                nome: 'Ricardo Santos',
                telefone: '31977776666',
                email: 'ricardo.santos@exemplo.com.br',
                cpf: '45678912344',
                cep: '30140010',
                logradouro: 'Rua da Bahia',
                bairro: 'Lourdes',
                localidade: 'Belo Horizonte',
                uf: 'MG',
            },
        ],
    });

    console.log('🍔 Inserindo Produtos...');
    await prisma.produto.createMany({
        data: [
            {
                nome: 'X-Burger Especial',
                descricao: 'Pão, carne de 180g e queijo prato',
                categoria: 'LANCHE',
                preco: 35.5,
            },
            {
                nome: 'Coca-Cola 350ml',
                descricao: 'Lata gelada',
                categoria: 'BEBIDA',
                preco: 7.0,
            },
            {
                nome: 'Petit Gâteau',
                descricao: 'Acompanha sorvete de baunilha',
                categoria: 'SOBREMESA',
                preco: 22.0,
            },
            {
                nome: 'Combo Casal',
                descricao: '2 Lanches + 1 Batata G + 2 Bebidas',
                categoria: 'COMBO',
                preco: 85.9,
            },
        ],
    });

    console.log('✅ Seed finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
