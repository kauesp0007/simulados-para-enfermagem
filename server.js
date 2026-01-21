/**
 * Server.js - Backend Node.js/Express
 * API RESTful para Simulados de Enfermagem
 * 
 * Funcionalidades:
 * - Leitura de dados do GitHub (JSON)
 * - Sincronização de progresso do usuário
 * - Armazenamento de histórico
 * - Sem autenticação obrigatória
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Diretórios de dados
const DATABASE_DIR = path.join(__dirname, 'database');
const USUARIOS_DIR = path.join(DATABASE_DIR, 'usuarios');
const PROGRESSO_DIR = path.join(DATABASE_DIR, 'progresso');

/**
 * Inicializa diretórios de dados
 */
async function inicializarDiretorio() {
    try {
        await fs.mkdir(DATABASE_DIR, { recursive: true });
        await fs.mkdir(USUARIOS_DIR, { recursive: true });
        await fs.mkdir(PROGRESSO_DIR, { recursive: true });
        console.log('✅ Diretórios de dados inicializados');
    } catch (err) {
        console.error('❌ Erro ao inicializar diretórios:', err);
    }
}

/**
 * Lê arquivo JSON
 */
async function lerJSON(caminhoArquivo) {
    try {
        const dados = await fs.readFile(caminhoArquivo, 'utf-8');
        return JSON.parse(dados);
    } catch (err) {
        console.error(`Erro ao ler ${caminhoArquivo}:`, err);
        return null;
    }
}

/**
 * Escreve arquivo JSON
 */
async function escreverJSON(caminhoArquivo, dados) {
    try {
        await fs.writeFile(caminhoArquivo, JSON.stringify(dados, null, 2));
        console.log(`✅ Arquivo salvo: ${caminhoArquivo}`);
        return true;
    } catch (err) {
        console.error(`Erro ao escrever ${caminhoArquivo}:`, err);
        return false;
    }
}

/**
 * Gera ou recupera UUID do usuário
 */
function obterOuCriarUserId(req) {
    let userId = req.headers['x-user-id'];
    if (!userId) {
        userId = uuidv4();
    }
    return userId;
}

// ============================================
// ROTAS: PROVAS
// ============================================

/**
 * GET /api/provas - Retorna todas as provas
 */
app.get('/api/provas', async (req, res) => {
    try {
        const caminhoProvas = path.join(DATABASE_DIR, 'provas.json');
        const provas = await lerJSON(caminhoProvas);
        
        if (!provas) {
            return res.status(404).json({ erro: 'Provas não encontradas' });
        }
        
        res.json({
            sucesso: true,
            total: provas.length,
            dados: provas
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar provas' });
    }
});

/**
 * GET /api/provas/:id - Retorna uma prova específica
 */
app.get('/api/provas/:id', async (req, res) => {
    try {
        const caminhoProvas = path.join(DATABASE_DIR, 'provas.json');
        const provas = await lerJSON(caminhoProvas);
        
        if (!provas) {
            return res.status(404).json({ erro: 'Provas não encontradas' });
        }
        
        const prova = provas.find(p => p.id == req.params.id);
        
        if (!prova) {
            return res.status(404).json({ erro: 'Prova não encontrada' });
        }
        
        res.json({
            sucesso: true,
            dados: prova
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar prova' });
    }
});

// ============================================
// ROTAS: CONCURSOS
// ============================================

/**
 * GET /api/concursos - Retorna todos os concursos
 */
app.get('/api/concursos', async (req, res) => {
    try {
        const caminhoConcursos = path.join(DATABASE_DIR, 'concursos.json');
        const concursos = await lerJSON(caminhoConcursos);
        
        if (!concursos) {
            return res.status(404).json({ erro: 'Concursos não encontrados' });
        }
        
        res.json({
            sucesso: true,
            total: concursos.length,
            dados: concursos
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar concursos' });
    }
});

/**
 * GET /api/concursos/:id - Retorna um concurso específico
 */
app.get('/api/concursos/:id', async (req, res) => {
    try {
        const caminhoConcursos = path.join(DATABASE_DIR, 'concursos.json');
        const concursos = await lerJSON(caminhoConcursos);
        
        if (!concursos) {
            return res.status(404).json({ erro: 'Concursos não encontrados' });
        }
        
        const concurso = concursos.find(c => c.id == req.params.id);
        
        if (!concurso) {
            return res.status(404).json({ erro: 'Concurso não encontrado' });
        }
        
        res.json({
            sucesso: true,
            dados: concurso
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar concurso' });
    }
});

// ============================================
// ROTAS: QUESTÕES
// ============================================

/**
 * GET /api/questoes - Retorna todas as questões
 */
app.get('/api/questoes', async (req, res) => {
    try {
        const caminhoQuestoes = path.join(DATABASE_DIR, 'questoes.json');
        const questoes = await lerJSON(caminhoQuestoes);
        
        if (!questoes) {
            return res.status(404).json({ erro: 'Questões não encontradas' });
        }
        
        // Filtros opcionais
        let resultado = questoes;
        
        if (req.query.dificuldade) {
            resultado = resultado.filter(q => q.dificuldade === req.query.dificuldade);
        }
        
        if (req.query.topico) {
            resultado = resultado.filter(q => q.topico === req.query.topico);
        }
        
        res.json({
            sucesso: true,
            total: resultado.length,
            dados: resultado
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar questões' });
    }
});

/**
 * GET /api/questoes/aleatorio/:quantidade - Retorna questões aleatórias
 */
app.get('/api/questoes/aleatorio/:quantidade', async (req, res) => {
    try {
        const caminhoQuestoes = path.join(DATABASE_DIR, 'questoes.json');
        const questoes = await lerJSON(caminhoQuestoes);
        
        if (!questoes) {
            return res.status(404).json({ erro: 'Questões não encontradas' });
        }
        
        const quantidade = Math.min(parseInt(req.params.quantidade), questoes.length);
        const aleatorias = questoes.sort(() => Math.random() - 0.5).slice(0, quantidade);
        
        res.json({
            sucesso: true,
            total: aleatorias.length,
            dados: aleatorias
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar questões aleatórias' });
    }
});

// ============================================
// ROTAS: PROGRESSO DO USUÁRIO
// ============================================

/**
 * GET /api/progresso/:userId - Retorna progresso do usuário
 */
app.get('/api/progresso/:userId', async (req, res) => {
    try {
        const caminhoProgresso = path.join(PROGRESSO_DIR, `${req.params.userId}.json`);
        const progresso = await lerJSON(caminhoProgresso);
        
        if (!progresso) {
            return res.json({
                sucesso: true,
                dados: {
                    userId: req.params.userId,
                    quizzes: [],
                    concursos: [],
                    questoes: [],
                    ultimaAtualizacao: new Date().toISOString()
                }
            });
        }
        
        res.json({
            sucesso: true,
            dados: progresso
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar progresso' });
    }
});

/**
 * POST /api/progresso/:userId - Salva progresso do usuário
 */
app.post('/api/progresso/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const caminhoProgresso = path.join(PROGRESSO_DIR, `${userId}.json`);
        
        // Recupera progresso existente
        let progresso = await lerJSON(caminhoProgresso);
        
        if (!progresso) {
            progresso = {
                userId,
                quizzes: [],
                concursos: [],
                questoes: [],
                ultimaAtualizacao: new Date().toISOString()
            };
        }
        
        // Mescla novos dados
        if (req.body.quiz) {
            progresso.quizzes.push({
                ...req.body.quiz,
                data: new Date().toISOString()
            });
        }
        
        if (req.body.concurso) {
            progresso.concursos.push({
                ...req.body.concurso,
                data: new Date().toISOString()
            });
        }
        
        progresso.ultimaAtualizacao = new Date().toISOString();
        
        // Salva progresso
        const sucesso = await escreverJSON(caminhoProgresso, progresso);
        
        if (sucesso) {
            res.json({
                sucesso: true,
                mensagem: 'Progresso salvo com sucesso',
                dados: progresso
            });
        } else {
            res.status(500).json({ erro: 'Erro ao salvar progresso' });
        }
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao processar progresso' });
    }
});

// ============================================
// ROTAS: USUÁRIOS
// ============================================

/**
 * GET /api/usuarios/:userId - Retorna dados do usuário
 */
app.get('/api/usuarios/:userId', async (req, res) => {
    try {
        const caminhoUsuario = path.join(USUARIOS_DIR, `${req.params.userId}.json`);
        const usuario = await lerJSON(caminhoUsuario);
        
        if (!usuario) {
            return res.json({
                sucesso: true,
                dados: {
                    userId: req.params.userId,
                    criado: new Date().toISOString(),
                    preferencias: {},
                    estatisticas: {
                        quizzesRealizados: 0,
                        acertos: 0,
                        erros: 0,
                        percentualAcerto: 0
                    }
                }
            });
        }
        
        res.json({
            sucesso: true,
            dados: usuario
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }
});

/**
 * POST /api/usuarios/:userId - Cria/atualiza usuário
 */
app.post('/api/usuarios/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const caminhoUsuario = path.join(USUARIOS_DIR, `${userId}.json`);
        
        let usuario = await lerJSON(caminhoUsuario);
        
        if (!usuario) {
            usuario = {
                userId,
                criado: new Date().toISOString(),
                preferencias: {},
                estatisticas: {
                    quizzesRealizados: 0,
                    acertos: 0,
                    erros: 0,
                    percentualAcerto: 0
                }
            };
        }
        
        // Mescla dados
        if (req.body.preferencias) {
            usuario.preferencias = { ...usuario.preferencias, ...req.body.preferencias };
        }
        
        if (req.body.estatisticas) {
            usuario.estatisticas = { ...usuario.estatisticas, ...req.body.estatisticas };
        }
        
        usuario.ultimaAtualizacao = new Date().toISOString();
        
        const sucesso = await escreverJSON(caminhoUsuario, usuario);
        
        if (sucesso) {
            res.json({
                sucesso: true,
                mensagem: 'Usuário atualizado com sucesso',
                dados: usuario
            });
        } else {
            res.status(500).json({ erro: 'Erro ao salvar usuário' });
        }
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao processar usuário' });
    }
});

// ============================================
// ROTAS: SINCRONIZAÇÃO
// ============================================

/**
 * POST /api/sincronizar - Sincroniza dados do localStorage com servidor
 */
app.post('/api/sincronizar', async (req, res) => {
    try {
        const userId = obterOuCriarUserId(req);
        const { dados } = req.body;
        
        // Salva progresso
        if (dados.progresso) {
            await app.post(`/api/progresso/${userId}`, { body: dados.progresso });
        }
        
        // Salva preferências
        if (dados.preferencias) {
            await app.post(`/api/usuarios/${userId}`, { body: { preferencias: dados.preferencias } });
        }
        
        res.json({
            sucesso: true,
            mensagem: 'Sincronização concluída',
            userId
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao sincronizar' });
    }
});

// ============================================
// ROTAS: SAÚDE
// ============================================

/**
 * GET /api/saude - Verifica saúde da API
 */
app.get('/api/saude', (req, res) => {
    res.json({
        sucesso: true,
        status: 'API funcionando',
        timestamp: new Date().toISOString(),
        versao: '1.0.0'
    });
});

/**
 * GET / - Página inicial
 */
app.get('/', (req, res) => {
    res.json({
        nome: 'Simulados de Enfermagem - API',
        versao: '1.0.0',
        endpoints: {
            saude: 'GET /api/saude',
            provas: 'GET /api/provas',
            concursos: 'GET /api/concursos',
            questoes: 'GET /api/questoes',
            progresso: 'GET /api/progresso/:userId',
            usuarios: 'GET /api/usuarios/:userId'
        }
    });
});

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicia o servidor
 */
async function iniciar() {
    await inicializarDiretorio();
    
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════╗
║  🚀 Simulados de Enfermagem - API                      ║
║  Servidor rodando em: http://localhost:${PORT}         ║
║  Banco de dados: ${DATABASE_DIR}                       ║
╚════════════════════════════════════════════════════════╝
        `);
    });
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não capturado:', err);
});

// Inicia servidor
iniciar();

module.exports = app;
