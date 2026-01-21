/**
 * Content Sync Service - Sincronização de conteúdo via GitHub
 * Estratégias implementadas:
 * 1. GitHub Pages com arquivos JSON (atualizações frequentes)
 * 2. GitHub Releases para pacotes de dados (atualizações mensais)
 */

const ContentSync = {
    // Configuração do repositório
    config: {
        baseUrl: 'https://seu-usuario.github.io/enfermagem-concurseira',
        repositoryUrl: 'https://github.com/seu-usuario/enfermagem-concurseira',
        releasesUrl: 'https://api.github.com/repos/seu-usuario/enfermagem-concurseira/releases',
        dataPath: '/data',
        currentVersion: '1.0.0',
        autoCheckInterval: 3600000, // 1 hora
        enableAutoSync: true
    },

    // Estado do sync
    state: {
        isChecking: false,
        isSyncing: false,
        lastCheck: null,
        lastSync: null,
        availableUpdate: null,
        currentDataVersion: null
    },

    /**
     * Inicializa o serviço de sincronização
     */
    async init() {
        try {
            // Carregar configuração do usuário
            await this.loadUserConfig();

            // Carregar versão local dos dados
            await this.loadLocalVersion();

            // Verificar atualizações automaticamente se habilitado
            if (this.config.enableAutoSync) {
                this.startAutoCheck();
            }

            console.log('ContentSync inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao inicializar ContentSync:', error);
            return false;
        }
    },

    /**
     * Carrega configuração do usuário do localStorage
     */
    async loadUserConfig() {
        const userConfig = localStorage.getItem('contentSync_config');
        if (userConfig) {
            const parsed = JSON.parse(userConfig);
            this.config = { ...this.config, ...parsed };
        }

        // Armazenar configuração atual
        localStorage.setItem('contentSync_config', JSON.stringify(this.config));
    },

    /**
     * Carrega versão local dos dados do IndexedDB
     */
    async loadLocalVersion() {
        try {
            const metadata = await db.metadata?.toArray();
            if (metadata && metadata.length > 0) {
                this.state.currentDataVersion = metadata[0].version;
                this.state.lastSync = metadata[0].last_updated;
            } else {
                // Verificar se há dados locais
                const questionCount = await DatabaseService.count('questions');
                if (questionCount > 0) {
                    this.state.currentDataVersion = this.config.currentVersion;
                }
            }
        } catch (error) {
            console.log('Sem dados locais carregados');
        }
    },

    /**
     * Inicia verificação automática de atualizações
     */
    startAutoCheck() {
        setInterval(async () => {
            await this.checkForUpdates();
        }, this.config.autoCheckInterval);

        // Verificar na primeira carga (após 5 segundos)
        setTimeout(async () => {
            await this.checkForUpdates();
        }, 5000);
    },

    /**
     * Para verificação automática
     */
    stopAutoCheck() {
        this.config.enableAutoSync = false;
        this.saveUserConfig();
    },

    /**
     * Salva configuração do usuário
     */
    async saveUserConfig() {
        localStorage.setItem('contentSync_config', JSON.stringify(this.config));
    },

    /**
     * Verifica se há atualizações disponíveis (Estratégia 1)
     */
    async checkForUpdates() {
        if (this.state.isChecking) {
            return this.state.availableUpdate;
        }

        this.state.isChecking = true;

        try {
            // Buscar metadados do GitHub Pages
            const response = await fetch(`${this.config.baseUrl}/data/metadata.json`);
            if (!response.ok) {
                throw new Error('Erro ao buscar metadados');
            }

            const remoteMetadata = await response.json();
            this.state.lastCheck = new Date().toISOString();

            // Comparar versões
            const hasUpdate = this.compareVersions(
                remoteMetadata.version,
                this.state.currentDataVersion || '0.0.0'
            );

            if (hasUpdate) {
                this.state.availableUpdate = {
                    version: remoteMetadata.version,
                    last_updated: remoteMetadata.last_updated,
                    changes: remoteMetadata.changelog,
                    statistics: remoteMetadata.statistics
                };

                // Notificar usuário
                this.notifyUpdateAvailable();
            } else {
                this.state.availableUpdate = null;
            }

            return this.state.availableUpdate;
        } catch (error) {
            console.error('Erro ao verificar atualizações:', error);
            return null;
        } finally {
            this.state.isChecking = false;
        }
    },

    /**
     * Compara duas versões semânticas
     */
    compareVersions(remoteVersion, localVersion) {
        const remote = remoteVersion.split('.').map(Number);
        const local = localVersion.split('.').map(Number);

        for (let i = 0; i < Math.max(remote.length, local.length); i++) {
            const r = remote[i] || 0;
            const l = local[i] || 0;

            if (r > l) return true;
            if (r < l) return false;
        }

        return false;
    },

    /**
     * Sincroniza todo o conteúdo (Estratégia 1)
     */
    async syncAll() {
        if (this.state.isSyncing) {
            console.warn('Sincronização já em andamento');
            return { success: false, message: 'Sincronização em andamento' };
        }

        this.state.isSyncing = true;
        const results = {
            success: true,
            synced: [],
            errors: [],
            startTime: new Date()
        };

        try {
            // Buscar metadados primeiro
            const metadataResponse = await fetch(`${this.config.baseUrl}/data/metadata.json`);
            const metadata = await metadataResponse.json();

            // Sincronizar cada tipo de dados
            const syncPromises = [
                this.syncQuestions(),
                this.syncContests(),
                this.syncQuizzes(),
                this.syncFlashcards(),
                this.syncLibrary()
            ];

            const syncResults = await Promise.all(syncPromises);

            // Processar resultados
            syncResults.forEach(result => {
                if (result.success) {
                    results.synced.push(result.type);
                } else {
                    results.errors.push({ type: result.type, error: result.error });
                    results.success = false;
                }
            });

            // Salvar metadados da sincronização
            await this.saveSyncMetadata(metadata);

            this.state.lastSync = new Date().toISOString();
            this.state.currentDataVersion = metadata.version;
            this.state.availableUpdate = null;

            // Notificar sucesso
            this.notifySyncComplete(results);

            return results;
        } catch (error) {
            console.error('Erro durante sincronização:', error);
            results.success = false;
            results.errors.push({ type: 'general', error: error.message });
            return results;
        } finally {
            this.state.isSyncing = false;
        }
    },

    /**
     * Sincroniza questões
     */
    async syncQuestions() {
        try {
            const response = await fetch(`${this.config.baseUrl}/data/questions.json`);
            const data = await response.json();

            // Verificar quais questões são novas ou atualizadas
            const existingIds = await this.getExistingIds('questions');
            const newQuestions = data.questions.filter(q => !existingIds.includes(q.id));
            const updatedQuestions = data.questions.filter(q => existingIds.includes(q.id));

            // Inserir novas questões
            if (newQuestions.length > 0) {
                await DatabaseService.importData('questions', newQuestions);
            }

            // Atualizar questões existentes (preservando dados do usuário)
            for (const question of updatedQuestions) {
                const local = await DatabaseService.getQuestionById(question.id);
                if (local) {
                    // Preservar dados do usuário
                    await db.questions.update(question.id, {
                        ...question,
                        user_stats: local.user_stats,
                        user_notes: local.user_notes
                    });
                }
            }

            return { success: true, type: 'questions', count: newQuestions.length };
        } catch (error) {
            return { success: false, type: 'questions', error: error.message };
        }
    },

    /**
     * Sincroniza concursos
     */
    async syncContests() {
        try {
            const response = await fetch(`${this.config.baseUrl}/data/contests.json`);
            const data = await response.json();

            // Verificar concursos existentes
            const existingIds = await this.getExistingIds('public_contests');
            const newContests = data.contests.filter(c => !existingIds.includes(c.id));

            if (newContests.length > 0) {
                await DatabaseService.importData('public_contests', newContests);
            }

            return { success: true, type: 'contests', count: newContests.length };
        } catch (error) {
            return { success: false, type: 'contests', error: error.message };
        }
    },

    /**
     * Sincroniza quizzes
     */
    async syncQuizzes() {
        try {
            const response = await fetch(`${this.config.baseUrl}/data/quizzes.json`);
            const data = await response.json();

            // Verificar quizzes existentes
            const existingIds = await this.getExistingIds('quizzes');
            const newQuizzes = data.quizzes.filter(q => !existingIds.includes(q.id));

            if (newQuizzes.length > 0) {
                await DatabaseService.importData('quizzes', newQuizzes);
            }

            return { success: true, type: 'quizzes', count: newQuizzes.length };
        } catch (error) {
            return { success: false, type: 'quizzes', error: error.message };
        }
    },

    /**
     * Sincroniza flashcards
     */
    async syncFlashcards() {
        try {
            const response = await fetch(`${this.config.baseUrl}/data/flashcards.json`);
            const data = await response.json();

            // Sincronizar decks
            const deckExistingIds = await this.getExistingIds('flashcard_decks');
            const newDecks = data.decks.filter(d => !deckExistingIds.includes(d.id));

            if (newDecks.length > 0) {
                await DatabaseService.importData('flashcard_decks', newDecks);
            }

            // Sincronizar tarjetas
            const cardExistingIds = await this.getExistingIds('flashcards');
            const newCards = data.flashcards.filter(c => !cardExistingIds.includes(c.id));

            if (newCards.length > 0) {
                await DatabaseService.importData('flashcards', newCards);
            }

            return { success: true, type: 'flashcards', decks: newDecks.length, cards: newCards.length };
        } catch (error) {
            return { success: false, type: 'flashcards', error: error.message };
        }
    },

    /**
     * Sincroniza recursos da biblioteca
     */
    async syncLibrary() {
        try {
            const response = await fetch(`${this.config.baseUrl}/data/library.json`);
            const data = await response.json();

            // Verificar recursos existentes
            const existingIds = await this.getExistingIds('library_resources');
            const newResources = data.resources.filter(r => !existingIds.includes(r.id));

            if (newResources.length > 0) {
                await DatabaseService.importData('library_resources', newResources);
            }

            return { success: true, type: 'library', count: newResources.length };
        } catch (error) {
            return { success: false, type: 'library', error: error.message };
        }
    },

    /**
     * Obtém IDs existentes de uma tabela
     */
    async getExistingIds(tableName) {
        try {
            const data = await DatabaseService.exportData(tableName);
            return data.map(item => item.id);
        } catch (error) {
            console.error(`Erro ao obter IDs de ${tableName}:`, error);
            return [];
        }
    },

    /**
     * Salva metadados da sincronização
     */
    async saveSyncMetadata(remoteMetadata) {
        try {
            // Verificar se já existe metadata
            const existing = await db.metadata?.toArray();

            if (existing && existing.length > 0) {
                await db.metadata.update(existing[0].id, {
                    version: remoteMetadata.version,
                    last_updated: remoteMetadata.last_updated,
                    last_sync: new Date().toISOString(),
                    statistics: remoteMetadata.statistics
                });
            } else {
                await db.metadata?.add({
                    version: remoteMetadata.version,
                    last_updated: remoteMetadata.last_updated,
                    last_sync: new Date().toISOString(),
                    statistics: remoteMetadata.statistics
                });
            }
        } catch (error) {
            console.log('Tabela metadata não disponível');
        }
    },

    /**
     * Verifica atualizações do GitHub Releases (Estratégia 2)
     */
    async checkReleases() {
        try {
            const response = await fetch(this.config.releasesUrl);
            if (!response.ok) {
                throw new Error('Erro ao buscar releases');
            }

            const releases = await response.json();

            if (releases.length > 0) {
                const latestRelease = releases[0];

                const hasUpdate = this.compareVersions(
                    latestRelease.tag_name,
                    this.state.currentDataVersion || '0.0.0'
                );

                if (hasUpdate) {
                    return {
                        version: latestRelease.tag_name,
                        url: latestRelease.html_url,
                        body: latestRelease.body,
                        published_at: latestRelease.published_at,
                        assets: latestRelease.assets
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('Erro ao verificar releases:', error);
            return null;
        }
    },

    /**
     * Baixa e aplica release do GitHub (Estratégia 2)
     */
    async downloadAndApplyRelease(releaseInfo) {
        if (!releaseInfo.assets || releaseInfo.assets.length === 0) {
            return { success: false, message: 'Nenhum asset disponível na release' };
        }

        const dataAsset = releaseInfo.assets.find(a => a.name.includes('data-package'));

        if (!dataAsset) {
            return { success: false, message: 'Package de dados não encontrado' };
        }

        try {
            // Baixar o arquivo
            const response = await fetch(dataAsset.browser_download_url);
            const blob = await response.blob();

            // Extrair e processar
            const jsonData = await blob.text();
            const data = JSON.parse(jsonData);

            // Aplicar dados
            await this.applyDataPackage(data);

            return { success: true, version: releaseInfo.version };
        } catch (error) {
            console.error('Erro ao aplicar release:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Aplica pacote de dados de release
     */
    async applyDataPackage(data) {
        // Aplicar questões
        if (data.questions) {
            await DatabaseService.importData('questions', data.questions);
        }

        // Aplicar concursos
        if (data.contests) {
            await DatabaseService.importData('public_contests', data.contests);
        }

        // Aplicar quizzes
        if (data.quizzes) {
            await DatabaseService.importData('quizzes', data.quizzes);
        }

        // Aplicar flashcards
        if (data.flashcard_decks) {
            await DatabaseService.importData('flashcard_decks', data.flashcard_decks);
        }
        if (data.flashcards) {
            await DatabaseService.importData('flashcards', data.flashcards);
        }

        // Aplicar biblioteca
        if (data.resources) {
            await DatabaseService.importData('library_resources', data.resources);
        }

        // Atualizar metadados
        if (data.metadata) {
            await this.saveSyncMetadata(data.metadata);
            this.state.currentDataVersion = data.metadata.version;
        }
    },

    /**
     * Notifica usuário sobre atualização disponível
     */
    notifyUpdateAvailable() {
        // Emitir evento global
        window.dispatchEvent(new CustomEvent('contentUpdateAvailable', {
            detail: this.state.availableUpdate
        }));

        // Mostrar toast de notificação
        if (typeof Toast !== 'undefined') {
            Toast.show({
                type: 'info',
                title: 'Atualização Available',
                message: `Nova versão ${this.state.availableUpdate.version} disponível`,
                duration: 10000,
                action: {
                    text: 'Atualizar',
                    onClick: () => this.syncAll()
                }
            });
        }
    },

    /**
     * Notifica conclusão da sincronização
     */
    notifySyncComplete(results) {
        window.dispatchEvent(new CustomEvent('contentSyncComplete', {
            detail: results
        }));

        if (typeof Toast !== 'undefined') {
            Toast.show({
                type: 'success',
                title: 'Sincronização Concluída',
                message: `${results.synced.length} tipos de dados atualizados`,
                duration: 5000
            });
        }
    },

    /**
     * Exporta dados locais como JSON
     */
    async exportLocalData() {
        const exportData = {
            export_date: new Date().toISOString(),
            version: this.state.currentDataVersion,
            questions: await DatabaseService.exportData('questions'),
            contests: await DatabaseService.exportData('public_contests'),
            quizzes: await DatabaseService.exportData('quizzes'),
            flashcard_decks: await DatabaseService.exportData('flashcard_decks'),
            flashcards: await DatabaseService.exportData('flashcards'),
            library_resources: await DatabaseService.exportData('library_resources')
        };

        return exportData;
    },

    /**
     * Importa dados de arquivo JSON local
     */
    async importDataFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    if (data.questions) {
                        await DatabaseService.importData('questions', data.questions);
                    }
                    if (data.contests) {
                        await DatabaseService.importData('public_contests', data.contests);
                    }
                    if (data.quizzes) {
                        await DatabaseService.importData('quizzes', data.quizzes);
                    }
                    if (data.flashcard_decks) {
                        await DatabaseService.importData('flashcard_decks', data.flashcard_decks);
                    }
                    if (data.flashcards) {
                        await DatabaseService.importData('flashcards', data.flashcards);
                    }
                    if (data.resources) {
                        await DatabaseService.importData('library_resources', data.resources);
                    }

                    resolve({ success: true, message: 'Dados importados com sucesso' });
                } catch (error) {
                    reject({ success: false, message: 'Erro ao processar arquivo: ' + error.message });
                }
            };

            reader.onerror = () => {
                reject({ success: false, message: 'Erro ao ler arquivo' });
            };

            reader.readAsText(file);
        });
    },

    /**
     * Obtém status atual do sync
     */
    getStatus() {
        return {
            isChecking: this.state.isChecking,
            isSyncing: this.state.isSyncing,
            lastCheck: this.state.lastCheck,
            lastSync: this.state.lastSync,
            currentVersion: this.state.currentDataVersion,
            availableUpdate: this.state.availableUpdate,
            autoSyncEnabled: this.config.enableAutoSync
        };
    },

    /**
     * Configura URL do repositório
     */
    setRepositoryUrl(url) {
        // Extrair usuário e repo da URL
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
            this.config.repositoryUrl = url;
            this.config.baseUrl = `https://${match[1]}.github.io/${match[2]}`;
            this.config.releasesUrl = `https://api.github.com/repos/${match[1]}/${match[2]}/releases`;
            this.saveUserConfig();
            return true;
        }
        return false;
    }
};

// Exportar para uso global
window.ContentSync = ContentSync;
