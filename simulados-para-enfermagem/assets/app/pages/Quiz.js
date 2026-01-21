/**
 * Quiz Page
 * Página de realização de quiz/prova
 */

var Quiz = (function() {
    'use strict';

    function Quiz(options) {
        this.options = options || {};
        this.db = options.db;
        this.auth = options.auth;
        this.toast = options.toast;
        this.title = 'Quiz';
        this.questions = [];
        this.currentIndex = 0;
        this.answers = [];
        this.startTime = null;
        this.timerInterval = null;
        this.timeSpent = 0;
        this.config = {};
    }

    Quiz.prototype.mount = async function(params) {
        await this.loadQuestions(params);
        this.render();
        this.bindEvents();
    };

    Quiz.prototype.loadQuestions = async function(params) {
        try {
            if (params.type === 'random' || !params.type) {
                // Quiz aleatório
                this.questions = await this.db.questions.toArray();
                this.shuffleArray(this.questions);
                this.questions = this.questions.slice(0, 10);
            } else if (params.contestId) {
                // Quiz por concurso
                this.questions = await this.db.questions
                    .where('contestId')
                    .equals(parseInt(params.contestId))
                    .toArray();
            } else if (params.topicId) {
                // Quiz por assunto
                this.questions = await this.db.questions
                    .where('topicId')
                    .equals(parseInt(params.topicId))
                    .toArray();
            }

            this.currentIndex = 0;
            this.answers = new Array(this.questions.length).fill(null);
            this.startTime = Date.now();
            this.startTimer();
        } catch (error) {
            console.error('Erro ao carregar questões:', error);
            this.toast('Erro ao carregar questões', 'error');
        }
    };

    Quiz.prototype.render = function() {
        var mainContent = document.getElementById('main-content');
        
        if (this.questions.length === 0) {
            mainContent.innerHTML = '<div class="page quiz-page">\
                <header class="page-header">\
                    <h1>Quiz</h1>\
                </header>\
                <div class="empty-state">\
                    <h3>Nenhuma questão encontrada</h3>\
                    <p>Adicione questões para começar um quiz.</p>\
                    <button class="btn btn-primary" onclick="window.AppState.goTo(\'my-questions\')">Ver Questões</button>\
                </div>\
            </div>';
            return;
        }

        var question = this.questions[this.currentIndex];
        var progress = ((this.currentIndex + 1) / this.questions.length) * 100;
        var timeDisplay = this.formatTime(this.timeSpent);

        mainContent.innerHTML = '<div class="page quiz-page">\
            <div class="quiz-header">\
                <div class="quiz-progress">\
                    <span>Questão ' + (this.currentIndex + 1) + ' de ' + this.questions.length + '</span>\
                    <div class="progress-bar" style="width: 200px;">\
                        <div class="progress-fill" style="width: ' + progress + '%"></div>\
                    </div>\
                </div>\
                <div class="quiz-timer">' + timeDisplay + '</div>\
            </div>\
            <div class="question-card">\
                <span class="question-number">Questão ' + (this.currentIndex + 1) + '</span>\
                <p class="question-text">' + escapeHtml(question.content || '') + '</p>\
                <div class="options-list">' + this.renderOptions(question) + '</div>\
            </div>\
            <div class="quiz-actions">\
                <button class="btn btn-secondary" onclick="quizPrev()" ' + (this.currentIndex === 0 ? 'disabled' : '') + '>Anterior</button>\
                <button class="btn btn-primary" onclick="quizSubmit()" id="submit-btn">\
                    ' + (this.currentIndex === this.questions.length - 1 ? 'Finalizar' : 'Próxima') + '\
                </button>\
            </div>\
        </div>';
    };

    Quiz.prototype.renderOptions = function(question) {
        var self = this;
        var options = question.options || [];
        if (!Array.isArray(options) || options.length === 0) {
            options = ['A) Opção A', 'B) Opção B', 'C) Opção C', 'D) Opção D'];
        }
        
        return options.map(function(opt, index) {
            var letter = String.fromCharCode(65 + index);
            var isSelected = self.answers[self.currentIndex] === letter;
            return '<div class="option-item ' + (isSelected ? 'selected' : '') + '" data-letter="' + letter + '" onclick="quizSelect(\'' + letter + '\')">\
                <span class="option-letter">' + letter + '</span>\
                <span class="option-text">' + escapeHtml(opt.replace(/^[A-Z]\)\s*/, '')) + '</span>\
            </div>';
        }).join('');
    };

    Quiz.prototype.bindEvents = function() {
        // Eventos configurados inline
    };

    Quiz.prototype.startTimer = function() {
        var self = this;
        this.timerInterval = setInterval(function() {
            self.timeSpent++;
            var timerDisplay = document.querySelector('.quiz-timer');
            if (timerDisplay) {
                timerDisplay.textContent = self.formatTime(self.timeSpent);
            }
        }, 1000);
    };

    Quiz.prototype.formatTime = function(seconds) {
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    };

    Quiz.prototype.shuffleArray = function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };

    Quiz.prototype.unmount = function() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    };

    // Funções globais para eventos
    window.quizSelect = function(letter) {
        var quiz = window.AppState.currentPage;
        if (quiz && quiz.answers) {
            quiz.answers[quiz.currentIndex] = letter;
            
            // Atualizar UI
            var options = document.querySelectorAll('.option-item');
            options.forEach(function(opt) {
                opt.classList.remove('selected');
                if (opt.dataset.letter === letter) {
                    opt.classList.add('selected');
                }
            });
        }
    };

    window.quizNext = function() {
        var quiz = window.AppState.currentPage;
        if (quiz && quiz.currentIndex < quiz.questions.length - 1) {
            quiz.currentIndex++;
            quiz.render();
            quiz.bindEvents();
        }
    };

    window.quizPrev = function() {
        var quiz = window.AppState.currentPage;
        if (quiz && quiz.currentIndex > 0) {
            quiz.currentIndex--;
            quiz.render();
            quiz.bindEvents();
        }
    };

    window.quizSubmit = function() {
        var quiz = window.AppState.currentPage;
        if (!quiz) return;

        var currentAnswer = quiz.answers[quiz.currentIndex];
        if (!currentAnswer) {
            window.AppState.showToast('Selecione uma resposta!', 'warning');
            return;
        }

        if (quiz.currentIndex < quiz.questions.length - 1) {
            // Próxima questão
            quiz.currentIndex++;
            quiz.render();
            quiz.bindEvents();
        } else {
            // Finalizar quiz
            quiz.finishQuiz();
        }
    };

    Quiz.prototype.finishQuiz = function() {
        var self = this;
        var correct = 0;
        
        this.questions.forEach(function(q, index) {
            var answer = self.answers[index];
            if (answer === q.correctAnswer) {
                correct++;
            }
        });

        var score = Math.round((correct / this.questions.length) * 100);
        var timeSpent = this.timeSpent;

        // Salvar tentativa
        db.quizAttempts.add({
            quizId: Date.now(),
            score: score,
            totalQuestions: this.questions.length,
            correctAnswers: correct,
            timeSpent: timeSpent,
            answers: this.answers,
            startedAt: this.startTime,
            completedAt: new Date(),
            createdAt: new Date()
        }).then(function() {
            // Mostrar resultados
            var mainContent = document.getElementById('main-content');
            mainContent.innerHTML = '<div class="page quiz-page">\
                <div class="results-container">\
                    <h2>Resultado do Quiz</h2>\
                    <div class="score-display">\
                        <span class="score-value">' + score + '%</span>\
                        <span class="score-label">de acerto</span>\
                    </div>\
                    <div class="results-stats">\
                        <p>Acertos: ' + correct + ' de ' + self.questions.length + '</p>\
                        <p>Tempo: ' + self.formatTime(timeSpent) + '</p>\
                    </div>\
                    <div class="results-actions">\
                        <button class="btn btn-primary" onclick="window.AppState.goTo(\'dashboard\')">Voltar ao Início</button>\
                        <button class="btn btn-secondary" onclick="window.AppState.goTo(\'quiz\', {type: \'random\'})">Novo Quiz</button>\
                    </div>\
                </div>\
            </div>';
            
            window.AppState.showToast('Quiz concluído!', 'success');
        });

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    };

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return Quiz;
})();

// Quiz loaded
