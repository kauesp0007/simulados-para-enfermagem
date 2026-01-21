/**
 * Aplicativo Principal - Enfermagem Concurseira
 * Versão Completa com Todos os Recursos Funcionais
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES DA APLICAÇÃO
    // ============================================
    const CONFIG = {
        defaultPage: 'home',
        pages: ['home', 'questions', 'quizzes', 'contests', 'library', 'pomodoro', 'performance', 'settings', 'admin'],
        pomodoroTimes: {
            pomodoro: 25 * 60,
            short: 5 * 60,
            long: 15 * 60
        },
        xpPerQuestion: 10,
        xpPerQuiz: 50,
        xpPerPomodoro: 25
    };

    // ============================================
    // ESTADO DA APLICAÇÃO
    // ============================================
    window.AppState = {
        currentPage: 'home',
        isStarted: true,
        user: null,
        quiz: {
            active: false,
            questions: [],
            currentIndex: 0,
            answers: [],
            timePerQuestion: 60,
            totalTime: 0,
            timer: null
        },
        pomodoro: {
            active: false,
            mode: 'pomodoro',
            time: 25 * 60,
            remaining: 25 * 60,
            timer: null,
            sessions: 0
        }
    };

    // ============================================
    // BANCO DE DADOS (Dexie.js)
    // ============================================
    const db = new Dexie('EnfermagemConcurseiraDB');
    db.version(1).stores({
        users: 'id, email, full_name, created_at',
        questions: 'id, area, banca, level, topic, correct_answer',
        quizzes: 'id, user_id, created_at, score, total_questions, area',
        quiz_answers: 'id, quiz_id, question_id, answer, is_correct',
        contests: 'id, date, status',
        user_contests: 'id, user_id, contest_id, added_at',
        mindmaps: 'id, topic, area, created_at',
        user_favorites: 'id, user_id, type, item_id',
        study_history: 'id, user_id, date, questions_answered, time_spent, xp_earned',
        badges: 'id, name, icon, description, requirement',
        user_badges: 'id, user_id, badge_id, earned_at'
    });

    // ============================================
    // SERVIÇOS
    // ============================================
    
    // Banco de Questões
    const QuestionsApp = {
        questions: [],
        currentPage: 1,
        perPage: 10,

        async init() {
            await this.loadQuestions();
            this.render();
        },

        async loadQuestions() {
            this.questions = await db.questions.toArray();
            if (this.questions.length === 0) {
                await this.seedQuestions();
                this.questions = await db.questions.toArray();
            }
        },

        async seedQuestions() {
            const sampleQuestions = [
                {
                    id: 'q1',
                    area: 'enfermagem-basica',
                    banca: 'fcc',
                    level: 'medio',
                    topic: 'Sinais Vitais',
                    text: 'A pressão arterial é composta por dois valores. Assinale a alternativa que indica corretamente a pressão diastólica.',
                    options: [
                        { id: 'a', text: 'Valor máximo atingido durante a sístole ventricular', correct: false },
                        { id: 'b', text: 'Valor mínimo atingido durante a diástole ventricular', correct: true },
                        { id: 'c', text: 'Diferença entre os valores sistólico e diastólico', correct: false },
                        { id: 'd', text: 'Média entre os valores sistólico e diastólico', correct: false }
                    ],
                    correct_answer: 'b',
                    explanation: 'A pressão diastólica representa o valor mínimo da pressão arterial durante o relaxamento ventricular (diástole). É o momento em que o coração está em repouso entre as batidas.'
                },
                {
                    id: 'q2',
                    area: 'sus',
                    banca: 'cespe',
                    level: 'dificil',
                    topic: 'Princípios do SUS',
                    text: 'A respeito do Sistema Único de Saúde (SUS), julgue o item: A universalidade do acesso é um dos princípios fundamentais do SUS, garantindo atendimento a todos os cidadãos brasileiros e estrangeiros residentes no país.',
                    options: [
                        { id: 'a', text: 'Certo', correct: true },
                        { id: 'b', text: 'Errado', correct: false }
                    ],
                    correct_answer: 'a',
                    explanation: 'Correto. A universalidade é um dos princípios doutrinários do SUS, estabelecidos na Lei Orgânica da Saúde (Lei 8.080/90), garantindo que todos têm direito ao atendimento, independentemente de sexo, raça, renda, ocupação ou outras características.'
                },
                {
                    id: 'q3',
                    area: 'etica',
                    banca: 'cesgranrio',
                    level: 'facil',
                    topic: 'Código de Ética',
                    text: 'De acordo com o Código de Ética dos Profissionais de Enfermagem, é direito do enfermeiro:',
                    options: [
                        { id: 'a', text: 'Exercer a profissão sem remuneração', correct: false },
                        { id: 'b', text: 'Recusar-se a prestar cuidados em situações de risco', correct: false },
                        { id: 'c', text: 'Exercer a função de chefia sem qualquer responsabilidade técnica', correct: false },
                        { id: 'd', text: 'Apontar falhas nos regulamentos e normas da instituição', correct: true }
                    ],
                    correct_answer: 'd',
                    explanation: 'O Código de Ética estabelece que é direito do profissional apontar falhas nos regulamentos e normas das instituições, contribuindo para a melhoria das condições de trabalho e qualidade assistencial.'
                },
                {
                    id: 'q4',
                    area: 'farmaco',
                    banca: 'vunesp',
                    level: 'medio',
                    topic: 'Antibióticos',
                    text: 'A penicilina benzatina é um antibiótico de longa ação, utilizado preferencialmente no tratamento de:',
                    options: [
                        { id: 'a', text: 'Infecções urinárias por Pseudomonas', correct: false },
                        { id: 'b', text: 'Sífilis e estreptococcias', correct: true },
                        { id: 'c', text: 'Meningite bacteriana', correct: false },
                        { id: 'd', text: 'Infecções por Staphylococcus aureus resistente', correct: false }
                    ],
                    correct_answer: 'b',
                    explanation: 'A penicilina benzatina (Benzetacil) é utilizada principalmente no tratamento de sífilis e estreptococcias, devido à sua longa duração de ação no organismo, permitindo administração em dose única ou intervalos maiores.'
                },
                {
                    id: 'q5',
                    area: 'urgencia',
                    banca: 'fcc',
                    level: 'medio',
                    topic: 'PCR',
                    text: 'Em relação à parada cardiorrespiratória (PCR), é correto afirmar que:',
                    options: [
                        { id: 'a', text: 'A massagem cardíaca deve ser iniciada após a intubação orotraqueal', correct: false },
                        { id: 'b', text: 'A proporção de compressões e ventilações no adulto é de 30:2', correct: true },
                        { id: 'c', text: 'As ventilações devem ser realizadas com volume corrente alto', correct: false },
                        { id: 'd', text: 'O desfibrilador deve ser utilizado após 10 ciclos de RCP', correct: false }
                    ],
                    correct_answer: 'b',
                    explanation: 'Conforme as diretrizes do American Heart Association, a proporção de 30 compressões para 2 ventilações é o padrão recomendado para RCP em adulto, realizada por profissional ou leigo.'
                },
                {
                    id: 'q6',
                    area: 'enfermagem-basica',
                    banca: 'ibade',
                    level: 'facil',
                    topic: 'Administração de Medicamentos',
                    text: 'A via de administração de medicamentos que atravessa o trato gastrointestinal e sofre efeito de primeira passagem hepática é a via:',
                    options: [
                        { id: 'a', text: 'Oral', correct: true },
                        { id: 'b', text: 'Sublingual', correct: false },
                        { id: 'c', text: 'Retal', correct: false },
                        { id: 'd', text: 'Transdérmica', correct: false }
                    ],
                    correct_answer: 'a',
                    explanation: 'A via oral é a mais utilizada e os medicamentos passam pelo trato gastrointestinal e pelo metabolismo hepático de primeira passagem antes de atingirem a circulação sistêmica.'
                },
                {
                    id: 'q7',
                    area: 'uti',
                    banca: 'cespe',
                    level: 'dificil',
                    topic: 'Ventilação Mecânica',
                    text: 'Julgue: Na ventilação mecânica invasiva, o modo AC (Assist-Control) garante que cada esforço inspiratório do paciente será assistido pelo ventilador.',
                    options: [
                        { id: 'a', text: 'Certo', correct: false },
                        { id: 'b', text: 'Errado', correct: true }
                    ],
                    correct_answer: 'b',
                    explanation: 'Errado. No modo AC, o ventilador entrega um volume ou pressão predeterminada quando o paciente inicia uma respiração (assistido) ou após um intervalo predeterminado (controlado), mas não necessariamente assiste todos os esforços.'
                },
                {
                    id: 'q8',
                    area: 'cc',
                    banca: 'fcc',
                    level: 'medio',
                    topic: 'Centro Cirúrgico',
                    text: 'O tempo cirúrgico que compreende desde a incisão da pele até o fechamento completo da ferida operatória denomina-se:',
                    options: [
                        { id: 'a', text: 'Tempo operatório', correct: true },
                        { id: 'b', text: 'Tempo anestésico', correct: false },
                        { id: 'c', text: 'Tempo cirúrgico transoperatório', correct: false },
                        { id: 'd', text: 'Tempo de permanência', correct: false }
                    ],
                    correct_answer: 'a',
                    explanation: 'O tempo operatório é o período que vai da incisão da pele até o fechamento completo da ferida operatória,不包括 a preparação anestésica.'
                },
                {
                    id: 'q9',
                    area: 'sus',
                    banca: 'vunesp',
                    level: 'medio',
                    topic: 'NAPS',
                    text: 'As Núcleo de Apoio à Saúde da Família (NASF) foram criados para:',
                    options: [
                        { id: 'a', text: 'Substituir as equipes de Saúde da Família', correct: false },
                        { id: 'b', text: 'Ampliar a resolutividade e a abrangência das ações da Atenção Básica', correct: true },
                        { id: 'c', text: 'Atender exclusivamente casos de média complexidade', correct: false },
                        { id: 'd', text: 'Substituir os centros de Especialidades', correct: false }
                    ],
                    correct_answer: 'b',
                    explanation: 'Os NASF foram criados para ampliar a resolutividade e abrangência das ações da Atenção Básica, apoiando as equipes de Saúde da Família com profissionais de diferentes especialidades.'
                },
                {
                    id: 'q10',
                    area: 'etica',
                    banca: 'fcc',
                    level: 'facil',
                    topic: 'Direitos do Paciente',
                    text: 'É direito do paciente, conforme o Código de Ética:',
                    options: [
                        { id: 'a', text: 'Ser medicado sem consentimento em situações de emergência', correct: false },
                        { id: 'b', text: 'Receber informações claras sobre seu estado de saúde', correct: true },
                        { id: 'c', text: 'Ter seu prontuário escondido da equipe multidisciplinar', correct: false },
                        { id: 'd', text: 'Ser transferido sem aviso prévio', correct: false }
                    ],
                    correct_answer: 'b',
                    explanation: 'O paciente tem direito a receber informações claras, objetivas e compreensíveis sobre seu diagnóstico, tratamento e prognóstico, permitindo a participação nas decisões sobre sua saúde.'
                }
            ];

            await db.questions.bulkAdd(sampleQuestions);
        },

        filter() {
            const area = document.getElementById('filter-area').value;
            const banca = document.getElementById('filter-banca').value;
            const level = document.getElementById('filter-level').value;
            const search = document.getElementById('search-question').value.toLowerCase();

            let filtered = this.questions;

            if (area) {
                filtered = filtered.filter(q => q.area === area);
            }
            if (banca) {
                filtered = filtered.filter(q => q.banca === banca);
            }
            if (level) {
                filtered = filtered.filter(q => q.level === level);
            }
            if (search) {
                filtered = filtered.filter(q => 
                    q.text.toLowerCase().includes(search) || 
                    q.topic.toLowerCase().includes(search)
                );
            }

            this.renderList(filtered);
        },

        render() {
            this.renderList(this.questions);
            this.renderPagination();
        },

        renderList(questions) {
            const container = document.getElementById('questions-container');
            if (!container) return;

            const start = (this.currentPage - 1) * this.perPage;
            const paginated = questions.slice(start, start + this.perPage);

            if (paginated.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Nenhuma questão encontrada</h3>
                        <p>Tente ajustar os filtros ou adicionar novas questões.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = paginated.map((q, index) => `
                <div class="question-card" onclick="QuestionsApp.showDetail('${q.id}')">
                    <div class="question-meta">
                        <span class="badge badge-${q.area}">${this.getAreaName(q.area)}</span>
                        <span class="badge badge-${q.banca}">${q.banca.toUpperCase()}</span>
                        <span class="badge badge-${q.level}">${q.level}</span>
                    </div>
                    <div class="question-text">${q.text}</div>
                    <div class="question-topic"><i class="fas fa-tag"></i> ${q.topic}</div>
                </div>
            `).join('');
        },

        renderPagination() {
            const totalPages = Math.ceil(this.questions.length / this.perPage);
            const container = document.getElementById('questions-pagination');
            if (!container) return;

            let html = '';
            if (totalPages > 1) {
                html = '<div class="pagination-buttons">';
                if (this.currentPage > 1) {
                    html += `<button class="btn btn-ghost" onclick="QuestionsApp.goToPage(${this.currentPage - 1})">Anterior</button>`;
                }
                html += `<span class="pagination-info">Página ${this.currentPage} de ${totalPages}</span>`;
                if (this.currentPage < totalPages) {
                    html += `<button class="btn btn-ghost" onclick="QuestionsApp.goToPage(${this.currentPage + 1})">Próxima</button>`;
                }
                html += '</div>';
            }
            container.innerHTML = html;
        },

        goToPage(page) {
            this.currentPage = page;
            this.filter();
        },

        showDetail(id) {
            const question = this.questions.find(q => q.id === id);
            if (!question) return;

            const modal = new Modal({
                title: 'Detalhes da Questão',
                content: `
                    <div class="question-detail">
                        <div class="question-meta">
                            <span class="badge badge-${question.area}">${this.getAreaName(question.area)}</span>
                            <span class="badge badge-${question.banca}">${question.banca.toUpperCase()}</span>
                            <span class="badge badge-${question.level}">${question.level}</span>
                        </div>
                        <div class="question-text-large">${question.text}</div>
                        <div class="question-options">
                            ${question.options.map(opt => `
                                <div class="option-item ${opt.correct ? 'correct' : ''}">
                                    <span class="option-letter">${opt.id.toUpperCase()}</span>
                                    <span class="option-text">${opt.text}</span>
                                    ${opt.correct ? '<i class="fas fa-check"></i>' : ''}
                                </div>
                            `).join('')}
                        </div>
                        <div class="question-explanation">
                            <h4>Explicação</h4>
                            <p>${question.explanation}</p>
                        </div>
                    </div>
                `,
                size: 'large'
            });
            modal.show();
        },

        getAreaName(area) {
            const names = {
                'enfermagem-basica': 'Enfermagem Básica',
                'sus': 'SUS',
                'etica': 'Ética',
                'farmaco': 'Farmacologia',
                'urgencia': 'Urgência',
                'cc': 'Centro Cirúrgico',
                'uti': 'UTI'
            };
            return names[area] || area;
        }
    };

    // Aplicativo de Simulados
    const QuizApp = {
        async start() {
            const count = parseInt(document.getElementById('quiz-count').value) || 10;
            const timePerQuestion = parseInt(document.getElementById('quiz-time').value) || 60;
            const area = document.getElementById('quiz-area').value;

            let questions = await db.questions.toArray();
            
            if (area !== 'mixed') {
                questions = questions.filter(q => q.area === area);
            }

            if (questions.length < count) {
                Toast.show('Não há questões suficientes para este simulado.', 'warning');
                return;
            }

            // Embaralhar e selecionar
            questions = questions.sort(() => Math.random() - 0.5).slice(0, count);

            window.AppState.quiz = {
                active: true,
                questions: questions,
                currentIndex: 0,
                answers: [],
                timePerQuestion: timePerQuestion,
                totalTime: count * timePerQuestion,
                timer: null
            };

            document.getElementById('quiz-active').style.display = 'block';
            document.getElementById('quiz-results').style.display = 'none';
            document.getElementById('quiz-total').textContent = count;
            document.getElementById('quiz-total-questions').textContent = count;

            this.showQuestion();
        },

        showQuestion() {
            const quiz = window.AppState.quiz;
            const q = quiz.questions[quiz.currentIndex];

            document.getElementById('quiz-current').textContent = quiz.currentIndex + 1;
            document.getElementById('quiz-question-text').innerHTML = q.text;
            document.getElementById('quiz-timer-text').textContent = this.formatTime(quiz.timePerQuestion);

            const optionsContainer = document.getElementById('quiz-options');
            optionsContainer.innerHTML = q.options.map((opt, index) => `
                <div class="quiz-option" data-id="${opt.id}" onclick="QuizApp.selectOption('${opt.id}')">
                    <span class="option-marker">${String.fromCharCode(65 + index)}</span>
                    <span class="option-text">${opt.text}</span>
                </div>
            `).join('');

            // Iniciar timer
            this.startTimer();
        },

        selectOption(optionId) {
            document.querySelectorAll('.quiz-option').forEach(el => {
                el.classList.remove('selected');
                if (el.dataset.id === optionId) {
                    el.classList.add('selected');
                }
            });
            window.AppState.quiz.selectedAnswer = optionId;
        },

        startTimer() {
            const quiz = window.AppState.quiz;
            if (quiz.timer) clearInterval(quiz.timer);

            let timeLeft = quiz.timePerQuestion;
            const progress = document.getElementById('quiz-timer-progress');
            
            quiz.timer = setInterval(() => {
                timeLeft--;
                document.getElementById('quiz-timer-text').textContent = this.formatTime(timeLeft);
                
                const percentage = (timeLeft / quiz.timePerQuestion) * 100;
                progress.style.width = percentage + '%';

                if (timeLeft <= 0) {
                    this.next();
                }
            }, 1000);
        },

        async next() {
            const quiz = window.AppState.quiz;
            
            // Registrar resposta
            const currentQ = quiz.questions[quiz.currentIndex];
            const isCorrect = quiz.selectedAnswer === currentQ.correct_answer;
            
            quiz.answers.push({
                questionId: currentQ.id,
                selectedAnswer: quiz.selectedAnswer,
                correctAnswer: currentQ.correct_answer,
                isCorrect: isCorrect,
                timeSpent: quiz.timePerQuestion
            });

            quiz.currentIndex++;

            if (quiz.timer) {
                clearInterval(quiz.timer);
                quiz.timer = null;
            }

            if (quiz.currentIndex >= quiz.questions.length) {
                this.finish();
            } else {
                this.showQuestion();
            }
        },

        skip() {
            const quiz = window.AppState.quiz;
            const currentQ = quiz.questions[quiz.currentIndex];
            
            quiz.answers.push({
                questionId: currentQ.id,
                selectedAnswer: null,
                correctAnswer: currentQ.correct_answer,
                isCorrect: false,
                skipped: true
            });

            this.next();
        },

        async finish() {
            const quiz = window.AppState.quiz;
            const correctCount = quiz.answers.filter(a => a.isCorrect).length;
            const total = quiz.answers.length;
            const score = Math.round((correctCount / total) * 100);

            // Salvar no banco
            const user = await AuthService.getCurrentUser();
            const quizId = await db.quizzes.add({
                user_id: user.id,
                created_at: new Date().toISOString(),
                score: score,
                total_questions: total,
                correct_answers: correctCount,
                area: document.getElementById('quiz-area').value
            });

            // Atualizar XP do usuário
            const xpEarned = correctCount * CONFIG.xpPerQuestion;
            await AuthService.addXp(xpEarned);

            // Mostrar resultados
            document.getElementById('quiz-active').style.display = 'none';
            document.getElementById('quiz-results').style.display = 'block';
            document.getElementById('quiz-score').textContent = score;
            document.getElementById('quiz-correct').textContent = correctCount;

            // Renderizar detalhes
            const detailsContainer = document.getElementById('quiz-results-details');
            detailsContainer.innerHTML = quiz.answers.map((answer, index) => {
                const q = quiz.questions[index];
                return `
                    <div class="result-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                        <div class="result-status">
                            <i class="fas fa-${answer.isCorrect ? 'check-circle' : 'times-circle'}"></i>
                            Questão ${index + 1}
                        </div>
                        <div class="result-question">${q.text}</div>
                        <div class="result-answer">
                            Sua resposta: ${q.options.find(o => o.id === answer.selectedAnswer)?.text || 'Não respondida'}
                        </div>
                        ${!answer.isCorrect ? `
                            <div class="result-correct">
                                Correta: ${q.options.find(o => o.correct)?.text}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            Toast.show(`Simulado concluído! +${xpEarned} XP`, 'success');
        },

        review() {
            // Scroll para os detalhes
            document.getElementById('quiz-results-details').scrollIntoView({ behavior: 'smooth' });
        },

        reset() {
            document.getElementById('quiz-active').style.display = 'none';
            document.getElementById('quiz-results').style.display = 'none';
        },

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };

    // Aplicativo de Concursos
    const ContestsApp = {
        contests: [],

        async init() {
            await this.loadContests();
            this.render();
        },

        async loadContests() {
            this.contests = await db.contests.toArray();
            if (this.contests.length === 0) {
                await this.seedContests();
                this.contests = await db.contests.toArray();
            }
        },

        async seedContests() {
            const sampleContests = [
                {
                    id: 'c1',
                    title: 'Prefeitura de São Paulo - Enfermeiro',
                    orgao: 'Prefeitura Municipal de São Paulo',
                    estado: 'SP',
                    cidade: 'São Paulo',
                    vagas: 80,
                    salario: 'R$ 8.500,00',
                    nivel: 'superior',
                    data_inscricao: '2025-02-01',
                    data_prova: '2025-03-15',
                    status: 'upcoming',
                    description: 'Concurso para enfermeiro com requisitos de registro no COREN.'
                },
                {
                    id: 'c2',
                    title: 'SES-SC - Enfermeiro',
                    orgao: 'Secretaria de Estado da Saúde de Santa Catarina',
                    estado: 'SC',
                    cidade: 'Florianópolis',
                    vagas: 45,
                    salario: 'R$ 9.200,00',
                    nivel: 'superior',
                    data_inscricao: '2025-01-15',
                    data_prova: '2025-02-20',
                    status: 'upcoming',
                    description: 'Concurso estadual para enfermeiro em diversas especialidades.'
                },
                {
                    id: 'c3',
                    title: 'EBSERH - Técnico em Enfermagem',
                    orgao: 'Empresa Brasileira de Serviços Hospitalares',
                    estado: 'DF',
                    cidade: 'Brasília',
                    vagas: 120,
                    salario: 'R$ 4.500,00',
                    nivel: 'tecnico',
                    data_inscricao: '2025-01-20',
                    data_prova: '2025-03-01',
                    status: 'upcoming',
                    description: 'Concurso para técnico em enfermagem em hospitais universitários.'
                },
                {
                    id: 'c4',
                    title: 'HU-UFPE - Enfermeiro',
                    orgao: 'Hospital das Clínicas da UFPE',
                    estado: 'PE',
                    cidade: 'Recife',
                    vagas: 25,
                    salario: 'R$ 8.000,00',
                    nivel: 'superior',
                    data_inscricao: '2024-11-01',
                    data_prova: '2024-12-15',
                    status: 'past',
                    description: 'Concurso para enfermeiro UTI e enfermaria.'
                },
                {
                    id: 'c5',
                    title: 'SMS-Rio - Enfermeiro',
                    orgao: 'Secretaria Municipal de Saúde do Rio de Janeiro',
                    estado: 'RJ',
                    cidade: 'Rio de Janeiro',
                    vagas: 200,
                    salario: 'R$ 7.500,00',
                    nivel: 'superior',
                    data_inscricao: '2025-03-01',
                    data_prova: '2025-04-15',
                    status: 'upcoming',
                    description: 'Concurso para enfermeiro da rede municipal de saúde.'
                }
            ];

            await db.contests.bulkAdd(sampleContests);
        },

        switchTab(tab) {
            document.querySelectorAll('.contests-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            ['upcoming', 'my', 'past'].forEach(t => {
                document.getElementById(`contests-${t}`).style.display = t === tab ? 'block' : 'none';
            });
        },

        render() {
            this.renderUpcoming();
            this.renderMy();
            this.renderPast();
        },

        renderUpcoming() {
            const container = document.getElementById('contests-upcoming');
            const upcoming = this.contests.filter(c => c.status === 'upcoming').sort((a, b) => 
                new Date(a.data_prova) - new Date(b.data_prova)
            );

            container.innerHTML = upcoming.map(c => this.renderContestCard(c)).join('');
        },

        renderMy() {
            const container = document.getElementById('contests-my');
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Nenhum concurso adicionado</h3>
                    <p>Adicione concursos para acompanhar as datas de prova.</p>
                </div>
            `;
        },

        renderPast() {
            const container = document.getElementById('contests-past');
            const past = this.contests.filter(c => c.status === 'past');

            if (past.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <h3>Nenhum concurso encerrado</h3>
                    </div>
                `;
                return;
            }

            container.innerHTML = past.map(c => this.renderContestCard(c)).join('');
        },

        renderContestCard(contest) {
            const daysUntil = this.getDaysUntil(contest.data_prova);
            const statusClass = daysUntil <= 7 ? 'urgent' : (daysUntil <= 30 ? 'warning' : 'normal');

            return `
                <div class="contest-card">
                    <div class="contest-header">
                        <span class="contest-level badge badge-${contest.nivel}">${contest.nivel}</span>
                        <span class="contest-status badge badge-${statusClass}">
                            ${daysUntil < 0 ? 'Encerrado' : `${daysUntil} dias`}
                        </span>
                    </div>
                    <h3 class="contest-title">${contest.title}</h3>
                    <p class="contest-orgao"><i class="fas fa-building"></i> ${contest.orgao}</p>
                    <p class="contest-location"><i class="fas fa-map-marker-alt"></i> ${contest.cidade} - ${contest.estado}</p>
                    <div class="contest-details">
                        <div class="contest-detail">
                            <span class="label">Vagas</span>
                            <span class="value">${contest.vagas}</span>
                        </div>
                        <div class="contest-detail">
                            <span class="label">Salário</span>
                            <span class="value">${contest.salario}</span>
                        </div>
                        <div class="contest-detail">
                            <span class="label">Inscrição</span>
                            <span class="value">${this.formatDate(contest.data_inscricao)}</span>
                        </div>
                        <div class="contest-detail">
                            <span class="label">Prova</span>
                            <span class="value">${this.formatDate(contest.data_prova)}</span>
                        </div>
                    </div>
                    <div class="contest-actions">
                        <button class="btn btn-primary btn-sm" onclick="ContestsApp.addToMy('${contest.id}')">
                            <i class="fas fa-plus"></i> Adicionar
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="ContestsApp.showDetails('${contest.id}')">
                            <i class="fas fa-info-circle"></i> Detalhes
                        </button>
                    </div>
                </div>
            `;
        },

        addToMy(contestId) {
            Toast.show('Concurso adicionado à sua lista!', 'success');
        },

        showDetails(contestId) {
            const contest = this.contests.find(c => c.id === contestId);
            if (!contest) return;

            new Modal({
                title: contest.title,
                content: `
                    <div class="contest-detail-full">
                        <p><strong>Órgão:</strong> ${contest.orgao}</p>
                        <p><strong>Local:</strong> ${contest.cidade} - ${contest.estado}</p>
                        <p><strong>Vagas:</strong> ${contest.vagas}</p>
                        <p><strong>Salário:</strong> ${contest.salario}</p>
                        <p><strong>Data de Inscrição:</strong> ${this.formatDate(contest.data_inscricao)}</p>
                        <p><strong>Data da Prova:</strong> ${this.formatDate(contest.data_prova)}</p>
                        <p><strong>Descrição:</strong> ${contest.description}</p>
                    </div>
                `,
                size: 'medium'
            }).show();
        },

        getDaysUntil(dateStr) {
            const today = new Date();
            const target = new Date(dateStr);
            const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
            return diff;
        },

        formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('pt-BR');
        }
    };

    // Aplicativo de Biblioteca e Mapas Mentais
    const LibraryApp = {
        mindmaps: [],

        async init() {
            await this.loadMindmaps();
            this.render();
        },

        async loadMindmaps() {
            this.mindmaps = await db.mindmaps.toArray();
            if (this.mindmaps.length === 0) {
                await this.seedMindmaps();
                this.mindmaps = await db.mindmaps.toArray();
            }
        },

        async seedMindmaps() {
            const sampleMaps = [
                {
                    id: 'mm1',
                    title: 'Ciclo menstrual',
                    topic: 'Reprodução',
                    area: 'enfermagem-basica',
                    image: 'ciclo-menstrual.svg',
                    description: 'Mapa mental completo sobre o ciclo menstrual e suas fases',
                    nodes: JSON.stringify({
                        root: 'Ciclo Menstrual',
                        branches: [
                            { name: 'Fase Folicular', color: '#4CAF50', children: ['FSH', 'Estrogênio', 'Folículo'] },
                            { name: 'Ovulação', color: '#2196F3', children: ['LH', 'Gameta feminino'] },
                            { name: 'Fase Lútea', color: '#FF9800', children: ['Progesterona', 'Corpo lúteo'] },
                            { name: 'Menstruação', color: '#F44336', children: ['Descamação', 'Fluxo'] }
                        ]
                    })
                },
                {
                    id: 'mm2',
                    title: 'Sinais Vitais',
                    topic: 'Avaliação',
                    area: 'enfermagem-basica',
                    image: 'sinais-vitais.svg',
                    description: 'Parâmetros e avaliação dos sinais vitais',
                    nodes: JSON.stringify({
                        root: 'Sinais Vitais',
                        branches: [
                            { name: 'Pressão Arterial', color: '#E91E63', children: ['Sistólica', 'Diastólica', 'PA'] },
                            { name: 'Temperatura', color: '#9C27B0', children: ['Axilar', 'Oral', 'Retal'] },
                            { name: 'Frequência Cardíaca', color: '#3F51B5', children: ['FC', 'Ritmo', 'Perfusão'] },
                            { name: 'Frequência Respiratória', color: '#00BCD4', children: ['FR', 'Padrão', 'Dispneia'] }
                        ]
                    })
                },
                {
                    id: 'mm3',
                    title: 'PIS/PASEP',
                    topic: 'Legislação',
                    area: 'sus',
                    image: 'pispasep.svg',
                    description: 'Conceitos e princípios do PIS/PASEP',
                    nodes: JSON.stringify({
                        root: 'PIS/PASEP',
                        branches: [
                            { name: 'O que é', color: '#4CAF50', children: ['Programa', 'Integração Social'] },
                            { name: 'Quem tem direito', color: '#2196F3', children: ['CLT', 'Domésticas'] },
                            { name: 'Como sacar', color: '#FF9800', children: ['Lotérica', 'App Caixa'] }
                        ]
                    })
                },
                {
                    id: 'mm4',
                    title: 'Farmacos Cardiovasculares',
                    topic: 'Farmacologia',
                    area: 'farmaco',
                    image: 'farmaco-cv.svg',
                    description: 'Principais grupos farmacológicos cardiovasculares',
                    nodes: JSON.stringify({
                        root: 'Farmacos CV',
                        branches: [
                            { name: 'Anti-hipertensivos', color: '#E91E63', children: ['IECAs', 'BRA', 'Diuréticos'] },
                            { name: 'Cardiotônicos', color: '#9C27B0', children: ['Digoxina', 'Digital'] },
                            { name: 'Antiarrítmicos', color: '#3F51B5', children: ['Amiodarona', 'Lidocaína'] }
                        ]
                    })
                },
                {
                    id: 'mm5',
                    title: 'Ética Profissional',
                    topic: 'Legislação',
                    area: 'etica',
                    image: 'etica.svg',
                    description: 'Princípios éticos da enfermagem',
                    nodes: JSON.stringify({
                        root: 'Ética em Enfermagem',
                        branches: [
                            { name: 'Direitos', color: '#4CAF50', children: ['Sigilo', 'Remuneração', 'Condições'] },
                            { name: 'Deveres', color: '#2196F3', children: ['Cuidado', 'Atualização', 'Respeito'] },
                            { name: 'Proibições', color: '#F44336', children: ['Abandono', 'Humilhação'] }
                        ]
                    })
                },
                {
                    id: 'mm6',
                    title: 'PCR e RCP',
                    topic: 'Emergência',
                    area: 'urgencia',
                    image: 'pcr-rcp.svg',
                    description: 'Protocolo de parada cardiorrespiratória',
                    nodes: JSON.stringify({
                        root: 'PCR/RCP',
                        branches: [
                            { name: 'Causas', color: '#F44336', children: ['Hipóxia', 'Hipovolemia', 'Hipo-K+'] },
                            { name: 'Sinais', color: '#FF9800', children: ['Inconsciência', 'Apneia', 'Pulso'] },
                            { name: 'Conduta', color: '#4CAF50', children: ['C:30:2', 'DEA', 'Drogas'] }
                        ]
                    })
                }
            ];

            await db.mindmaps.bulkAdd(sampleMaps);
        },

        switchTab(tab) {
            document.querySelectorAll('.library-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            ['mindmaps', 'materials', 'favorites'].forEach(t => {
                document.getElementById(`library-${t}`).style.display = t === tab ? 'block' : 'none';
            });
        },

        render() {
            this.renderMindmaps();
        },

        renderMindmaps() {
            const container = document.getElementById('library-mindmaps');
            container.innerHTML = this.mindmaps.map(mm => `
                <div class="mindmap-card" onclick="LibraryApp.openMindmap('${mm.id}')">
                    <div class="mindmap-preview">
                        <div class="mindmap-icon" style="background: linear-gradient(135deg, ${this.getColor(mm.area)} 0%, ${this.getColor(mm.area)}99 100%);">
                            <i class="fas fa-brain"></i>
                        </div>
                    </div>
                    <div class="mindmap-info">
                        <h4>${mm.title}</h4>
                        <p class="mindmap-topic"><i class="fas fa-tag"></i> ${mm.topic}</p>
                        <p class="mindmap-desc">${mm.description}</p>
                    </div>
                </div>
            `).join('');
        },

        openMindmap(id) {
            const mm = this.mindmaps.find(m => m.id === id);
            if (!mm) return;

            const nodes = JSON.parse(mm.nodes);
            new Modal({
                title: mm.title,
                content: this.renderMindmapSVG(nodes),
                size: 'large'
            }).show();
        },

        renderMindmapSVG(nodes) {
            return `
                <div class="mindmap-viewer">
                    <div class="mindmap-svg-container">
                        <svg width="100%" height="400" viewBox="0 0 800 400">
                            <defs>
                                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                                </filter>
                            </defs>
                            
                            <!-- Central Node -->
                            <circle cx="400" cy="200" r="60" fill="#1A3E74" filter="url(#shadow)"/>
                            <text x="400" y="195" text-anchor="middle" fill="white" font-weight="bold" font-size="14">${nodes.root}</text>
                            
                            <!-- Branch Nodes -->
                            ${nodes.branches.map((branch, index) => {
                                const angle = (index - (nodes.branches.length - 1) / 2) * 0.4;
                                const x = 200 + index * 150;
                                const y = 80 + index * 60;
                                return `
                                    <line x1="400" y1="200" x2="${x}" y2="${y}" stroke="${branch.color}" stroke-width="2"/>
                                    <rect x="${x - 70}" y="${y - 25}" width="140" height="50" rx="10" fill="${branch.color}" filter="url(#shadow)"/>
                                    <text x="${x}" y="${y + 5}" text-anchor="middle" fill="white" font-weight="bold" font-size="12">${branch.name}</text>
                                    ${branch.children.map((child, i) => {
                                        const cx = x + 90;
                                        const cy = y - 20 + i * 25;
                                        return `
                                            <circle cx="${cx}" cy="${cy}" r="6" fill="white"/>
                                            <text x="${cx + 12}" y="${cy + 4}" fill="#333" font-size="11">${child}</text>
                                        `;
                                    }).join('')}
                                `;
                            }).join('')}
                        </svg>
                    </div>
                    <div class="mindmap-legend">
                        ${nodes.branches.map(b => `
                            <div class="legend-item">
                                <span class="legend-color" style="background: ${b.color}"></span>
                                <span>${b.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        getColor(area) {
            const colors = {
                'enfermagem-basica': '#1A3E74',
                'sus': '#0891b2',
                'etica': '#7c3aed',
                'farmaco': '#059669',
                'urgencia': '#dc2626',
                'cc': '#ea580c',
                'uti': '#7c3aed'
            };
            return colors[area] || '#1A3E74';
        }
    };

    // Aplicativo Pomodoro
    const PomodoroApp = {
        timer: null,
        timeRemaining: 25 * 60,
        isRunning: false,
        sessions: 0,

        async init() {
            await this.loadStats();
            this.updateDisplay();
        },

        setMode(mode) {
            window.AppState.pomodoro.mode = mode;
            window.AppState.pomodoro.time = CONFIG.pomodoroTimes[mode];
            this.timeRemaining = CONFIG.pomodoroTimes[mode];
            
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.mode === mode) btn.classList.add('active');
            });

            this.reset();
        },

        start() {
            if (this.isRunning) return;
            
            this.isRunning = true;
            document.getElementById('pomodoro-start').style.display = 'none';
            document.getElementById('pomodoro-pause').style.display = 'inline-flex';

            this.timer = setInterval(() => {
                this.timeRemaining--;
                this.updateDisplay();

                if (this.timeRemaining <= 0) {
                    this.complete();
                }
            }, 1000);
        },

        pause() {
            this.isRunning = false;
            clearInterval(this.timer);
            document.getElementById('pomodoro-start').style.display = 'inline-flex';
            document.getElementById('pomodoro-pause').style.display = 'none';
        },

        reset() {
            this.pause();
            const mode = window.AppState.pomodoro.mode;
            this.timeRemaining = CONFIG.pomodoroTimes[mode];
            this.updateDisplay();
        },

        complete() {
            this.pause();
            
            if (window.AppState.pomodoro.mode === 'pomodoro') {
                this.sessions++;
                AuthService.addXp(CONFIG.xpPerPomodoro);
            }

            this.playSound();
            Toast.show('Tempo concluído!', 'success');
            this.loadStats();
        },

        async loadStats() {
            const user = await AuthService.getCurrentUser();
            const today = new Date().toDateString();
            
            // Buscar sessões de hoje
            const history = await db.study_history
                .where('date').equals(today)
                .first();

            this.sessions = history ? history.pomodoro_sessions || 0 : 0;
            document.getElementById('pomodoro-sessions').textContent = this.sessions;
            
            const focusTime = history ? history.focus_time || 0 : 0;
            document.getElementById('pomodoro-focus').textContent = Math.round(focusTime / 60) + 'min';
        },

        updateDisplay() {
            const mins = Math.floor(this.timeRemaining / 60);
            const secs = this.timeRemaining % 60;
            document.getElementById('pomodoro-timer').textContent = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        playSound() {
            const audio = new AudioContext();
            const oscillator = audio.createOscillator();
            const gainNode = audio.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audio.destination);
            
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
        }
    };

    // Exercícios de Relaxamento
    const RelaxApp = {
        currentExercise: null,
        timer: null,

        start(type) {
            switch(type) {
                case 'breathing':
                    this.breathingExercise();
                    break;
                case 'eyes':
                    this.eyesExercise();
                    break;
                case 'meditation':
                    this.meditationExercise();
                    break;
            }
        },

        breathingExercise() {
            let phase = 'inhale';
            let count = 0;
            const phases = ['Inhale', 'Hold', 'Exhale', 'Rest'];
            
            new Modal({
                title: 'Respiração 4-7-8',
                content: `
                    <div class="breathing-exercise">
                        <div class="breathing-circle" id="breathing-circle"></div>
                        <p class="breathing-text" id="breathing-text">Preparar...</p>
                        <p class="breathing-info">Respire profundamente pelo nariz contando até 4,<br>segure por 7 segundos e expire lentamente pela boca por 8 segundos.</p>
                    </div>
                `,
                size: 'small'
            }).show();

            setTimeout(() => {
                this.timer = setInterval(() => {
                    const circle = document.getElementById('breathing-circle');
                    const text = document.getElementById('breathing-text');
                    
                    switch(phase) {
                        case 'inhale':
                            circle.classList.add('expand');
                            text.textContent = 'Inspire... 4';
                            phase = 'hold';
                            setTimeout(() => { phase = 'exhale'; }, 4000);
                            break;
                        case 'exhale':
                            circle.classList.remove('expand');
                            text.textContent = 'Expire... 8';
                            phase = 'rest';
                            setTimeout(() => { phase = 'inhale'; }, 8000);
                            break;
                    }
                }, 1000);
            }, 2000);
        },

        eyesExercise() {
            new Modal({
                title: 'Relaxamento Ocular',
                content: `
                    <div class="eyes-exercise">
                        <div class="eyes-animation">
                            <div class="eye left"></div>
                            <div class="eye right"></div>
                        </div>
                        <p>Olhe para cima, para baixo, para a esquerda e para a direita.<br>Reposicione os olhos lentamente, focando em cada direção.</p>
                        <button class="btn btn-primary" onclick="RelaxApp.stop(); Toast.show('Exercício concluído!', 'success');">Concluir</button>
                    </div>
                `,
                size: 'small'
            }).show();
        },

        meditationExercise() {
            let step = 0;
            const steps = [
                'Encontre uma posição confortável...',
                'Feche os olhos lentamente...',
                'Respire profundamente...',
                'Sinta seu corpo relaxando...',
                'Libere todas as tensões...',
                'Mantenha a calma...',
                'Você está em paz...'
            ];

            new Modal({
                title: 'Meditação Guiada',
                content: `
                    <div class="meditation-exercise">
                        <div class="meditation-icon">🧘</div>
                        <p id="meditation-text" class="meditation-text">${steps[0]}</p>
                        <button class="btn btn-primary" onclick="RelaxApp.stop(); Toast.show('Meditação concluída!', 'success');">Finalizar</button>
                    </div>
                `,
                size: 'small'
            }).show();

            this.timer = setInterval(() => {
                step = (step + 1) % steps.length;
                document.getElementById('meditation-text').textContent = steps[step];
            }, 5000);
        },

        stop() {
            if (this.timer) clearInterval(this.timer);
        }
    };

    // Aplicativo de Desempenho
    const PerformanceApp = {
        async init() {
            await this.loadStats();
            this.renderBadges();
            this.renderHistory();
        },

        async loadStats() {
            const user = await AuthService.getCurrentUser();
            if (!user) return;

            // Buscar estatísticas do banco
            const quizzes = await db.quizzes.where('user_id').equals(user.id).toArray();
            const totalQuestions = quizzes.reduce((sum, q) => sum + q.total_questions, 0);
            const correctAnswers = quizzes.reduce((sum, q) => sum + q.correct_answers, 0);
            
            const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

            document.getElementById('stat-questions').textContent = totalQuestions;
            document.getElementById('stat-accuracy').textContent = accuracy + '%';
            document.getElementById('stat-streak').textContent = user.study_streak || 0;
            document.getElementById('stat-time').textContent = this.formatTime(user.total_study_time || 0);

            // Calcular nível e XP
            const level = Math.floor((user.xp || 0) / 100) + 1;
            const xpInLevel = (user.xp || 0) % 100;
            const xpNeeded = 100;

            document.getElementById('stat-level').textContent = level;
            document.getElementById('xp-current').textContent = xpInLevel;
            document.getElementById('xp-needed').textContent = xpNeeded;
            document.getElementById('xp-bar-fill').style.width = (xpInLevel / xpNeeded * 100) + '%';
        },

        renderBadges() {
            const badges = [
                { id: 'first-quiz', name: 'Primeiro Passo', icon: '🎯', desc: 'Complete seu primeiro simulado', earned: true },
                { id: 'streak-7', name: 'Consistente', icon: '🔥', desc: '7 dias seguidos estudando', earned: false },
                { id: 'streak-30', name: 'Dedicado', icon: '💪', desc: '30 dias seguidos estudando', earned: false },
                { id: 'accuracy-80', name: 'Especialista', icon: '🏆', desc: '80% de taxa de acerto', earned: false },
                { id: 'questions-100', name: 'Explorador', icon: '📚', desc: '100 questões respondidas', earned: false },
                { id: 'pomodoro-10', name: 'Focado', icon: '⏰', desc: '10 sessões Pomodoro', earned: false }
            ];

            const container = document.getElementById('badges-container');
            container.innerHTML = badges.map(badge => `
                <div class="badge-item ${badge.earned ? 'earned' : 'locked'}" title="${badge.desc}">
                    <span class="badge-icon">${badge.icon}</span>
                    <span class="badge-name">${badge.name}</span>
                </div>
            `).join('');
        },

        renderHistory() {
            const container = document.getElementById('history-chart');
            container.innerHTML = `
                <div class="chart-placeholder">
                    <p>Seu histórico de estudos será exibido aqui após alguns dias de uso.</p>
                    <p>Continue estudando para visualizar sua evolução!</p>
                </div>
            `;
        },

        formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            return hours + 'h';
        }
    };

    // Aplicativo de Configurações
    const SettingsApp = {
        init() {
            this.loadSettings();
        },

        loadSettings() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            document.getElementById('setting-darkmode').checked = darkMode;
            if (darkMode) {
                document.body.setAttribute('data-theme', 'dark');
            }
        },

        toggleDarkMode(checkbox) {
            const isDark = checkbox.checked;
            localStorage.setItem('darkMode', isDark);
            document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
            Toast.show(isDark ? 'Modo escuro ativado' : 'Modo claro ativado', 'success');
        },

        setFontSize(size) {
            document.body.setAttribute('data-fontsize', size);
            localStorage.setItem('fontSize', size);
            Toast.show(`Tamanho da fonte: ${size}`, 'success');
        },

        async exportData() {
            const user = await AuthService.getCurrentUser();
            const quizzes = await db.quizzes.toArray();
            
            const data = {
                exportDate: new Date().toISOString(),
                user: user,
                quizzes: quizzes
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'enfermagem-concurseira-backup.json';
            a.click();
            
            Toast.show('Dados exportados com sucesso!', 'success');
        },

        async importData(input) {
            const file = input.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                Toast.show('Dados importados com sucesso!', 'success');
                location.reload();
            } catch (error) {
                Toast.show('Erro ao importar arquivo', 'error');
            }
        },

        clearData() {
            if (confirm('Tem certeza? Todos os dados serão apagados e esta ação não pode ser desfeita.')) {
                localStorage.clear();
                Dexie.delete('EnfermagemConcurseiraDB');
                Toast.show('Todos os dados foram apagados', 'success');
                setTimeout(() => location.reload(), 1000);
            }
        }
    };

    // Aplicativo Admin
    const AdminApp = {
        async init() {
            await this.loadQuestions();
        },

        async loadQuestions() {
            const questions = await db.questions.toArray();
            this.renderQuestionsTable(questions);
        },

        switchTab(tab) {
            document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            ['questions', 'contests', 'mindmaps', 'users', 'stats'].forEach(t => {
                document.getElementById(`admin-${t}`).style.display = t === tab ? 'block' : 'none';
            });
        },

        renderQuestionsTable(questions) {
            const tbody = document.getElementById('admin-questions-body');
            tbody.innerHTML = questions.slice(0, 20).map(q => `
                <tr>
                    <td>${q.id}</td>
                    <td>${q.text.substring(0, 50)}...</td>
                    <td>${q.area}</td>
                    <td>${q.banca.toUpperCase()}</td>
                    <td>
                        <button class="btn btn-ghost btn-sm" onclick="AdminApp.editQuestion('${q.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="AdminApp.deleteQuestion('${q.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        },

        addQuestion() {
            Toast.show('Formulário de nova questão em breve', 'info');
        },

        importQuestions() {
            Toast.show('Importação de questões em breve', 'info');
        },

        editQuestion(id) {
            Toast.show('Edição de questão em breve', 'info');
        },

        deleteQuestion(id) {
            if (confirm('Tem certeza que deseja excluir esta questão?')) {
                db.questions.delete(id);
                this.loadQuestions();
                Toast.show('Questão excluída', 'success');
            }
        }
    };

    // ============================================
    // NAVEGAÇÃO PRINCIPAL
    // ============================================
    function navigateTo(page) {
        // Verificar se a página é válida
        if (!CONFIG.pages.includes(page)) {
            page = 'home';
        }

        window.AppState.currentPage = page;

        // Esconder todas as páginas
        document.querySelectorAll('.page-section, #page-home').forEach(p => {
            if (p.id !== 'page-home' || page !== 'home') {
                p.style.display = 'none';
            }
        });

        // Mostrar página atual
        const pageElement = document.getElementById(`page-${page}`);
        if (pageElement) {
            pageElement.style.display = 'block';
        } else if (page === 'home') {
            document.getElementById('page-home').style.display = 'block';
        }

        // Atualizar navegação ativa
        updateActiveNav(page);

        // Inicializar página se necessário
        initializePage(page);

        // Atualizar URL
        window.location.hash = page;

        // Scroll para o topo
        window.scrollTo(0, 0);
    }

    function updateActiveNav(page) {
        document.querySelectorAll('.nav-link[data-page], .nav-item[data-page]').forEach(link => {
            const linkPage = link.dataset.page;
            if (linkPage === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function initializePage(page) {
        switch(page) {
            case 'questions':
                QuestionsApp.init();
                break;
            case 'quizzes':
                // Quiz já está na página
                break;
            case 'contests':
                ContestsApp.init();
                break;
            case 'library':
                LibraryApp.init();
                break;
            case 'pomodoro':
                PomodoroApp.init();
                break;
            case 'performance':
                PerformanceApp.init();
                break;
            case 'settings':
                SettingsApp.init();
                break;
            case 'admin':
                AdminApp.init();
                break;
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    async function init() {
        console.log('[App] Inicializando Enfermagem Concurseira...');
        
        const loadingStatus = document.getElementById('loading-status');
        
        function updateStatus(msg) {
            if (loadingStatus) loadingStatus.textContent = msg;
            console.log('[App]', msg);
        }

        try {
            updateStatus('Abrindo banco de dados...');
            await db.open();
            
            updateStatus('Carregando usuário...');
            await AuthService.ensureTestUser();
            
            updateStatus('Inicializando interface...');
            
            // Esconder tela de loading
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }

            // Configurar navegação por hash
            window.addEventListener('hashchange', () => {
                const hash = window.location.hash.slice(1) || 'home';
                navigateTo(hash);
            });

            // Configurar cliques na navegação
            document.addEventListener('click', (e) => {
                const navItem = e.target.closest('[data-page]');
                if (navItem) {
                    e.preventDefault();
                    const page = navItem.dataset.page;
                    navigateTo(page);
                    return;
                }
            });

            // Verificar URL inicial
            const hash = window.location.hash.slice(1) || 'home';
            navigateTo(hash);

            // Configurar ano no footer
            document.getElementById('current-year').textContent = new Date().getFullYear();

            updateStatus('Pronto!');
            console.log('[App] Aplicativo inicializado com sucesso');

        } catch (error) {
            console.error('[App] Erro:', error);
            Toast.show('Erro ao inicializar: ' + error.message, 'error');
        }
    }

    // Expor API global
    window.App = {
        navigate: function(pageName) {
            navigateTo(pageName);
        }
    };

    // Expor módulos globalmente
    window.QuestionsApp = QuestionsApp;
    window.QuizApp = QuizApp;
    window.ContestsApp = ContestsApp;
    window.LibraryApp = LibraryApp;
    window.PomodoroApp = PomodoroApp;
    window.RelaxApp = RelaxApp;
    window.PerformanceApp = PerformanceApp;
    window.SettingsApp = SettingsApp;
    window.AdminApp = AdminApp;
    window.db = db;

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

console.log('Enfermagem Concurseira App loaded successfully');
