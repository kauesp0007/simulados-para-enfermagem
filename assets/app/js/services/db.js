/**
 * Database Service - IndexedDB Setup using Dexie.js
 * Serviço de banco de dados local para persistência de dados
 * Suporta todos os recursos: Flashcards, Mind Maps, Pomodoro, Quizzes, Concursos, etc.
 */

const db = new Dexie('EnfermagemConcurseiraDB');

// Configuração do schema do banco de dados
db.version(1).stores({
    // Usuários e autenticação
    users: '++id, email, full_name, role, created_at',
    sessions: '++id, user_id, token, created_at, expires_at',

    // === QUESTÕES ===
    // Questões do banco oficial
    questions: 'id, topic, exam_type, institution, exam_board, year, difficulty, *quiz_id, *tags',
    questions_topics: 'topic, count',

    // Questões criadas pelo usuário
    user_questions: 'id, user_email, topic, is_public, admin_status, created_at',

    // === QUIZZES E PROVAS ===
    quizzes: 'id, title, category, type, exam_type, institution, year, created_at',
    quiz_attempts: '++id, user_email, quiz_id, quiz_title, completed_at',
    quiz_answers: '++id, attempt_id, question_id, selected_answer, is_correct',

    // === FLASHCARDS ===
    flashcard_decks: '++id, user_email, title, description, category, card_count, created_at',
    flashcards: '++id, deck_id, user_email, front, back, topic, mastery_level, next_review, review_count, created_at',

    // === MIND MAPS ===
    mind_maps: '++id, user_email, title, topic, nodes_count, created_at, updated_at',
    mind_map_nodes: '++id, map_id, node_id, content, x, y, parent_node_id, level',
    mind_map_connections: '++id, map_id, from_node, to_node',

    // === POMODORO ===
    pomodoro_sessions: '++id, user_email, contest_id, session_type, duration, completed_at, day_date',
    pomodoro_stats: '++id, user_email, day_date, total_focus_time, total_breaks, sessions_completed',

    // === CONCURSOS ===
    contests: 'id, user_email, name, exam_date, status, current_phase, created_at',
    study_topics: '++id, contest_id, user_email, topic_name, mastery_level, progress_level, last_studied',
    study_sessions: '++id, user_email, contest_id, session_type, started_at, duration',

    // === REPETIÇÃO ESPAÇADA ===
    spaced_repetition: '++id, user_email, question_id, next_review_date, easiness_factor, interval, repetitions',
    flashcards_srs: '++id, user_email, flashcard_id, next_review_date, easiness_factor, interval, repetitions',

    // === PERFORMANCE E MÉTRICAS ===
    user_performance: '++id, user_email, topic, last_study',
    daily_stats: '++id, user_email, date, questions_answered, correct_answers, study_time_minutes, quizzes_completed',

    // === CONQUISTAS ===
    achievements: '++id, user_email, achievement_type, unlocked_at',
    achievement_progress: '++id, user_email, achievement_type, current_value, target_value',

    // === METAS DE ESTUDO ===
    study_goals: '++id, user_email, goal_type, period_start, period_end, target_value, current_value, completed',

    // === BIBLIOTECA ===
    library_resources: 'id, category, type, *tags, created_at',
    library_favorites: '++id, user_email, resource_id, created_at',

    // === CONCURSOS PÚBLICOS ===
    public_contests: 'id, name, institution, state, exam_date, status, source',

    // === FAVORITOS E NOTAS ===
    favorite_questions: '++id, user_email, question_id, topic, created_at',
    question_notes: '++id, user_email, question_id, note, created_at, updated_at',

    // === NOTAS DE ESTUDO ===
    study_notes: '++id, user_email, title, topic, content, created_at, updated_at',
    note_links: '++id, note_id, related_question_id, related_topic',

    // === NOTIFICAÇÕES ===
    notifications: '++id, user_email, read, type, created_at',

    // === CONFIGURAÇÕES ===
    preferences: 'user_email, *keys',
    user_settings: 'user_email, theme, language, notifications_enabled, pomodoro_duration, break_duration',

    // === DADOS DE EXPORTAÇÃO/IMPORTAÇÃO ===
    data_exports: '++id, type, created_at, file_name',
    data_imports: '++id, type, created_at, records_imported'
});

// Adicionar métodos utilitários ao banco
db.on('populate', async () => {
    console.log('Database populated - ready for initial data import');
});

// Métodos de conveniência para o banco de dados
const DatabaseService = {
    /**
     * Inicializa o banco de dados
     */
    async init() {
        try {
            await db.open();
            console.log('Database initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing database:', error);
            return false;
        }
    },

    /**
     * Limpa todos os dados do banco
     */
    async clearAll() {
        try {
            await db.transaction('rw', db.tables, async () => {
                for (const table of db.tables) {
                    await table.clear();
                }
            });
            console.log('All data cleared');
            return true;
        } catch (error) {
            console.error('Error clearing database:', error);
            return false;
        }
    },

    /**
     * Verifica se é a primeira execução (banco vazio)
     */
    async isFirstRun() {
        const count = await db.questions.count();
        return count === 0;
    },

    /**
     * Importa dados de um array para uma tabela
     */
    async importData(tableName, dataArray) {
        try {
            await db.transaction('rw', db[tableName], async () => {
                await db[tableName].bulkPut(dataArray);
            });
            console.log(`Imported ${dataArray.length} records to ${tableName}`);
            return true;
        } catch (error) {
            console.error(`Error importing to ${tableName}:`, error);
            return false;
        }
    },

    /**
     * Exporta todos os dados de uma tabela
     */
    async exportData(tableName) {
        try {
            return await db[tableName].toArray();
        } catch (error) {
            console.error(`Error exporting from ${tableName}:`, error);
            return [];
        }
    },

    /**
     * Conta registros em uma tabela
     */
    async count(tableName) {
        try {
            return await db[tableName].count();
        } catch (error) {
            console.error(`Error counting ${tableName}:`, error);
            return 0;
        }
    },

    // ==================== QUESTÕES ====================

    /**
     * Busca questões com filtros
     */
    async getQuestions(filters = {}) {
        let questions = await db.questions.toArray();

        if (filters.topic) {
            questions = questions.filter(q => q.topic === filters.topic);
        }
        if (filters.exam_type) {
            questions = questions.filter(q => q.exam_type === filters.exam_type);
        }
        if (filters.institution) {
            questions = questions.filter(q => q.institution === filters.institution);
        }
        if (filters.difficulty) {
            questions = questions.filter(q => q.difficulty === filters.difficulty);
        }

        return questions;
    },

    /**
     * Busca questão por ID
     */
    async getQuestionById(id) {
        return await db.questions.get(id);
    },

    /**
     * Busca questões aleatórias para quiz
     */
    async getRandomQuestions(count, filters = {}) {
        let questions = await this.getQuestions(filters);
        return Helpers.shuffleArray(questions).slice(0, count);
    },

    // ==================== QUIZZES ====================

    /**
     * Salva resultado do quiz
     */
    async saveQuizAttempt(attemptData) {
        const id = await db.quiz_attempts.add({
            ...attemptData,
            completed_at: new Date().toISOString()
        });
        return id;
    },

    /**
     * Busca histórico de tentativas
     */
    async getQuizAttempts(userEmail, limit = 10) {
        return await db.quiz_attempts
            .where('user_email')
            .equals(userEmail)
            .reverse()
            .limit(limit)
            .toArray();
    },

    /**
     * Salva resposta de quiz individual
     */
    async saveQuizAnswer(answerData) {
        return await db.quiz_answers.add(answerData);
    },

    /**
     * Busca respostas de uma tentativa
     */
    async getQuizAnswers(attemptId) {
        return await db.quiz_answers
            .where('attempt_id')
            .equals(attemptId)
            .toArray();
    },

    // ==================== FLASHCARDS ====================

    /**
     * Cria um novo deck de flashcards
     */
    async createFlashcardDeck(deckData) {
        const id = await db.flashcard_decks.add({
            ...deckData,
            card_count: 0,
            created_at: new Date().toISOString()
        });
        return id;
    },

    /**
     * Busca decks do usuário
     */
    async getFlashcardDecks(userEmail) {
        return await db.flashcard_decks
            .where('user_email')
            .equals(userEmail)
            .reverse()
            .toArray();
    },

    /**
     * Busca deck por ID
     */
    async getFlashcardDeck(deckId) {
        return await db.flashcard_decks.get(deckId);
    },

    /**
     * Adiciona flashcard a um deck
     */
    async addFlashcard(flashcardData) {
        const id = await db.flashcards.add({
            ...flashcardData,
            mastery_level: 0,
            review_count: 0,
            created_at: new Date().toISOString()
        });

        // Atualiza contagem de cards no deck
        const deck = await this.getFlashcardDeck(flashcardData.deck_id);
        if (deck) {
            await db.flashcard_decks.update(flashcardData.deck_id, {
                card_count: deck.card_count + 1
            });
        }

        return id;
    },

    /**
     * Busca flashcards de um deck
     */
    async getFlashcardsByDeck(deckId) {
        return await db.flashcards
            .where('deck_id')
            .equals(deckId)
            .toArray();
    },

    /**
     * Busca flashcards para revisão (repetição espaçada)
     */
    async getFlashcardsForReview(userEmail) {
        const today = new Date().toISOString().split('T')[0];
        return await db.flashcards
            .where('user_email')
            .equals(userEmail)
            .and(card => card.next_review && card.next_review <= today)
            .toArray();
    },

    /**
     * Atualiza progresso do flashcard (SRS)
     */
    async updateFlashcardProgress(cardId, quality) {
        // Algoritmo SM-2 simplificado
        const card = await db.flashcards.get(cardId);
        if (!card) return;

        let { easiness_factor = 2.5, interval = 0, repetitions = 0 } = card;

        if (quality >= 3) {
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easiness_factor);
            }
            repetitions += 1;
        } else {
            repetitions = 0;
            interval = 1;
        }

        easiness_factor = Math.max(1.3, easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        await db.flashcards.update(cardId, {
            easiness_factor,
            interval,
            repetitions,
            next_review: nextReview.toISOString().split('T')[0],
            mastery_level: Math.min(100, (repetitions / 5) * 100),
            review_count: card.review_count + 1
        });
    },

    // ==================== MIND MAPS ====================

    /**
     * Cria um novo mind map
     */
    async createMindMap(mapData) {
        const id = await db.mind_maps.add({
            ...mapData,
            nodes_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        // Adiciona nó central
        await db.mind_map_nodes.add({
            map_id: id,
            node_id: 'central',
            content: mapData.title,
            x: 400,
            y: 300,
            parent_node_id: null,
            level: 0
        });

        return id;
    },

    /**
     * Busca mind maps do usuário
     */
    async getMindMaps(userEmail) {
        return await db.mind_maps
            .where('user_email')
            .equals(userEmail)
            .reverse()
            .toArray();
    },

    /**
     * Busca mind map por ID
     */
    async getMindMap(mapId) {
        return await db.mind_maps.get(mapId);
    },

    /**
     * Adiciona nó ao mind map
     */
    async addMindMapNode(nodeData) {
        const id = await db.mind_map_nodes.add(nodeData);

        // Atualiza contagem de nós
        const map = await this.getMindMap(nodeData.map_id);
        if (map) {
            await db.mind_maps.update(nodeData.map_id, {
                nodes_count: map.nodes_count + 1,
                updated_at: new Date().toISOString()
            });
        }

        return id;
    },

    /**
     * Busca nós de um mind map
     */
    async getMindMapNodes(mapId) {
        return await db.mind_map_nodes
            .where('map_id')
            .equals(mapId)
            .toArray();
    },

    /**
     * Atualiza posição do nó
     */
    async updateMindMapNode(nodeId, x, y) {
        await db.mind_map_nodes.update(nodeId, { x, y });
    },

    /**
     * Deleta nó do mind map
     */
    async deleteMindMapNode(nodeId) {
        const node = await db.mind_map_nodes.get(nodeId);
        if (node) {
            await db.mind_map_nodes.delete(nodeId);

            // Remove conexões
            await db.mind_map_connections
                .where({ from_node: nodeId })
                .or('to_node')
                .equals(nodeId)
                .delete();

            // Atualiza contagem
            const map = await this.getMindMap(node.map_id);
            if (map) {
                await db.mind_maps.update(node.map_id, {
                    nodes_count: map.nodes_count - 1,
                    updated_at: new Date().toISOString()
                });
            }
        }
    },

    // ==================== POMODORO ====================

    /**
     * Inicia sessão Pomodoro
     */
    async startPomodoroSession(sessionData) {
        return await db.pomodoro_sessions.add({
            ...sessionData,
            day_date: new Date().toISOString().split('T')[0],
            completed_at: null
        });
    },

    /**
     * Finaliza sessão Pomodoro
     */
    async completePomodoroSession(sessionId, duration) {
        await db.pomodoro_sessions.update(sessionId, {
            duration,
            completed_at: new Date().toISOString()
        });

        // Atualiza estatísticas diárias
        const today = new Date().toISOString().split('T')[0];
        let stats = await db.pomodoro_stats
            .where({ user_email: sessionData.user_email, day_date: today })
            .first();

        if (stats) {
            await db.pomodoro_stats.update(stats.id, {
                total_focus_time: stats.total_focus_time + duration,
                sessions_completed: stats.sessions_completed + 1
            });
        } else {
            await db.pomodoro_stats.add({
                user_email: sessionData.user_email,
                day_date: today,
                total_focus_time: duration,
                total_breaks: 0,
                sessions_completed: 1
            });
        }
    },

    /**
     * Busca sessões Pomodoro de hoje
     */
    async getTodayPomodoroSessions(userEmail) {
        const today = new Date().toISOString().split('T')[0];
        return await db.pomodoro_sessions
            .where({ user_email: userEmail, day_date: today })
            .toArray();
    },

    /**
     * Busca estatísticas Pomodoro
     */
    async getPomodoroStats(userEmail, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        return await db.pomodoro_stats
            .where('user_email')
            .equals(userEmail)
            .and(stat => stat.day_date >= startDateStr)
            .toArray();
    },

    // ==================== CONCURSOS ====================

    /**
     * Busca concursos do usuário
     */
    async getUserContests(userEmail) {
        return await db.contests
            .where('user_email')
            .equals(userEmail)
            .sortBy('exam_date');
    },

    /**
     * Adiciona ou atualiza concurso
     */
    async saveContest(contestData) {
        if (contestData.id) {
            await db.contests.update(contestData.id, contestData);
            return contestData.id;
        } else {
            const id = Helpers.generateId();
            await db.contests.add({ ...contestData, id });
            return id;
        }
    },

    /**
     * Busca concurso por ID
     */
    async getContest(contestId) {
        return await db.contests.get(contestId);
    },

    /**
     * Deleta concurso
     */
    async deleteContest(contestId) {
        await db.contests.delete(contestId);
        // Remove tópicos relacionados
        await db.study_topics.where('contest_id').equals(contestId).delete();
    },

    // ==================== TÓPICOS DE ESTUDO ====================

    /**
     * Busca tópicos de um concurso
     */
    async getStudyTopics(contestId) {
        return await db.study_topics
            .where('contest_id')
            .equals(contestId)
            .toArray();
    },

    /**
     * Adiciona tópico de estudo
     */
    async addStudyTopic(topicData) {
        return await db.study_topics.add({
            ...topicData,
            progress_level: 0,
            mastery_level: 0,
            created_at: new Date().toISOString()
        });
    },

    /**
     * Atualiza progresso de um tópico
     */
    async updateTopicProgress(topicId, progress, masteryLevel) {
        await db.study_topics.update(topicId, {
            progress_level: progress,
            mastery_level: masteryLevel,
            last_studied: new Date().toISOString()
        });
    },

    // ==================== REPETIÇÃO ESPAÇADA ====================

    /**
     * Busca itens para revisão hoje
     */
    async getItemsForReview(userEmail) {
        const today = new Date().toISOString().split('T')[0];
        return await db.spaced_repetition
            .where('user_email')
            .equals(userEmail)
            .and(item => item.next_review_date <= today)
            .toArray();
    },

    /**
     * Adiciona item para repetição espaçada
     */
    async addSpacedRepetitionItem(itemData) {
        return await db.spaced_repetition.add({
            ...itemData,
            easiness_factor: 2.5,
            interval: 0,
            repetitions: 0,
            created_at: new Date().toISOString()
        });
    },

    /**
     * Atualiza item de repetição espaçada
     */
    async updateSpacedRepetitionItem(id, data) {
        await db.spaced_repetition.update(id, {
            ...data,
            updated_at: new Date().toISOString()
        });
    },

    // ==================== PERFORMANCE ====================

    /**
     * Busca performance por tópico
     */
    async getPerformanceByTopic(userEmail) {
        return await db.user_performance
            .where('user_email')
            .equals(userEmail)
            .toArray();
    },

    /**
     * Atualiza performance
     */
    async updatePerformance(userEmail, topic, correct, total) {
        const existing = await db.user_performance
            .where({ user_email: userEmail, topic })
            .first();

        if (existing) {
            await db.user_performance.update(existing.id, {
                correct_answers: existing.correct_answers + correct,
                total_answers: existing.total_answers + total,
                last_study: new Date().toISOString()
            });
        } else {
            await db.user_performance.add({
                user_email: userEmail,
                topic,
                correct_answers: correct,
                total_answers: total,
                last_study: new Date().toISOString()
            });
        }
    },

    /**
     * Registra estatística diária
     */
    async recordDailyStats(userEmail, stats) {
        const today = new Date().toISOString().split('T')[0];

        const existing = await db.daily_stats
            .where({ user_email: userEmail, date: today })
            .first();

        if (existing) {
            await db.daily_stats.update(existing.id, {
                questions_answered: existing.questions_answered + (stats.questions_answered || 0),
                correct_answers: existing.correct_answers + (stats.correct_answers || 0),
                study_time_minutes: existing.study_time_minutes + (stats.study_time_minutes || 0),
                quizzes_completed: existing.quizzes_completed + (stats.quizzes_completed || 0)
            });
        } else {
            await db.daily_stats.add({
                user_email: userEmail,
                date: today,
                questions_answered: stats.questions_answered || 0,
                correct_answers: stats.correct_answers || 0,
                study_time_minutes: stats.study_time_minutes || 0,
                quizzes_completed: stats.quizzes_completed || 0
            });
        }
    },

    /**
     * Busca estatísticas diárias
     */
    async getDailyStats(userEmail, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        return await db.daily_stats
            .where('user_email')
            .equals(userEmail)
            .and(stat => stat.date >= startDateStr)
            .sortBy('date');
    },

    // ==================== CONQUISTAS ====================

    /**
     * Busca conquistas do usuário
     */
    async getUserAchievements(userEmail) {
        return await db.achievements
            .where('user_email')
            .equals(userEmail)
            .toArray();
    },

    /**
     * Verifica se usuário já possui conquista
     */
    async hasAchievement(userEmail, achievementType) {
        const achievement = await db.achievements
            .where({ user_email: userEmail, achievement_type: achievementType })
            .first();
        return !!achievement;
    },

    /**
     * Adiciona conquista
     */
    async addAchievement(userEmail, achievementType, title, description) {
        // Verifica se já possui
        if (await this.hasAchievement(userEmail, achievementType)) {
            return null;
        }

        const id = await db.achievements.add({
            user_email: userEmail,
            achievement_type: achievementType,
            title,
            description,
            icon: this.getAchievementIcon(achievementType),
            unlocked_at: new Date().toISOString()
        });

        // Cria notificação
        await this.createNotification(userEmail, 'Nova Conquista!', `${title}: ${description}`, 'conquista');

        return id;
    },

    /**
     * Atualiza progresso de conquista
     */
    async updateAchievementProgress(userEmail, achievementType, currentValue) {
        const progress = await db.achievement_progress
            .where({ user_email: userEmail, achievement_type: achievementType })
            .first();

        if (progress) {
            await db.achievement_progress.update(progress.id, {
                current_value: currentValue
            });
        } else {
            await db.achievement_progress.add({
                user_email: userEmail,
                achievement_type: achievementType,
                current_value: currentValue,
                target_value: this.getAchievementTarget(achievementType)
            });
        }
    },

    /**
     * Retorna ícone da conquista
     */
    getAchievementIcon(type) {
        const icons = {
            'primeira_questao': '🎯',
            'primeiro_quiz': '📝',
            '100_questoes': '💯',
            '500_questoes': '🔥',
            '1000_questoes': '⭐',
            'sequencia_7_dias': '📅',
            'sequencia_30_dias': '🏆',
            'sequencia_100_dias': '👑',
            'nota_perfeita': '💯',
            '10_quizzes': '🎪',
            '50_quizzes': '🎯',
            'primeira_questao_criada': '✏️',
            '10_questoes_criadas': '📚',
            'concurso_adicionado': '📋',
            'biblioteca_visitada': '📖',
            'meta_semanal_cumprida': '✅',
            'primeiro_flashcard': '🗂️',
            '50_flashcards': '📇',
            'primeiro_mindmap': '🗺️',
            'primeiro_pomodoro': '🍅',
            '10_pomodoros': '⏱️',
            'primeira_nota': '📝'
        };
        return icons[type] || '🏅';
    },

    /**
     * Retorna meta da conquista
     */
    getAchievementTarget(type) {
        const targets = {
            '100_questoes': 100,
            '500_questoes': 500,
            '1000_questoes': 1000,
            '10_quizzes': 10,
            '50_quizzes': 50,
            '10_questoes_criadas': 10,
            '50_flashcards': 50,
            '10_pomodoros': 10
        };
        return targets[type] || 1;
    },

    // ==================== METAS DE ESTUDO ====================

    /**
     * Cria meta de estudo
     */
    async createStudyGoal(goalData) {
        return await db.study_goals.add({
            ...goalData,
            current_value: 0,
            completed: false,
            created_at: new Date().toISOString()
        });
    },

    /**
     * Busca metas do usuário
     */
    async getStudyGoals(userEmail) {
        return await db.study_goals
            .where('user_email')
            .equals(userEmail)
            .toArray();
    },

    /**
     * Atualiza progresso da meta
     */
    async updateGoalProgress(goalId, currentValue) {
        const goal = await db.study_goals.get(goalId);
        if (goal) {
            await db.study_goals.update(goalId, {
                current_value: currentValue,
                completed: currentValue >= goal.target_value
            });
        }
    },

    // ==================== BIBLIOTECA ====================

    /**
     * Busca recursos por categoria
     */
    async getLibraryResources(category = null) {
        if (category) {
            return await db.library_resources
                .where('category')
                .equals(category)
                .toArray();
        }
        return await db.library_resources.toArray();
    },

    /**
     * Adiciona recurso à biblioteca
     */
    async addLibraryResource(resourceData) {
        return await db.library_resources.add(resourceData);
    },

    /**
     * Alterna favorito da biblioteca
     */
    async toggleLibraryFavorite(userEmail, resourceId) {
        const existing = await db.library_favorites
            .where({ user_email: userEmail, resource_id: resourceId })
            .first();

        if (existing) {
            await db.library_favorites.delete(existing.id);
            return false;
        } else {
            await db.library_favorites.add({
                user_email: userEmail,
                resource_id: resourceId,
                created_at: new Date().toISOString()
            });
            return true;
        }
    },

    /**
     * Busca favoritos da biblioteca
     */
    async getLibraryFavorites(userEmail) {
        return await db.library_favorites
            .where('user_email')
            .equals(userEmail)
            .toArray();
    },

    // ==================== NOTAS DE ESTUDO ====================

    /**
     * Cria nota de estudo
     */
    async createStudyNote(noteData) {
        return await db.study_notes.add({
            ...noteData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    },

    /**
     * Busca notas do usuário
     */
    async getStudyNotes(userEmail, topic = null) {
        if (topic) {
            return await db.study_notes
                .where('user_email')
                .equals(userEmail)
                .and(note => note.topic === topic)
                .toArray();
        }
        return await db.study_notes
            .where('user_email')
            .equals(userEmail)
            .reverse()
            .toArray();
    },

    /**
     * Atualiza nota de estudo
     */
    async updateStudyNote(noteId, content) {
        await db.study_notes.update(noteId, {
            content,
            updated_at: new Date().toISOString()
        });
    },

    /**
     * Deleta nota de estudo
     */
    async deleteStudyNote(noteId) {
        await db.study_notes.delete(noteId);
        await db.note_links.where('note_id').equals(noteId).delete();
    },

    // ==================== FAVORITOS ====================

    /**
     * Busca questões favoritadas
     */
    async getFavoriteQuestions(userEmail) {
        return await db.favorite_questions
            .where('user_email')
            .equals(userEmail)
            .toArray();
    },

    /**
     * Alterna favorito
     */
    async toggleFavorite(userEmail, questionId, questionText, topic) {
        const existing = await db.favorite_questions
            .where({ user_email: userEmail, question_id: questionId })
            .first();

        if (existing) {
            await db.favorite_questions.delete(existing.id);
            return false;
        } else {
            await db.favorite_questions.add({
                user_email: userEmail,
                question_id: questionId,
                question_text: questionText,
                topic,
                created_at: new Date().toISOString()
            });
            return true;
        }
    },

    /**
     * Verifica se questão é favorita
     */
    async isFavorite(userEmail, questionId) {
        const existing = await db.favorite_questions
            .where({ user_email: userEmail, question_id: questionId })
            .first();
        return !!existing;
    },

    // ==================== NOTAS DE QUESTÕES ====================

    /**
     * Adiciona nota a uma questão
     */
    async addQuestionNote(userEmail, questionId, note) {
        return await db.question_notes.add({
            user_email: userEmail,
            question_id: questionId,
            note,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    },

    /**
     * Busca notas de uma questão
     */
    async getQuestionNotes(userEmail, questionId) {
        return await db.question_notes
            .where({ user_email: userEmail, question_id: questionId })
            .toArray();
    },

    // ==================== NOTIFICAÇÕES ====================

    /**
     * Busca notificações não lidas
     */
    async getUnreadNotifications(userEmail) {
        return await db.notifications
            .where({ user_email: userEmail, read: 0 })
            .reverse()
            .toArray();
    },

    /**
     * Cria notificação
     */
    async createNotification(userEmail, title, message, type = 'informacao') {
        const id = await db.notifications.add({
            user_email: userEmail,
            title,
            message,
            type,
            read: false,
            icon: this.getNotificationIcon(type),
            created_at: new Date().toISOString()
        });
        return id;
    },

    /**
     * Marca notificação como lida
     */
    async markNotificationRead(id) {
        await db.notifications.update(id, { read: true });
    },

    /**
     * Marca todas como lidas
     */
    async markAllNotificationsRead(userEmail) {
        const unread = await this.getUnreadNotifications(userEmail);
        for (const notification of unread) {
            await this.markNotificationRead(notification.id);
        }
    },

    /**
     * Retorna ícone da notificação
     */
    getNotificationIcon(type) {
        const icons = {
            'conquista': '🏆',
            'lembrete': '⏰',
            'atualização': '🔄',
            'informacao': 'ℹ️',
            'quiz': '📝',
            'flashcard': '🗂️',
            'pomodoro': '🍅',
            'concurso': '📋'
        };
        return icons[type] || 'ℹ️';
    },

    // ==================== CONFIGURAÇÕES ====================

    /**
     * Salva configurações do usuário
     */
    async saveUserSettings(userEmail, settings) {
        await db.user_settings.put({
            user_email: userEmail,
            ...settings,
            updated_at: new Date().toISOString()
        });
    },

    /**
     * Busca configurações do usuário
     */
    async getUserSettings(userEmail) {
        return await db.user_settings.get(userEmail);
    },

    /**
     * Salva preferência
     */
    async setPreference(userEmail, key, value) {
        await db.preferences.put({
            user_email: userEmail,
            keys: [key],
            value
        });
    },

    /**
     * Busca preferência
     */
    async getPreference(userEmail, key) {
        const pref = await db.preferences
            .where({ user_email: userEmail })
            .and(p => p.keys && p.keys.includes(key))
            .first();
        return pref ? pref.value : null;
    },

    // ==================== ESTATÍSTICAS GERAIS ====================

    /**
     * Calcula estatísticas completas do usuário
     */
    async calculateUserStats(userEmail) {
        const [attempts, questions, flashcards, pomodoroStats, dailyStats] = await Promise.all([
            db.quiz_attempts.where('user_email').equals(userEmail).toArray(),
            db.questions.toArray(),
            db.flashcards.where('user_email').equals(userEmail).toArray(),
            db.pomodoro_stats.where('user_email').equals(userEmail).toArray(),
            db.daily_stats.where('user_email').equals(userEmail).toArray()
        ]);

        const totalQuizzes = attempts.length;
        const totalQuestions = attempts.reduce((sum, a) => sum + (a.total_questions || 0), 0);
        const totalCorrect = attempts.reduce((sum, a) => sum + (a.correct_count || 0), 0);
        const totalTime = attempts.reduce((sum, a) => sum + (a.time_spent || 0), 0);
        const totalFlashcards = flashcards.length;
        const totalPomodoro = pomodoroStats.reduce((sum, s) => sum + (s.total_focus_time || 0), 0);

        const averageScore = totalQuizzes > 0
            ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalQuizzes)
            : 0;

        const totalStudyTime = dailyStats.reduce((sum, d) => sum + (d.study_time_minutes || 0), 0);
        const questionsAnswered = dailyStats.reduce((sum, d) => sum + (d.questions_answered || 0), 0);
        const questionsCorrect = dailyStats.reduce((sum, d) => sum + (d.correct_answers || 0), 0);

        return {
            totalQuizzes,
            totalQuestions,
            totalCorrect,
            totalTime,
            totalFlashcards,
            totalPomodoroMinutes: totalPomodoro,
            totalStudyMinutes: totalStudyTime,
            averageScore,
            hitRate: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            dailyHitRate: questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0,
            streakDays: await this.calculateStreakDays(userEmail),
            achievementsUnlocked: await db.achievements.where('user_email').equals(userEmail).count()
        };
    },

    /**
     * Calcula dias de sequência de estudo
     */
    async calculateStreakDays(userEmail) {
        const stats = await db.daily_stats
            .where('user_email')
            .equals(userEmail)
            .sortBy('date');

        if (stats.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Ordena do mais recente para o mais antigo
        stats.reverse();

        for (const stat of stats) {
            const statDate = new Date(stat.date);
            statDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((today - statDate) / (1000 * 60 * 60 * 24));

            if (diffDays <= streak + 1 && stat.questions_answered > 0) {
                streak = diffDays;
            } else if (diffDays > streak + 1) {
                break;
            }
        }

        return streak;
    },

    /**
     * Calcula performance por tópico
     */
    async getTopicPerformance(userEmail) {
        const attempts = await db.quiz_attempts
            .where('user_email')
            .equals(userEmail)
            .toArray();

        const performance = {};

        for (const attempt of attempts) {
            if (attempt.topic_performance) {
                for (const [topic, stats] of Object.entries(attempt.topic_performance)) {
                    if (!performance[topic]) {
                        performance[topic] = { correct: 0, total: 0 };
                    }
                    performance[topic].correct += stats.correct || 0;
                    performance[topic].total += stats.total || 0;
                }
            }
        }

        // Calcula percentual
        const result = [];
        for (const [topic, stats] of Object.entries(performance)) {
            result.push({
                topic,
                correct: stats.correct,
                total: stats.total,
                percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
            });
        }

        return result.sort((a, b) => b.percentage - a.percentage);
    }
};

// Exportar para uso global
window.DatabaseService = DatabaseService;
window.db = db;
