/**
 * API Service - Mock API to replace base44
 * Simula todas as operações da API base44 localmente
 */

const API = {
    /**
     * Simula delay de rede
     */
    async simulateNetworkDelay(min = 100, max = 300) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await Helpers.sleep(delay);
    },

    /**
     * Entities API - Operações CRUD genéricas
     */
    entities: {
        /**
         * Busca registros com filtros
         */
        async filter(entity, filters = {}) {
            await API.simulateNetworkDelay();
            const table = db[entity];

            if (!table) {
                throw new Error(`Entity '${entity}' not found`);
            }

            let records = await table.toArray();

            // Aplicar filtros
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        records = records.filter(r => value.includes(r[key]));
                    } else if (typeof value === 'object') {
                        // Operadores especiais
                        if (value.$ne !== undefined) {
                            records = records.filter(r => r[key] !== value.$ne);
                        }
                        if (value.$gt !== undefined) {
                            records = records.filter(r => r[key] > value.$gt);
                        }
                        if (value.$lt !== undefined) {
                            records = records.filter(r => r[key] < value.$lt);
                        }
                    } else {
                        records = records.filter(r => r[key] === value);
                    }
                }
            }

            return records;
        },

        /**
         * Busca registro por ID
         */
        async get(entity, id) {
            await API.simulateNetworkDelay();
            const table = db[entity];
            if (!table) throw new Error(`Entity '${entity}' not found`);
            return await table.get(id);
        },

        /**
         * Cria novo registro
         */
        async create(entity, data) {
            await API.simulateNetworkDelay();
            const table = db[entity];
            if (!table) throw new Error(`Entity '${entity}' not found`);

            const id = Helpers.generateId();
            const record = {
                ...data,
                id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await table.add(record);
            return record;
        },

        /**
         * Atualiza registro
         */
        async update(entity, id, data) {
            await API.simulateNetworkDelay();
            const table = db[entity];
            if (!table) throw new Error(`Entity '${entity}' not found`);

            const existing = await table.get(id);
            if (!existing) throw new Error('Record not found');

            const updated = {
                ...existing,
                ...data,
                updated_at: new Date().toISOString()
            };

            await table.update(id, updated);
            return updated;
        },

        /**
         * Exclui registro
         */
        async delete(entity, id) {
            await API.simulateNetworkDelay();
            const table = db[entity];
            if (!table) throw new Error(`Entity '${entity}' not found`);

            await table.delete(id);
            return true;
        }
    },

    /**
     * Auth API - Operações de autenticação
     */
    auth: {
        /**
         * Obtém usuário atual
         */
        async me() {
            await API.simulateNetworkDelay();
            const user = AuthService.getCurrentUser();
            if (!user) throw new Error('Not authenticated');
            return user;
        },

        /**
         * Atualiza dados do usuário
         */
        async updateMe(data) {
            await API.simulateNetworkDelay();
            return await AuthService.updateUser(data);
        },

        /**
         * Logout
         */
        async logout() {
            await API.simulateNetworkDelay();
            return await AuthService.logout();
        }
    },

    /**
     * Quiz API - Operações específicas de quiz
     */
    quiz: {
        /**
         * Gera questões para quiz
         */
        async generateQuestions(options = {}) {
            await API.simulateNetworkDelay();

            const {
                count = 10,
                topic,
                difficulty,
                exam_type,
                exclude_ids = []
            } = options;

            let questions = await db.questions.toArray();

            // Aplicar filtros
            if (topic) {
                questions = questions.filter(q => q.topic === topic);
            }
            if (difficulty) {
                questions = questions.filter(q => q.difficulty === difficulty);
            }
            if (exam_type) {
                questions = questions.filter(q => q.exam_type === exam_type);
            }
            if (exclude_ids.length > 0) {
                questions = questions.filter(q => !exclude_ids.includes(q.id));
            }

            // Embaralhar e limitar
            return Helpers.shuffleArray(questions).slice(0, count);
        },

        /**
         * Calcula resultado do quiz
         */
        async calculateResult(answers, questions) {
            let correct = 0;
            let incorrect = 0;
            let skipped = 0;

            const results = questions.map((question, index) => {
                const answer = answers[index];
                const isCorrect = answer === this.findCorrectAnswer(question);

                if (answer === null || answer === undefined) {
                    skipped++;
                } else if (isCorrect) {
                    correct++;
                } else {
                    incorrect++;
                }

                return {
                    question_id: question.id,
                    selected_answer: answer,
                    correct_answer: this.findCorrectAnswer(question),
                    is_correct: isCorrect,
                    time_spent: answer?.time_spent || 0
                };
            });

            const total = questions.length;
            const score = total > 0 ? Math.round((correct / total) * 100) : 0;
            const time_spent = results.reduce((sum, r) => sum + (r.time_spent || 0), 0);

            return {
                score,
                total_questions: total,
                correct_count: correct,
                incorrect_count: incorrect,
                skipped_count: skipped,
                time_spent,
                results,
                passed: score >= 70
            };
        },

        /**
         * Encontra resposta correta
         */
        findCorrectAnswer(question) {
            const correctIndex = question.answers?.findIndex(a => a.correct);
            return correctIndex !== undefined && correctIndex !== -1 ? correctIndex : null;
        }
    },

    /**
     * Contest API - Operações de concursos
     */
    contest: {
        /**
         * Busca concursos públicos com filtros
         */
        async searchPublic(filters = {}) {
            await API.simulateNetworkDelay();

            let contests = await db.public_contests.toArray();

            if (filters.state) {
                contests = contests.filter(c => c.state === filters.state);
            }
            if (filters.exam_type) {
                contests = contests.filter(c => c.exam_type === filters.exam_type);
            }
            if (filters.status) {
                contests = contests.filter(c => c.status === filters.status);
            }
            if (filters.query) {
                const query = filters.query.toLowerCase();
                contests = contests.filter(c =>
                    c.name?.toLowerCase().includes(query) ||
                    c.institution?.toLowerCase().includes(query)
                );
            }

            // Ordenar por data da prova
            contests.sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

            return contests;
        },

        /**
         * Calcula dias até a prova
         */
        daysUntilExam(contest) {
            if (!contest.exam_date) return null;
            return Helpers.daysUntil(contest.exam_date);
        }
    },

    /**
     * Performance API - Estatísticas e métricas
     */
    performance: {
        /**
         * Obtém dashboard de performance
         */
        async getDashboard(userEmail) {
            await API.simulateNetworkDelay();

            const attempts = await db.quiz_attempts
                .where('user_email')
                .equals(userEmail)
                .toArray();

            const recentAttempts = attempts.slice(-10);
            const today = new Date().toDateString();

            // Estatísticas gerais
            const totalQuizzes = attempts.length;
            const totalQuestions = attempts.reduce((sum, a) => sum + (a.total_questions || 0), 0);
            const totalCorrect = attempts.reduce((sum, a) => sum + (a.correct_count || 0), 0);
            const totalTime = attempts.reduce((sum, a) => sum + (a.time_spent || 0), 0);

            // Quiz hoje
            const quizzesToday = attempts.filter(a =>
                new Date(a.completed_at).toDateString() === today
            ).length;

            // Melhor pontuação
            const bestScore = attempts.length > 0
                ? Math.max(...attempts.map(a => a.score || 0))
                : 0;

            // Média de pontuação
            const averageScore = attempts.length > 0
                ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
                : 0;

            // Evolução (últimos 7 dias)
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                const dayAttempts = attempts.filter(a =>
                    new Date(a.completed_at).toDateString() === date.toDateString()
                );

                last7Days.push({
                    date: date.toISOString().split('T')[0],
                    quizzes: dayAttempts.length,
                    questions: dayAttempts.reduce((sum, a) => sum + (a.total_questions || 0), 0),
                    score: dayAttempts.length > 0
                        ? Math.round(dayAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / dayAttempts.length)
                        : 0
                });
            }

            return {
                totalQuizzes,
                totalQuestions,
                totalCorrect,
                totalTime,
                quizzesToday,
                bestScore,
                averageScore,
                hitRate: totalQuestions > 0
                    ? Math.round((totalCorrect / totalQuestions) * 100)
                    : 0,
                last7Days,
                streak: AuthService.currentUser?.study_streak || 0
            };
        },

        /**
         * Obtém performance por tópico
         */
        async getByTopic(userEmail) {
            await API.simulateNetworkDelay();

            const performance = await db.user_performance
                .where('user_email')
                .equals(userEmail)
                .toArray();

            return performance.map(p => ({
                ...p,
                hitRate: p.total_answers > 0
                    ? Math.round((p.correct_answers / p.total_answers) * 100)
                    : 0
            }));
        }
    },

    /**
     * Admin API - Operações administrativas
     */
    admin: {
        /**
         * Verifica se usuário é admin
         */
        isAdmin() {
            return AuthService.isAdmin();
        },

        /**
         * Lista usuários
         */
        async listUsers() {
            await API.simulateNetworkDelay();
            return await db.users.toArray();
        },

        /**
         * Atualiza status de questão do usuário
         */
        async updateQuestionStatus(questionId, status, notes = '') {
            await API.simulateNetworkDelay();
            await db.user_questions.update(questionId, {
                admin_status: status,
                admin_notes: notes,
                updated_at: new Date().toISOString()
            });
            return await db.user_questions.get(questionId);
        },

        /**
         * Obtém estatísticas globais
         */
        async getStats() {
            await API.simulateNetworkDelay();

            const [
                totalUsers,
                totalQuestions,
                totalUserQuestions,
                totalQuizzes,
                totalAttempts
            ] = await Promise.all([
                db.users.count(),
                db.questions.count(),
                db.user_questions.count(),
                db.quizzes.count(),
                db.quiz_attempts.count()
            ]);

            const pendingQuestions = await db.user_questions
                .where('admin_status')
                .equals('pendente')
                .count();

            return {
                totalUsers,
                totalQuestions,
                totalUserQuestions,
                pendingUserQuestions: pendingQuestions,
                totalQuizzes,
                totalAttempts
            };
        }
    },

    /**
     * Integration API - Integrações diversas
     */
    integrations: {
        Core: {
            /**
             * Simula upload de arquivo
             */
            async UploadFile({ file }) {
                await API.simulateNetworkDelay(500, 1000);
                // Simular URL de arquivo
                return {
                    file_url: `https://example.com/uploads/${Helpers.generateId()}/${file.name}`
                };
            },

            /**
             * Simula extração de dados de arquivo
             */
            async ExtractDataFromUploadedFile({ file_url, json_schema }) {
                await API.simulateNetworkDelay(1000, 2000);
                // Simular extração de tópicos do edital
                return {
                    status: 'success',
                    output: {
                        topics: [
                            { topic_name: 'Noções de Saúde Pública', weight: 5 },
                            { topic_name: 'Legislação do SUS', weight: 4 },
                            { topic_name: 'Ética Profissional', weight: 3 }
                        ]
                    }
                };
            }
        }
    },

    /**
     * Notifications API
     */
    notifications: {
        /**
         * Envia notificação
         */
        async send(userEmail, title, message, type = 'informacao') {
            await DatabaseService.createNotification(userEmail, title, message, type);
        }
    }
};

// Exportar para uso global
window.API = API;
