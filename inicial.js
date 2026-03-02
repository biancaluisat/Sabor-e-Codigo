/*
 *
 * NUNCA EDITE ESTE ARQUIVO 💥
 *
 *
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createInterface } = require('readline');
const { pacotes, criarItens, apagar } = require('./support.js');

const log = {
    title: (msg) => console.log(`\n\x1b[36m\x1b[1m┌── ${msg} ──┐\x1b[0m`),
    action: (msg) => console.log(`\x1b[36m→ ${msg}\x1b[0m`),
    success: (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`),
    info: (msg) => console.log(`\x1b[90m• ${msg}\x1b[0m`),
    error: (msg) => console.log(`\x1b[31m✗ ${msg}\x1b[0m`),
    warning: (msg) => console.log(`\x1b[33m⚠ ${msg}\x1b[0m`),
};

function limparTela() {
    process.stdout.write('\x1b[2J\x1b[H');
}

function runCommand(command) {
    return new Promise((resolve, reject) => {
        log.action(`Executando: ${command}`);

        const proc = spawn(command, [], {
            cwd: __dirname,
            shell: true,
            stdio: 'inherit',
        });

        proc.on('exit', (code) => {
            if (code === 0) {
                log.success(`Comando finalizado: ${command}`);
                resolve();
            } else {
                log.error(`Comando falhou com código: ${code}`);
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        proc.on('error', (err) => {
            log.error(`Erro ao executar comando: ${err.message}`);
            reject(err);
        });
    });
}

function criarEstrutura(basePath, estrutura) {
    for (const [nome, conteudo] of Object.entries(estrutura)) {
        const caminho = path.join(basePath, nome);

        if (typeof conteudo === 'object' && !('codigo' in conteudo)) {
            fs.mkdirSync(caminho, { recursive: true });
            log.info(`Pasta criada: ${caminho}`);
            criarEstrutura(caminho, conteudo);
        } else if ('codigo' in conteudo) {
            let codigoFinal = conteudo.codigo || '';

            if (nome === 'package.json') {
                const nomeDaPasta = path.basename(__dirname);
                codigoFinal = codigoFinal.replace('"NOME_DA_PASTA"', `"${nomeDaPasta}"`);
            }

            fs.writeFileSync(caminho, codigoFinal, 'utf8');
            log.success(`Arquivo criado: ${caminho}`);
        }
    }
}

async function instalarPacotesExtras() {
    if (!pacotes || pacotes.length === 0) {
        log.info('Nenhum pacote extra para instalar');
        return;
    }
    log.title('Instalando pacotes extras');
    for (const pacote of pacotes) {
        await runCommand(`npm install ${pacote}`);
    }
}

async function atualizarPackageJson() {
    log.title('Atualizando package.json');
    const packagePath = path.join(__dirname, 'package.json');

    try {
        let packageContent = { dependencies: {}, devDependencies: {} };

        if (fs.existsSync(packagePath)) {
            packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        }

        const nomeDaPasta = path.basename(__dirname);

        const packageJsonAtualizado = {
            name: nomeDaPasta,
            version: '1.0.0',
            description: '',
            main: 'server.js',
            type: 'module',
            private: true,
            scripts: {
                dev: 'cls && nodemon src/server.js',
            },
            keywords: [],
            author: '',
            license: 'MIT',
            dependencies: packageContent.dependencies || {},
            devDependencies: packageContent.devDependencies || {},
        };

        fs.writeFileSync(
            packagePath,
            JSON.stringify(packageJsonAtualizado, null, 2) + '\n',
            'utf8',
        );
        log.success('package.json atualizado com sucesso');
    } catch (erro) {
        log.error(`Erro ao atualizar package.json: ${erro.message}`);
    }
}

async function deletarPrimeiro() {
    log.title('Deletando arquivos/pastas da primeira etapa');

    if (!Array.isArray(apagar.primeiro)) {
        log.info('Nenhum item configurado em apagar.primeiro');
        return;
    }

    for (const item of apagar.primeiro) {
        const caminho = path.join(__dirname, item);
        try {
            if (fs.existsSync(caminho)) {
                const stats = fs.statSync(caminho);
                if (stats.isDirectory()) {
                    fs.rmSync(caminho, { recursive: true, force: true });
                    log.success(`Pasta removida: ${item}`);
                } else {
                    fs.unlinkSync(caminho);
                    log.success(`Arquivo removido: ${item}`);
                }
            } else {
                log.info(`Não encontrado: ${item}`);
            }
        } catch (erro) {
            log.error(`Erro ao deletar ${item}: ${erro.message}`);
        }
    }
}

async function main() {
    try {
        log.title('Iniciando SETUP INICIAL');

        // 1. Criar estrutura de pastas/arquivos
        criarEstrutura(__dirname, criarItens);

        // 2. Instalar dependências
        await instalarPacotesExtras();

        // 3. Atualizar package.json com dependências instaladas
        await atualizarPackageJson();

        // 4. Deletar arquivos da etapa 1
        await deletarPrimeiro();

        // 5. Mensagem final orientando o usuário
        limparTela();
        console.log('');
        console.log('\x1b[32m\x1b[1m╔══════════════════════════════════════════════╗\x1b[0m');
        console.log('\x1b[32m\x1b[1m║       ETAPA 1 CONCLUÍDA COM SUCESSO!         ║\x1b[0m');
        console.log('\x1b[32m\x1b[1m╚══════════════════════════════════════════════╝\x1b[0m');
        console.log('');
        console.log('\x1b[33m\x1b[1m╔══════════════════════════════════════════════╗\x1b[0m');
        console.log('\x1b[33m\x1b[1m║   ANTES DE CONTINUAR, AJUSTE OS ARQUIVOS:    ║\x1b[0m');
        console.log('\x1b[33m\x1b[1m║                                              ║\x1b[0m');
        console.log('\x1b[33m\x1b[1m║   → prisma/schema.prisma                     ║\x1b[0m');
        console.log('\x1b[33m\x1b[1m║   → prisma/seed.js                           ║\x1b[0m');
        console.log('\x1b[33m\x1b[1m║                                              ║\x1b[0m');
        console.log('\x1b[33m\x1b[1m║   Quando terminar, execute:                  ║\x1b[0m');
        console.log('\x1b[33m\x1b[1m║                                              ║\x1b[0m');
        console.log('\x1b[33m\x1b[1m║                       node amods.js          ║\x1b[0m');
        console.log('\x1b[33m\x1b[1m╚══════════════════════════════════════════════╝\x1b[0m');
        console.log('');
    } catch (erro) {
        log.error(`Erro no setup inicial: ${erro.message}`);
        process.exit(1);
    }
}

main();
