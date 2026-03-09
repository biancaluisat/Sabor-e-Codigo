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

    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.produto.deleteMany();

    console.log('Inserindo Clientes...');
    const c1 = await prisma.cliente.create({
        data: {
            nome: 'João Silva',
            telefone: '11999999999',
            email: 'joao@email.com',
            cpf: '12345678901',
            cep: '13040702',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });
    const c2 = await prisma.cliente.create({
        data: {
            nome: 'Maria Oliveira',
            telefone: '21988887777',
            email: 'maria.oliveira@provedor.com',
            cpf: '98765432100',
            cep: '13045270',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });
    const c3 = await prisma.cliente.create({
        data: {
            nome: 'Ricardo Santos',
            telefone: '31977776666',
            email: 'ricardo.santos@exemplo.com.br',
            cpf: '45678912344',
            cep: '13044210',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });
    const c4 = await prisma.cliente.create({
        data: {
            nome: 'Ana Costa',
            telefone: '41966665555',
            email: 'ana.costa@email.com',
            cpf: '32165498722',
            cep: '13040100',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });
    const c5 = await prisma.cliente.create({
        data: {
            nome: 'Pedro Lima',
            telefone: '51955554444',
            email: 'pedro.lima@provedor.com',
            cpf: '78912345633',
            cep: '13045300',
            logradouro: null,
            bairro: null,
            localidade: null,
            uf: null,
        },
    });

    console.log('🍔 Inserindo Produtos...');
    const p1 = await prisma.produto.create({
        data: {
            nome: 'X-Burger Especial',
            categoria: 'LANCHE',
            preco: 35.5,
            descricao: 'Pão e carne 180g',
        },
    });
    const p2 = await prisma.produto.create({
        data: {
            nome: 'Coca-Cola 350ml',
            categoria: 'BEBIDA',
            preco: 7.0,
            descricao: 'Lata gelada',
        },
    });
    const p3 = await prisma.produto.create({
        data: {
            nome: 'Petit Gâteau',
            categoria: 'SOBREMESA',
            preco: 22.0,
            descricao: 'Com sorvete',
        },
    });
    const p4 = await prisma.produto.create({
        data: {
            nome: 'Batata Frita Grande',
            categoria: 'COMBO',
            preco: 15.0,
            descricao: 'Porção grande com bacon',
        },
    });
    const p5 = await prisma.produto.create({
        data: {
            nome: 'Suco de Laranja 500ml',
            categoria: 'BEBIDA',
            preco: 8.5,
            descricao: 'Natural e refrescante',
        },
    });
    const p6 = await prisma.produto.create({
        data: {
            nome: 'Salada Caesar',
            categoria: 'LANCHE',
            preco: 18.0,
            descricao: 'Com frango grelhado',
        },
    });

    console.log('📝 Inserindo Pedidos e Itens...');

    await prisma.pedido.create({
        data: {
            clienteId: c1.id,
            status: 'ABERTO',
            total: 42.5,
            itens: {
                create: [
                    { produtoId: p1.id, quantidade: 1, precoUnitario: 35.5 },
                    { produtoId: p2.id, quantidade: 1, precoUnitario: 7.0 },
                ],
            },
        },
    });

    await prisma.pedido.create({
        data: {
            clienteId: c2.id,
            status: 'PAGO',
            total: 22.0,
            itens: {
                create: [{ produtoId: p3.id, quantidade: 1, precoUnitario: 22.0 }],
            },
        },
    });

    await prisma.pedido.create({
        data: {
            clienteId: c3.id,
            status: 'CANCELADO',
            total: 71.0,
            itens: {
                create: [{ produtoId: p1.id, quantidade: 2, precoUnitario: 35.5 }],
            },
        },
    });

    await prisma.pedido.create({
        data: {
            clienteId: c4.id,
            status: 'ABERTO',
            total: 76.5,
            itens: {
                create: [
                    { produtoId: p1.id, quantidade: 1, precoUnitario: 35.5 },
                    { produtoId: p4.id, quantidade: 1, precoUnitario: 15.0 },
                    { produtoId: p5.id, quantidade: 1, precoUnitario: 8.5 },
                    { produtoId: p3.id, quantidade: 1, precoUnitario: 22.0 },
                ],
            },
        },
    });

    await prisma.pedido.create({
        data: {
            clienteId: c5.id,
            status: 'PAGO',
            total: 43.5,
            itens: {
                create: [
                    { produtoId: p6.id, quantidade: 1, precoUnitario: 18.0 },
                    { produtoId: p5.id, quantidade: 1, precoUnitario: 8.5 },
                    { produtoId: p2.id, quantidade: 1, precoUnitario: 7.0 },
                ],
            },
        },
    });

    await prisma.pedido.create({
        data: {
            clienteId: c1.id,
            status: 'ABERTO',
            total: 53.0,
            itens: {
                create: [
                    { produtoId: p4.id, quantidade: 2, precoUnitario: 15.0 },
                    { produtoId: p2.id, quantidade: 2, precoUnitario: 7.0 },
                ],
            },
        },
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
