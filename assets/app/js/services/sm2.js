/**
 * SM-2 Spaced Repetition Algorithm
 * Implementação do algoritmo SuperMemo 2 para repetição espaçada
 *
 * O algoritmo SM-2 foi desenvolvido por Piotr Wozniak em 1987
 * e é a base de muitos sistemas de repetição espaçada modernos.
 */

const SM2 = {
    // Constantes do algoritmo
    MIN_EASINESS: 1.3,
    DEFAULT_EASINESS: 2.5,
    MAX_EASINESS: 2.5,
    DEFAULT_INTERVAL: 1,

    /**
     * Calcula o próximo intervalo de revisão
     *
     * @param {Object} params - Parâmetros do cálculo
     * @param {number} params.easiness - Fator de facilidade atual (1.3 - 2.5)
     * @param {number} params.repetitions - Número de repetições bem-sucedidas
     * @param {number} params.quality - Qualidade da resposta (0-5)
     * @param {number} params.interval - Intervalo atual em dias
     * @returns {Object} - Próximo estado
     */
    calculateNextReview(params) {
        const { easiness, repetitions, quality, interval } = params;

        // Garantir valores válidos
        const ef = Math.max(this.MIN_EASINESS, easiness || this.DEFAULT_EASINESS);
        const n = repetitions || 0;
        const q = Math.max(0, Math.min(5, quality));
        const i = interval || this.DEFAULT_INTERVAL;

        // Se qualidade < 3, resetar repetições
        let newRepetitions, newInterval, newEasiness;

        if (q < 3) {
            newRepetitions = 0;
            newInterval = 1; // Revisar amanhã
            newEasiness = ef;
        } else {
            newRepetitions = n + 1;
            newEasiness = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

            if (newEasiness < this.MIN_EASINESS) {
                newEasiness = this.MIN_EASINESS;
            }

            // Calcular próximo intervalo
            if (newRepetitions === 1) {
                newInterval = 1;
            } else if (newRepetitions === 2) {
                newInterval = 6;
            } else {
                newInterval = Math.round(i * newEasiness);
            }
        }

        // Calcular próxima data de revisão
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

        return {
            easiness: newEasiness,
            repetitions: newRepetitions,
            interval: newInterval,
            next_review_date: nextReviewDate.toISOString().split('T')[0],
            last_reviewed: new Date().toISOString()
        };
    },

    /**
     * Avalia a qualidade da resposta do usuário
     *
     * @param {Object} params - Parâmetros da avaliação
     * @param {boolean} params.correct - Se a resposta foi correta
     * @param {number} params.timeSpent - Tempo gasto para responder (segundos)
     * @param {number} params.difficulty - Dificuldade da questão (1-3: fácil, médio, difícil)
     * @returns {number} - Qualidade da resposta (0-5)
     */
    evaluateResponse(params) {
        const { correct, timeSpent, difficulty } = params;

        if (!correct) {
            return 0; // Completamente incorreta
        }

        // Ajustar qualidade baseado no tempo
        // Tempo muito curto pode indicar chute
        const optimalTime = difficulty === 'difícil' ? 90 : difficulty === 'médio' ? 60 : 45;

        let timeBonus = 0;
        if (timeSpent >= optimalTime * 0.5) {
            // Tempo adequado
            timeBonus = 1;
        } else if (timeSpent >= optimalTime * 0.25) {
            // Tempo um pouco curto
            timeBonus = 0.5;
        }
        // Tempo muito curto não recebe bônus

        // Qualidade base
        let quality = correct ? 4 : 0;

        // Ajustar baseado na dificuldade
        if (correct) {
            if (difficulty === 'difícil') {
                quality = 5; // Resposta difícil correta vale mais
            } else if (difficulty === 'fácil') {
                quality = 3 + timeBonus; // Resposta fácil correta
            } else {
                quality = 4 + timeBonus; // Resposta média correta
            }
        }

        return Math.min(5, Math.max(0, quality));
    },

    /**
     * Processa resposta de questão e atualiza repetição espaçada
     *
     * @param {Object} params - Parâmetros do processamento
     * @param {string} params.userEmail - Email do usuário
     * @param {Object} params.question - Questão respondida
     * @param {boolean} params.correct - Se a resposta foi correta
     * @param {number} params.timeSpent - Tempo gasto em segundos
     * @returns {Object} - Resultado do processamento
     */
    async processResponse(params) {
        const { userEmail, question, correct, timeSpent } = params;

        try {
            // Verificar se já existe registro de repetição espaçada
            let record = await db.spaced_repetition
                .where({ user_email: userEmail, question_id: question.id })
                .first();

            // Calcular qualidade da resposta
            const quality = this.evaluateResponse({
                correct,
                timeSpent,
                difficulty: question.difficulty || 'médio'
            });

            // Calcular próximo estado
            const nextState = this.calculateNextReview({
                easiness: record?.easiness || this.DEFAULT_EASINESS,
                repetitions: record?.repetitions || 0,
                quality,
                interval: record?.interval || this.DEFAULT_INTERVAL
            });

            // Preparar dados para salvar
            const saveData = {
                user_email: userEmail,
                question_id: question.id,
                question_text: question.question,
                topic: question.topic,
                ...nextState,
                correct_count: (record?.correct_count || 0) + (correct ? 1 : 0),
                incorrect_count: (record?.incorrect_count || 0) + (correct ? 0 : 1),
                updated_at: new Date().toISOString()
            };

            if (record) {
                // Atualizar registro existente
                await db.spaced_repetition.update(record.id, saveData);
            } else {
                // Criar novo registro
                saveData.created_at = new Date().toISOString();
                await db.spaced_repetition.add(saveData);
            }

            return {
                success: true,
                quality,
                nextReview: nextState.next_review_date,
                interval: nextState.interval,
                easiness: nextState.easiness,
                repetitions: nextState.repetitions
            };
        } catch (error) {
            console.error('Error processing SM-2 response:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Busca questões para revisão hoje
     *
     * @param {string} userEmail - Email do usuário
     * @param {number} limit - Limite de questões
     * @returns {Array} - Questões para revisar
     */
    async getItemsForReview(userEmail, limit = 20) {
        const today = new Date().toISOString().split('T')[0];

        const items = await db.spaced_repetition
            .where('user_email')
            .equals(userEmail)
            .and(item => item.next_review_date <= today)
            .limit(limit)
            .toArray();

        // Buscar detalhes das questões
        const questions = [];
        for (const item of items) {
            const question = await db.questions.get(item.question_id);
            if (question) {
                questions.push({
                    ...question,
                    repetition_data: {
                        easiness: item.easiness,
                        interval: item.interval,
                        repetitions: item.repetitions,
                        next_review: item.next_review_date
                    }
                });
            }
        }

        return questions;
    },

    /**
     * Cria novo item de repetição espaçada
     *
     * @param {string} userEmail - Email do usuário
     * @param {Object} question - Questão
     * @returns {Object} - Registro criado
     */
    async createItem(userEmail, question) {
        const record = {
            user_email: userEmail,
            question_id: question.id,
            question_text: question.question,
            topic: question.topic,
            easiness: this.DEFAULT_EASINESS,
            interval: this.DEFAULT_INTERVAL,
            repetitions: 0,
            next_review_date: new Date().toISOString().split('T')[0],
            last_reviewed: null,
            correct_count: 0,
            incorrect_count: 0,
            created_at: new Date().toISOString()
        };

        const id = await db.spaced_repetition.add(record);
        return { ...record, id };
    },

    /**
     * Obtém estatísticas de repetição espaçada
     *
     * @param {string} userEmail - Email do usuário
     * @returns {Object} - Estatísticas
     */
    async getStats(userEmail) {
        const items = await db.spaced_repetition
            .where('user_email')
            .equals(userEmail)
            .toArray();

        const today = new Date().toISOString().split('T')[0];

        // Itens para revisar hoje
        const dueToday = items.filter(i => i.next_review_date <= today);

        // Itens novos (nunca revisados)
        const newItems = items.filter(i => i.repetitions === 0);

        // Itens aprendidos (múltiplas revisões)
        const learnedItems = items.filter(i => i.repetitions >= 3);

        // Média de facilidade
        const avgEasiness = items.length > 0
            ? items.reduce((sum, i) => sum + (i.easiness || this.DEFAULT_EASINESS), 0) / items.length
            : this.DEFAULT_EASINESS;

        // Total de revisões
        const totalReviews = items.reduce((sum, i) => sum + (i.repetitions || 0), 0);

        // Taxa de acerto
        const totalAnswers = items.reduce((sum, i) =>
            sum + (i.correct_count || 0) + (i.incorrect_count || 0), 0);
        const correctAnswers = items.reduce((sum, i) => sum + (i.correct_count || 0), 0);

        return {
            totalItems: items.length,
            dueToday: dueToday.length,
            newItems: newItems.length,
            learnedItems: learnedItems.length,
            averageEasiness: Math.round(avgEasiness * 100) / 100,
            totalReviews,
            hitRate: totalAnswers > 0
                ? Math.round((correctAnswers / totalAnswers) * 100)
                : 0
        };
    },

    /**
     * Reseta progresso de um item
     *
     * @param {string} userEmail - Email do usuário
     * @param {string} questionId - ID da questão
     * @returns {boolean} - Sucesso
     */
    async resetItem(userEmail, questionId) {
        await db.spaced_repetition
            .where({ user_email: userEmail, question_id: questionId })
            .modify({
                easiness: this.DEFAULT_EASINESS,
                interval: this.DEFAULT_INTERVAL,
                repetitions: 0,
                next_review_date: new Date().toISOString().split('T')[0],
                last_reviewed: null,
                updated_at: new Date().toISOString()
            });
        return true;
    },

    /**
     * Remove item de repetição espaçada
     *
     * @param {string} userEmail - Email do usuário
     * @param {string} questionId - ID da questão
     * @returns {boolean} - Sucesso
     */
    async removeItem(userEmail, questionId) {
        const record = await db.spaced_repetition
            .where({ user_email: userEmail, question_id: questionId })
            .first();

        if (record) {
            await db.spaced_repetition.delete(record.id);
            return true;
        }
        return false;
    },

    /**
     * Gera deck de revisão inteligente
     *
     * @param {string} userEmail - Email do usuário
     * @param {number} targetSize - Tamanho alvo do deck
     * @returns {Array} - Deck de questões para revisar
     */
    async generateSmartDeck(userEmail, targetSize = 20) {
        const today = new Date().toISOString().split('T')[0];

        // Buscar todos os itens
        const allItems = await db.spaced_repetition
            .where('user_email')
            .equals(userEmail)
            .toArray();

        // Categorizar itens
        const overdue = allItems.filter(i => i.next_review_date < today);
        const dueToday = allItems.filter(i => i.next_review_date === today);
        const newItems = allItems.filter(i => i.repetitions === 0);
        const learningItems = allItems.filter(i => i.repetitions > 0 && i.repetitions < 3);

        // Priorizar: aprendendo > atrasados > novos > revisão normal
        let deck = [];

        // Adicionar itens aprendendo (mais críticos)
        deck = deck.concat(learningItems.slice(0, Math.ceil(targetSize * 0.3)));

        // Adicionar itens atrasados
        deck = deck.concat(overdue.slice(0, Math.ceil(targetSize * 0.3)));

        // Adicionar itens novos
        deck = deck.concat(newItems.slice(0, Math.ceil(targetSize * 0.2)));

        // Preencher com itens para revisar hoje
        const remaining = targetSize - deck.length;
        if (remaining > 0) {
            const available = dueToday.filter(i => !deck.find(d => d.id === i.id));
            deck = deck.concat(available.slice(0, remaining));
        }

        // Completar com questões aleatórias do banco se necessário
        if (deck.length < targetSize) {
            const existingIds = deck.map(d => d.question_id);
            const questions = await db.questions
                .filter(q => !existingIds.includes(q.id))
                .limit(targetSize - deck.length);

            for (const question of questions) {
                let record = await db.spaced_repetition
                    .where({ user_email: userEmail, question_id: question.id })
                    .first();

                if (!record) {
                    record = await this.createItem(userEmail, question);
                }

                deck.push(record);
            }
        }

        // Embaralhar deck
        deck = Helpers.shuffleArray(deck).slice(0, targetSize);

        // Buscar detalhes das questões
        const deckWithDetails = [];
        for (const item of deck) {
            const question = await db.questions.get(item.question_id);
            if (question) {
                deckWithDetails.push({
                    ...question,
                    repetition_data: {
                        easiness: item.easiness,
                        interval: item.interval,
                        repetitions: item.repetitions,
                        next_review: item.next_review_date
                    }
                });
            }
        }

        return deckWithDetails;
    }
};

// Exportar para uso global
window.SM2 = SM2;
