/**
 * Data App - Gerenciamento de Dados e Sincronização
 * Gerencia a sincronização de conteúdo via GitHub e importação/exportação de dados
 */

const DataApp = {
    state: {
        currentTab: 'sync',
        isInitialized: false
    },

    /**
     * Inicializa o aplicativo de dados
     */
    async init() {
        try {
            // Inicializar serviço de sincronização
            await ContentSync.init();

            // Carregar configurações
            this.loadSettings();

            // Atualizar status
            this.updateStatusDisplay();

            // Carregar estatísticas
            await this.loadStats();

            // Configurar listeners de eventos
            this.setupEventListeners();

            this.state.isInitialized = true;
            console.log('DataApp inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar DataApp:', error);
        }
    },

    /**
     * Configura listeners de eventos globais
     */
    setupEventListeners() {
        // Listener para atualizações disponíveis
        window.addEventListener('contentUpdateAvailable', (e) => {
            this.showUpdateNotification(e.detail);
        });

        // Listener para sincronização concluída
        window.addEventListener('contentSyncComplete', (e) => {
            this.updateStatusDisplay();
            this.loadStats();
            this.addToSyncHistory(e.detail);
        });

        // Listener para drag and drop
        const dropZone = document.getElementById('import-drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileImport({ files: files });
                }
            });
        }
    },

    /**
     * Alterna entre abas
     */
    switchTab(tabName) {
        this.state.currentTab = tabName;

        // Atualizar botões de aba
        document.querySelectorAll('.data-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.tab-btn').classList.add('active');

        // Atualizar conteúdo
        document.querySelectorAll('.data-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`data-${tabName}`).style.display = 'block';

        // Carregar dados específicos da aba
        if (tabName === 'status') {
            this.loadStats();
        }
    },

    /**
     * Carrega configurações do usuário
     */
    loadSettings() {
        // Carregar estado do auto-sync
        const autoSyncToggle = document.getElementById('setting-autosync');
        if (autoSyncToggle) {
            autoSyncToggle.checked = ContentSync.config.enableAutoSync;
        }

        // Carregar URL do repositório
        const repoUrlInput = document.getElementById('repo-url');
        if (repoUrlInput) {
            repoUrlInput.value = ContentSync.config.repositoryUrl;
        }
    },

    /**
     * Atualiza o display de status
     */
    updateStatusDisplay() {
        const status = ContentSync.getStatus();

        // Versão atual
        const versionEl = document.getElementById('data-current-version');
        if (versionEl) {
            versionEl.textContent = status.currentVersion || '1.0.0';
        }

        // Última verificação
        const lastCheckEl = document.getElementById('data-last-check');
        if (lastCheckEl) {
            lastCheckEl.textContent = status.lastCheck
                ? new Date(status.lastCheck).toLocaleString('pt-BR')
                : 'Nunca';
        }

        // Última sincronização
        const lastSyncEl = document.getElementById('data-last-sync');
        if (lastSyncEl) {
            lastSyncEl.textContent = status.lastSync
                ? new Date(status.lastSync).toLocaleString('pt-BR')
                : 'Nunca';
        }

        // Habilitar botão de sync se houver atualização
        const syncBtn = document.getElementById('btn-sync-all');
        if (syncBtn) {
            syncBtn.disabled = !status.availableUpdate;
        }
    },

    /**
     * Verifica atualizações
     */
    async checkForUpdates() {
        const btn = document.getElementById('btn-check-updates');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';

        const update = await ContentSync.checkForUpdates();

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-search"></i> Verificar Atualizações';

        if (update) {
            this.showUpdateNotification(update);
        } else {
            Toast.show({
                type: 'info',
                title: 'Sem Atualizações',
                message: 'Você já tem a versão mais recente',
                duration: 3000
            });
        }

        this.updateStatusDisplay();
    },

    /**
     * Exibe notificação de atualização disponível
     */
    showUpdateNotification(update) {
        const notification = document.getElementById('update-notification');
        if (notification) {
            document.getElementById('update-version').textContent = update.version;
            document.getElementById('update-changes').textContent =
                `${update.changes.length} alterações disponíveis`;
            notification.style.display = 'flex';

            const syncBtn = document.getElementById('btn-sync-all');
            if (syncBtn) {
                syncBtn.disabled = false;
            }
        }
    },

    /**
     * Sincroniza todos os dados
     */
    async syncAll() {
        const btn = document.getElementById('btn-sync-all');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';

        Toast.show({
            type: 'info',
            title: 'Sincronização',
            message: 'Baixando atualizações...',
            duration: 5000
        });

        const result = await ContentSync.syncAll();

        if (result.success) {
            // Esconder notificação de atualização
            const notification = document.getElementById('update-notification');
            if (notification) {
                notification.style.display = 'none';
            }

            Toast.show({
                type: 'success',
                title: 'Sincronização Concluída',
                message: `${result.synced.join(', ')} atualizados com sucesso`,
                duration: 5000
            });
        } else {
            Toast.show({
                type: 'error',
                title: 'Erro na Sincronização',
                message: result.errors.map(e => e.error).join(', '),
                duration: 5000
            });
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-download"></i> Sincronizar Tudo';

        this.updateStatusDisplay();
        await this.loadStats();
    },

    /**
     * Alterna sincronização automática
     */
    toggleAutoSync(toggle) {
        if (toggle.checked) {
            ContentSync.config.enableAutoSync = true;
            ContentSync.startAutoCheck();
        } else {
            ContentSync.config.enableAutoSync = false;
            ContentSync.stopAutoCheck();
        }
        ContentSync.saveUserConfig();
    },

    /**
     * Atualiza URL do repositório
     */
    updateRepoUrl(url) {
        const success = ContentSync.setRepositoryUrl(url);
        if (success) {
            Toast.show({
                type: 'success',
                title: 'Repositório Atualizado',
                message: 'URL do repositório atualizada com sucesso',
                duration: 3000
            });
        } else {
            Toast.show({
                type: 'error',
                title: 'URL Inválida',
                message: 'Formato esperado: https://github.com/usuario/repositorio',
                duration: 3000
            });
        }
    },

    /**
     * Carrega estatísticas dos dados
     */
    async loadStats() {
        try {
            const [
                questionsCount,
                contestsCount,
                quizzesCount,
                flashcardsCount,
                libraryCount
            ] = await Promise.all([
                DatabaseService.count('questions'),
                DatabaseService.count('public_contests'),
                DatabaseService.count('quizzes'),
                DatabaseService.count('flashcards'),
                DatabaseService.count('library_resources')
            ]);

            // Atualizar elementos
            const setCount = (id, count) => {
                const el = document.getElementById(id);
                if (el) el.textContent = count;
            };

            setCount('stat-questions-count', questionsCount);
            setCount('stat-contests-count', contestsCount);
            setCount('stat-quizzes-count', quizzesCount);
            setCount('stat-flashcards-count', flashcardsCount);
            setCount('stat-library-count', libraryCount);

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    },

    /**
     * Manipula importação de arquivo
     */
    async handleFileImport(input) {
        const file = input.files[0];
        if (!file) return;

        Toast.show({
            type: 'info',
            title: 'Importando',
            message: 'Processando arquivo...',
            duration: 3000
        });

        try {
            const result = await ContentSync.importDataFile(file);

            if (result.success) {
                Toast.show({
                    type: 'success',
                    title: 'Importação Concluída',
                    message: result.message,
                    duration: 5000
                });
                await this.loadStats();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                title: 'Erro na Importação',
                message: error.message,
                duration: 5000
            });
        }

        // Limpar input
        input.value = '';
    },

    /**
     * Exporta dados locais
     */
    async exportData() {
        Toast.show({
            type: 'info',
            title: 'Exportando',
            message: 'Preparando dados para exportação...',
            duration: 3000
        });

        try {
            const data = await ContentSync.exportLocalData();

            // Criar blob e fazer download
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `enfermagem-concurseira-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            Toast.show({
                type: 'success',
                title: 'Exportação Concluída',
                message: 'Arquivo baixado com sucesso',
                duration: 5000
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                title: 'Erro na Exportação',
                message: error.message,
                duration: 5000
            });
        }
    },

    /**
     * Adiciona entrada ao histórico de sincronização
     */
    addToSyncHistory(result) {
        const historyEl = document.getElementById('sync-history');
        if (!historyEl) return;

        // Remover mensagem de estado vazio
        const emptyState = historyEl.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const entry = document.createElement('div');
        entry.className = 'sync-history-entry';
        entry.innerHTML = `
            <div class="history-icon success">
                <i class="fas fa-check"></i>
            </div>
            <div class="history-info">
                <strong>Sincronização concluída</strong>
                <span>${new Date().toLocaleString('pt-BR')}</span>
                <small>${result.synced.join(', ')} sincronizados</small>
            </div>
        `;

        historyEl.insertBefore(entry, historyEl.firstChild);

        // Manter apenas as últimas 10 entradas
        while (historyEl.children.length > 10) {
            historyEl.removeChild(historyEl.lastChild);
        }
    },

    /**
     * Limpa todos os dados locais
     */
    async clearAllData() {
        const confirmed = await Modal.confirm({
            title: 'Limpar Todos os Dados',
            message: 'Tem certeza que deseja remover todos os dados locais? Esta ação não pode ser desfeita e você precisará sincronizar o conteúdo novamente.',
            confirmText: 'Limpar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (confirmed) {
            Toast.show({
                type: 'info',
                title: 'Limpando',
                message: 'Removendo dados locais...',
                duration: 3000
            });

            try {
                await DatabaseService.clearAll();

                Toast.show({
                    type: 'success',
                    title: 'Dados Limpos',
                    message: 'Todos os dados locais foram removidos',
                    duration: 5000
                });

                // Recarregar página para reiniciar
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } catch (error) {
                Toast.show({
                    type: 'error',
                    title: 'Erro',
                    message: 'Erro ao limpar dados: ' + error.message,
                    duration: 5000
                });
            }
        }
    }
};

// Exportar para uso global
window.DataApp = DataApp;
