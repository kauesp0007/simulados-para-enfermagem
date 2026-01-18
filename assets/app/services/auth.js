/**
 * Authentication Service
 * Serviço de autenticação com suporte a login, registro e sessão
 */

const AuthService = {
    currentUser: null,

    /**
     * Garante que existe um usuário teste
     */
    async ensureTestUser() {
        const testEmail = 'teste@enfermagem.com';
        
        let user = await db.users.where('email').equals(testEmail).first();
        
        if (user) {
            this.currentUser = user;
            return user;
        }
        
        // Criar novo usuário teste
        const newUser = {
            id: 'user_' + Date.now(),
            email: testEmail,
            full_name: 'Usuário Teste',
            role: 'user',
            created_at: new Date().toISOString(),
            study_streak: 5,
            total_quizzes: 12,
            total_questions: 156,
            last_study_date: new Date().toDateString(),
            dark_mode: false,
            xp: 450,
            total_study_time: 7200,
            stats: {
                questions_answered: 156,
                correct_answers: 124,
                average_score: 79,
                total_time_spent: 7200
            }
        };
        
        await db.users.add(newUser);
        this.currentUser = newUser;
        return newUser;
    },

    /**
     * Inicializa o serviço de autenticação
     */
    async init() {
        const session = Helpers.localGet('session');
        if (session && session.token) {
            const user = await this.getUserFromSession(session);
            if (user) {
                this.currentUser = user;
                return user;
            }
        }
        return null;
    },

    /**
     * Login com email e senha
     */
    async login(email, password) {
        try {
            await Helpers.sleep(500);

            if (!email || !password) {
                throw new Error('Por favor, preencha email e senha');
            }

            let user = await this.findUserByEmail(email);

            if (!user) {
                user = await this.createDemoUser(email);
            }

            const session = {
                token: this.generateToken(),
                user_id: user.id,
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            Helpers.localSet('session', session);
            this.currentUser = user;

            console.log('User logged in:', user.email);
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Registro de novo usuário
     */
    async register(userData) {
        try {
            await Helpers.sleep(500);

            const { email, password, full_name } = userData;

            if (!email || !Helpers.isValidEmail(email)) {
                throw new Error('Por favor, insira um email válido');
            }

            if (!password || password.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            if (!full_name || full_name.trim().length < 2) {
                throw new Error('Por favor, insira seu nome completo');
            }

            const existingUser = await this.findUserByEmail(email);
            if (existingUser) {
                throw new Error('Este email já está cadastrado');
            }

            const user = {
                id: Helpers.generateId(),
                email,
                full_name: full_name.trim(),
                role: 'user',
                created_at: new Date().toISOString(),
                study_streak: 0,
                total_quizzes: 0,
                total_questions: 0,
                last_study_date: null,
                dark_mode: false,
                xp: 0,
                total_study_time: 0,
                contest_alert_days: 7,
                daily_goal: 10,
                stats: {
                    questions_answered: 0,
                    correct_answers: 0,
                    average_score: 0,
                    total_time_spent: 0
                }
            };

            await db.users.add(user);

            const session = {
                token: this.generateToken(),
                user_id: user.id,
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            Helpers.localSet('session', session);
            this.currentUser = user;

            return user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    /**
     * Logout do usuário
     */
    async logout() {
        try {
            Helpers.localRemove('session');
            Helpers.localRemove('user_preferences');
            this.currentUser = null;
            console.log('User logged out');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    /**
     * Verifica se usuário está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    },

    /**
     * Retorna usuário atual
     */
    getCurrentUser() {
        return this.currentUser;
    },

    /**
     * Atualiza dados do usuário
     */
    async updateUser(updates) {
        if (!this.currentUser) {
            throw new Error('Nenhum usuário autenticado');
        }

        try {
            const updatedUser = {
                ...this.currentUser,
                ...updates,
                updated_at: new Date().toISOString()
            };

            await db.users.update(this.currentUser.id, updatedUser);
            this.currentUser = updatedUser;

            if (updates.dark_mode !== undefined) {
                document.documentElement.setAttribute('data-theme', updates.dark_mode ? 'dark' : 'light');
            }

            return updatedUser;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    },

    /**
     * Adiciona XP ao usuário
     */
    async addXp(amount) {
        if (!this.currentUser) return;

        const currentXp = this.currentUser.xp || 0;
        const newXp = currentXp + amount;
        
        await this.updateUser({ xp: newXp });
        
        // Verificar se subiu de nível
        const newLevel = Math.floor(newXp / 100) + 1;
        const currentLevel = Math.floor(currentXp / 100) + 1;
        
        if (newLevel > currentLevel) {
            console.log(`Parabéns! Você alcançou o nível ${newLevel}!`);
        }
    },

    /**
     * Atualiza estatísticas do usuário
     */
    async updateUserStats(stats) {
        if (!this.currentUser) return;

        const currentStats = this.currentUser.stats || {};
        const newStats = {
            ...currentStats,
            ...stats,
            questions_answered: (currentStats.questions_answered || 0) + (stats.questions_answered || 0),
            correct_answers: (currentStats.correct_answers || 0) + (stats.correct_answers || 0),
            total_time_spent: (currentStats.total_time_spent || 0) + (stats.total_time_spent || 0)
        };

        if (newStats.questions_answered > 0) {
            newStats.average_score = Math.round(
                (newStats.correct_answers / newStats.questions_answered) * 100
            );
        }

        await this.updateUser({ stats: newStats });

        if (stats.questions_answered) {
            await this.updateUser({
                total_questions: (this.currentUser.total_questions || 0) + stats.questions_answered
            });
        }

        if (stats.quiz_completed) {
            await this.updateUser({
                total_quizzes: (this.currentUser.total_quizzes || 0) + 1
            });
        }

        await this.checkStudyStreak();
    },

    /**
     * Verifica e atualiza sequência de estudo
     */
    async checkStudyStreak() {
        if (!this.currentUser) return;

        const today = new Date().toDateString();
        const lastStudy = this.currentUser.last_study_date;

        if (lastStudy === today) {
            return;
        }

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

        if (lastStudy === yesterday) {
            const newStreak = (this.currentUser.study_streak || 0) + 1;
            await this.updateUser({ study_streak: newStreak, last_study_date: today });
        } else if (lastStudy !== today) {
            await this.updateUser({ study_streak: 0, last_study_date: today });
        }
    },

    /**
     * Busca usuário por email
     */
    async findUserByEmail(email) {
        return await db.users.where('email').equals(email).first();
    },

    /**
     * Cria usuário demo
     */
    async createDemoUser(email) {
        const name = email.split('@')[0].replace(/[._]/g, ' ');
        const user = {
            id: Helpers.generateId(),
            email,
            full_name: Helpers.titleCase(name),
            role: 'user',
            created_at: new Date().toISOString(),
            study_streak: 0,
            total_quizzes: 0,
            total_questions: 0,
            last_study_date: null,
            dark_mode: false,
            xp: 0,
            total_study_time: 0,
            stats: {
                questions_answered: 0,
                correct_answers: 0,
                average_score: 0,
                total_time_spent: 0
            }
        };

        await db.users.add(user);
        return user;
    },

    /**
     * Gera token de sessão
     */
    generateToken() {
        return 'token_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Obtém usuário da sessão
     */
    async getUserFromSession(session) {
        if (!session || !session.token) return null;

        if (session.expires_at && new Date(session.expires_at) < new Date()) {
            Helpers.localRemove('session');
            return null;
        }

        const user = await db.users.get(session.user_id);
        return user;
    },

    /**
     * Verifica se é admin
     */
    isAdmin() {
        return this.currentUser?.role === 'admin';
    }
};

// Exportar para uso global
window.AuthService = AuthService;
