/**
 * QuizEngine - Motor de Quiz Compartilhado
 * Gerencia lógica comum para todos os tipos de simulados
 */

const QuizEngine = {
    // Estado do quiz
    estado: {
        questoes: [],
        questaoAtual: 0,
        respostas: [], // Array de {questaoId, resposta, correta}
        acertos: 0,
        erros: 0,
        tempoInicio: null,
        tempoTotal: 0,
        pausado: false,
        tipo: 'estudo' // estudo, prova, simulado, memoria, inverso, curiosidade
    },

    // Configurações do quiz
    config: {
        quantidade: 10,
        dificuldade: 'todos', // todos, facil, medio, dificil
        topicos: [], // Array de tópicos selecionados
        tempoLimite: null, // em segundos, null = sem limite
        comExplicacao: true,
        comLeitor: true
    },

    /**
     * Inicializa o quiz
     */
    init(tipo, config = {}) {
        this.estado.tipo = tipo;
        this.config = { ...this.config, ...config };
        this.estado.tempoInicio = Date.now();
        this.carregarQuestoes();
    },

    /**
     * Carrega questões aleatórias do banco de dados
     */
    carregarQuestoes() {
        try {
            // Carregar questões aprovadas do admin
            const questoesAdmin = JSON.parse(localStorage.getItem('admin_questoes') || '[]');
            
            // Carregar questões do usuário
            const questoesUsuario = JSON.parse(localStorage.getItem('user_questoes_privadas') || '[]');
            
            // Combinar questões
            let todasQuestoes = [...questoesAdmin, ...questoesUsuario];

            // Filtrar por dificuldade
            if (this.config.dificuldade !== 'todos') {
                todasQuestoes = todasQuestoes.filter(q => q.dificuldade === this.config.dificuldade);
            }

            // Filtrar por tópicos
            if (this.config.topicos.length > 0) {
                todasQuestoes = todasQuestoes.filter(q => 
                    this.config.topicos.includes(q.topico)
                );
            }

            // Embaralhar e selecionar quantidade
            this.estado.questoes = this.embaralhar(todasQuestoes)
                .slice(0, this.config.quantidade);

            // Inicializar array de respostas
            this.estado.respostas = this.estado.questoes.map(() => null);

            console.log(`[QuizEngine] ${this.estado.questoes.length} questões carregadas`);
        } catch (error) {
            console.error('[QuizEngine] Erro ao carregar questões:', error);
            this.estado.questoes = [];
        }
    },

    /**
     * Embaralha array (Fisher-Yates)
     */
    embaralhar(array) {
        const copia = [...array];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    },

    /**
     * Obtém questão atual
     */
    getQuestaoAtual() {
        return this.estado.questoes[this.estado.questaoAtual] || null;
    },

    /**
     * Responde questão
     */
    responder(respostaIndex) {
        const questao = this.getQuestaoAtual();
        if (!questao) return false;

        const respostaCorreta = questao.respostas[respostaIndex];
        const eCorreta = respostaCorreta.correta === true;

        // Registrar resposta
        this.estado.respostas[this.estado.questaoAtual] = {
            questaoId: questao.id,
            pergunta: questao.pergunta,
            respostaSelecionada: respostaIndex,
            respostaTexto: respostaCorreta.texto,
            correta: eCorreta,
            explicacao: questao.explicacao
        };

        // Atualizar contadores
        if (eCorreta) {
            this.estado.acertos++;
        } else {
            this.estado.erros++;
        }

        return eCorreta;
    },

    /**
     * Próxima questão
     */
    proximaQuestao() {
        if (this.estado.questaoAtual < this.estado.questoes.length - 1) {
            this.estado.questaoAtual++;
            return true;
        }
        return false;
    },

    /**
     * Questão anterior
     */
    questaoAnterior() {
        if (this.estado.questaoAtual > 0) {
            this.estado.questaoAtual--;
            return true;
        }
        return false;
    },

    /**
     * Ir para questão específica
     */
    irParaQuestao(indice) {
        if (indice >= 0 && indice < this.estado.questoes.length) {
            this.estado.questaoAtual = indice;
            return true;
        }
        return false;
    },

    /**
     * Finaliza o quiz
     */
    finalizar() {
        this.estado.tempoTotal = Math.round((Date.now() - this.estado.tempoInicio) / 1000);
        
        const resultado = {
            tipo: this.estado.tipo,
            dataFinal: new Date().toISOString(),
            acertos: this.estado.acertos,
            erros: this.estado.erros,
            total: this.estado.questoes.length,
            percentual: Math.round((this.estado.acertos / this.estado.questoes.length) * 100),
            tempoTotal: this.estado.tempoTotal,
            respostas: this.estado.respostas
        };

        // Salvar no histórico
        this.salvarHistorico(resultado);
        
        return resultado;
    },

    /**
     * Salva resultado no histórico
     */
    salvarHistorico(resultado) {
        try {
            const historico = JSON.parse(localStorage.getItem('user_historico_quizzes') || '[]');
            historico.push(resultado);
            localStorage.setItem('user_historico_quizzes', JSON.stringify(historico));
        } catch (error) {
            console.error('[QuizEngine] Erro ao salvar histórico:', error);
        }
    },

    /**
     * Obtém progresso
     */
    getProgresso() {
        return {
            atual: this.estado.questaoAtual + 1,
            total: this.estado.questoes.length,
            acertos: this.estado.acertos,
            erros: this.estado.erros,
            percentual: Math.round((this.estado.acertos / (this.estado.questaoAtual + 1)) * 100) || 0
        };
    },

    /**
     * Obtém tempo decorrido
     */
    getTempoDecorrido() {
        const decorrido = Math.round((Date.now() - this.estado.tempoInicio) / 1000);
        return {
            segundos: decorrido % 60,
            minutos: Math.floor(decorrido / 60) % 60,
            horas: Math.floor(decorrido / 3600),
            total: decorrido
        };
    },

    /**
     * Formata tempo para exibição
     */
    formatarTempo(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = segundos % 60;

        if (horas > 0) {
            return `${horas}h ${minutos}m ${segs}s`;
        } else if (minutos > 0) {
            return `${minutos}m ${segs}s`;
        } else {
            return `${segs}s`;
        }
    },

    /**
     * Obtém relatório final
     */
    getRelatorio() {
        return {
            tipo: this.estado.tipo,
            acertos: this.estado.acertos,
            erros: this.estado.erros,
            total: this.estado.questoes.length,
            percentual: Math.round((this.estado.acertos / this.estado.questoes.length) * 100),
            tempoTotal: this.estado.tempoTotal,
            tempoFormatado: this.formatarTempo(this.estado.tempoTotal),
            respostas: this.estado.respostas,
            desempenho: this.calcularDesempenho()
        };
    },

    /**
     * Calcula desempenho
     */
    calcularDesempenho() {
        const percentual = Math.round((this.estado.acertos / this.estado.questoes.length) * 100);
        
        if (percentual >= 90) return 'Excelente';
        if (percentual >= 80) return 'Muito Bom';
        if (percentual >= 70) return 'Bom';
        if (percentual >= 60) return 'Satisfatório';
        if (percentual >= 50) return 'Precisa Melhorar';
        return 'Insuficiente';
    }
};

// Exportar para uso global
window.QuizEngine = QuizEngine;
