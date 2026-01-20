/**
 * SyncManager.js - Gerenciador de Sincronização
 * Sincroniza dados entre localStorage e API
 * 
 * Funcionalidades:
 * - Sincronização automática
 * - Fallback offline
 * - Merge de dados
 * - Histórico de sincronização
 */

const SyncManager = {
    // Configurações
    API_BASE_URL: 'http://localhost:3000/api',
    SYNC_INTERVAL: 30000, // 30 segundos
    MAX_RETRIES: 3,
    TIMEOUT: 5000,

    // Estado
    userId: null,
    isOnline: navigator.onLine,
    isSyncing: false,
    syncQueue: [],

    /**
     * Inicializa o gerenciador de sincronização
     */
    async init() {
        console.log('🔄 Inicializando SyncManager...');

        // Gera ou recupera userId
        this.userId = this.obterOuCriarUserId();
        console.log(`👤 User ID: ${this.userId}`);

        // Monitora conexão
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Sincroniza periodicamente
        setInterval(() => this.sincronizarAutomatico(), this.SYNC_INTERVAL);

        // Sincroniza ao carregar página
        await this.sincronizarDados();

        console.log('✅ SyncManager inicializado');
    },

    /**
     * Gera ou recupera UUID do usuário
     */
    obterOuCriarUserId() {
        let userId = localStorage.getItem('user_id');
        
        if (!userId) {
            userId = this.gerarUUID();
            localStorage.setItem('user_id', userId);
        }
        
        return userId;
    },

    /**
     * Gera UUID v4
     */
    gerarUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Obtém URL da API
     */
    obterURLAPI(endpoint) {
        return `${this.API_BASE_URL}${endpoint}`;
    },

    /**
     * Faz requisição com retry
     */
    async fazerRequisicao(url, opcoes = {}, tentativa = 1) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.TIMEOUT);

            const response = await fetch(url, {
                ...opcoes,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': this.userId,
                    ...opcoes.headers
                }
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (erro) {
            console.warn(`❌ Erro na requisição (tentativa ${tentativa}):`, erro.message);

            if (tentativa < this.MAX_RETRIES) {
                await this.aguardar(1000 * tentativa);
                return this.fazerRequisicao(url, opcoes, tentativa + 1);
            }

            throw erro;
        }
    },

    /**
     * Aguarda tempo especificado
     */
    aguardar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Sincroniza dados do servidor para localStorage
     */
    async sincronizarDoServidor() {
        if (!this.isOnline) {
            console.log('📴 Offline - pulando sincronização do servidor');
            return;
        }

        try {
            console.log('📥 Sincronizando dados do servidor...');

            // Baixa provas
            const provas = await this.fazerRequisicao(this.obterURLAPI('/provas'));
            if (provas.sucesso) {
                localStorage.setItem('admin_provas', JSON.stringify(provas.dados));
                console.log(`✅ ${provas.total} provas sincronizadas`);
            }

            // Baixa concursos
            const concursos = await this.fazerRequisicao(this.obterURLAPI('/concursos'));
            if (concursos.sucesso) {
                localStorage.setItem('admin_concursos', JSON.stringify(concursos.dados));
                console.log(`✅ ${concursos.total} concursos sincronizados`);
            }

            // Baixa questões
            const questoes = await this.fazerRequisicao(this.obterURLAPI('/questoes'));
            if (questoes.sucesso) {
                localStorage.setItem('admin_questoes', JSON.stringify(questoes.dados));
                console.log(`✅ ${questoes.total} questões sincronizadas`);
            }

            // Baixa progresso do usuário
            const progresso = await this.fazerRequisicao(
                this.obterURLAPI(`/progresso/${this.userId}`)
            );
            if (progresso.sucesso) {
                localStorage.setItem('user_progresso', JSON.stringify(progresso.dados));
                console.log('✅ Progresso sincronizado');
            }

            // Baixa dados do usuário
            const usuario = await this.fazerRequisicao(
                this.obterURLAPI(`/usuarios/${this.userId}`)
            );
            if (usuario.sucesso) {
                localStorage.setItem('user_dados', JSON.stringify(usuario.dados));
                console.log('✅ Dados do usuário sincronizados');
            }

            this.registrarSincronizacao('download', true);
        } catch (erro) {
            console.error('❌ Erro ao sincronizar do servidor:', erro);
            this.registrarSincronizacao('download', false);
        }
    },

    /**
     * Sincroniza dados do localStorage para servidor
     */
    async sincronizarParaServidor() {
        if (!this.isOnline) {
            console.log('📴 Offline - adicionando à fila de sincronização');
            this.adicionarAFila();
            return;
        }

        try {
            console.log('📤 Sincronizando dados para servidor...');

            // Envia progresso
            const progresso = JSON.parse(localStorage.getItem('user_progresso') || '{}');
            if (Object.keys(progresso).length > 0) {
                await this.fazerRequisicao(
                    this.obterURLAPI(`/progresso/${this.userId}`),
                    {
                        method: 'POST',
                        body: JSON.stringify(progresso)
                    }
                );
                console.log('✅ Progresso enviado');
            }

            // Envia preferências
            const preferencias = JSON.parse(localStorage.getItem('user_preferences') || '{}');
            if (Object.keys(preferencias).length > 0) {
                await this.fazerRequisicao(
                    this.obterURLAPI(`/usuarios/${this.userId}`),
                    {
                        method: 'POST',
                        body: JSON.stringify({ preferencias })
                    }
                );
                console.log('✅ Preferências enviadas');
            }

            this.registrarSincronizacao('upload', true);
        } catch (erro) {
            console.error('❌ Erro ao sincronizar para servidor:', erro);
            this.registrarSincronizacao('upload', false);
        }
    },

    /**
     * Sincronização automática
     */
    async sincronizarAutomatico() {
        if (this.isSyncing) return;

        this.isSyncing = true;
        try {
            await this.sincronizarDoServidor();
            await this.sincronizarParaServidor();
        } finally {
            this.isSyncing = false;
        }
    },

    /**
     * Sincroniza dados completos
     */
    async sincronizarDados() {
        await this.sincronizarDoServidor();
        await this.sincronizarParaServidor();
    },

    /**
     * Adiciona à fila de sincronização
     */
    adicionarAFila() {
        this.syncQueue.push({
            timestamp: new Date().toISOString(),
            dados: {
                progresso: JSON.parse(localStorage.getItem('user_progresso') || '{}'),
                preferencias: JSON.parse(localStorage.getItem('user_preferences') || '{}')
            }
        });

        localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    },

    /**
     * Processa fila de sincronização
     */
    async processarFila() {
        if (this.syncQueue.length === 0) return;

        console.log(`🔄 Processando fila de sincronização (${this.syncQueue.length} itens)...`);

        for (const item of this.syncQueue) {
            try {
                await this.sincronizarParaServidor();
                this.syncQueue.shift();
            } catch (erro) {
                console.error('Erro ao processar fila:', erro);
                break;
            }
        }

        localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    },

    /**
     * Manipulador: Voltou online
     */
    async handleOnline() {
        console.log('🟢 Voltou online');
        this.isOnline = true;
        await this.processarFila();
        await this.sincronizarDados();
    },

    /**
     * Manipulador: Ficou offline
     */
    handleOffline() {
        console.log('🔴 Ficou offline');
        this.isOnline = false;
    },

    /**
     * Registra sincronização no histórico
     */
    registrarSincronizacao(tipo, sucesso) {
        const historico = JSON.parse(localStorage.getItem('sync_historico') || '[]');
        
        historico.push({
            tipo,
            sucesso,
            timestamp: new Date().toISOString()
        });

        // Mantém apenas últimas 100 sincronizações
        if (historico.length > 100) {
            historico.shift();
        }

        localStorage.setItem('sync_historico', JSON.stringify(historico));
    },

    /**
     * Obtém status de sincronização
     */
    obterStatus() {
        return {
            userId: this.userId,
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
            filaSize: this.syncQueue.length,
            ultimaSincronizacao: localStorage.getItem('ultima_sincronizacao')
        };
    },

    /**
     * Força sincronização manual
     */
    async sincronizarManual() {
        console.log('🔄 Sincronização manual iniciada...');
        await this.sincronizarDados();
        console.log('✅ Sincronização manual concluída');
    },

    /**
     * Limpa dados locais
     */
    limparDados() {
        const chaves = [
            'admin_provas',
            'admin_concursos',
            'admin_questoes',
            'user_progresso',
            'user_dados',
            'user_preferences',
            'sync_queue',
            'sync_historico'
        ];

        chaves.forEach(chave => localStorage.removeItem(chave));
        console.log('✅ Dados locais limpos');
    }
};

// Exportar para uso global
window.SyncManager = SyncManager;

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SyncManager.init());
} else {
    SyncManager.init();
}
