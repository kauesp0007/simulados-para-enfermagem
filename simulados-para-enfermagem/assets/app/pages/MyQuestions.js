/**
 * Minhas Questões
 * Visualização e gerenciamento das questões do usuário
 */

var MyQuestions = (function() {
    'use strict';

    function MyQuestions(options) {
        this.options = options || {};
        this.db = options.db;
        this.auth = options.auth;
        this.toast = options.toast;
        this.title = 'Minhas Questões';
        this.questions = [];
    }

    MyQuestions.prototype.mount = async function(params) {
        await this.loadQuestions();
        this.render();
        this.bindEvents();
    };

    MyQuestions.prototype.loadQuestions = async function() {
        try {
            this.questions = await this.db.questions.toArray();
        } catch (error) {
            console.error('Erro ao carregar questões:', error);
        }
    };

    MyQuestions.prototype.render = function() {
        var mainContent = document.getElementById('main-content');
        var self = this;
        
        var stats = this.calculateStats();
        
        mainContent.innerHTML = '<div class="page my-questions">\
            <header class="page-header">\
                <h1>Minhas Questões</h1>\
                <p>Revise e gerencie sua biblioteca de questões</p>\
            </header>\
            <div class="questions-stats">\
                <div class="stat-card">\
                    <div class="stat-icon">📚</div>\
                    <div class="stat-content">\
                        <span class="stat-value">' + stats.total + '</span>\
                        <span class="stat-label">Total</span>\
                    </div>\
                </div>\
                <div class="stat-card">\
                    <div class="stat-icon">✅</div>\
                    <div class="stat-content">\
                        <span class="stat-value">' + stats.answered + '</span>\
                        <span class="stat-label">Respondidas</span>\
                    </div>\
                </div>\
                <div class="stat-card">\
                    <div class="stat-icon">⭐</div>\
                    <div class="stat-content">\
                        <span class="stat-value">' + stats.correctRate + '%</span>\
                        <span class="stat-label">Taxa de Acerto</span>\
                    </div>\
                </div>\
            </div>\
            <div class="toolbar">\
                <button class="btn btn-primary" onclick="myQuestionsAdd()">+ Nova Questão</button>\
                <input type="text" id="question-search" placeholder="Buscar..." class="search-input" oninput="myQuestionsSearch(this.value)">\
            </div>\
            <div class="questions-list">\
                ' + (this.questions.length === 0 ?
                    '<div class="empty-state">\
                        <h3>Nenhuma questão encontrada</h3>\
                        <p>Adicione suas primeiras questões</p>\
                    </div>' :
                    this.questions.slice(0, 20).map(function(q) {
                        return self.renderQuestionCard(q);
                    }).join('')
                ) + '\
            </div>\
        </div>';
    };

    MyQuestions.prototype.renderQuestionCard = function(question) {
        var performance = question.timesAnswered > 0 
            ? Math.round((question.timesCorrect / question.timesAnswered) * 100)
            : null;
        
        return '<div class="question-card">\
            <div class="question-header">\
                <span class="question-id">#' + question.id + '</span>\
                <span class="difficulty-badge difficulty-' + (question.difficulty || 1) + '">' + this.getDifficultyLabel(question.difficulty) + '</span>\
            </div>\
            <div class="question-content">' + escapeHtml((question.content || '').substring(0, 200)) + '</div>\
            <div class="question-footer">\
                <span class="question-meta">\
                    ' + (performance !== null ? '<span class="performance-badge performance-' + this.getPerformanceClass(performance) + '">' + performance + '%</span>' : '') + '\
                </span>\
                <div class="question-actions">\
                    <button class="btn btn-secondary btn-sm" onclick="myQuestionsStudy(' + question.id + ')">📖</button>\
                    <button class="btn btn-secondary btn-sm" onclick="myQuestionsEdit(' + question.id + ')">✏️</button>\
                    <button class="btn btn-danger btn-sm" onclick="myQuestionsDelete(' + question.id + ')">🗑️</button>\
                </div>\
            </div>\
        </div>';
    };

    MyQuestions.prototype.calculateStats = function() {
        var total = this.questions.length;
        var answered = this.questions.filter(function(q) { return q.timesAnswered > 0; }).length;
        var correctAnswers = this.questions.reduce(function(sum, q) { return sum + (q.timesCorrect || 0); }, 0);
        var totalAnswers = this.questions.reduce(function(sum, q) { return sum + (q.timesAnswered || 0); }, 0);
        var correctRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
        
        return { total: total, answered: answered, correctRate: correctRate };
    };

    MyQuestions.prototype.getDifficultyLabel = function(difficulty) {
        var labels = {1: 'Fácil', 2: 'Médio', 3: 'Difícil'};
        return labels[difficulty] || 'Médio';
    };

    MyQuestions.prototype.getPerformanceClass = function(rate) {
        if (rate >= 70) return 'high';
        if (rate >= 40) return 'medium';
        return 'low';
    };

    MyQuestions.prototype.bindEvents = function() {};

    MyQuestions.prototype.unmount = function() {};

    // Funções globais
    window.myQuestionsAdd = function() {
        var content = prompt('Conteúdo da questão:');
        if (!content) return;
        
        var optionA = prompt('Alternativa A:') || '';
        var optionB = prompt('Alternativa B:') || '';
        var optionC = prompt('Alternativa C:') || '';
        var optionD = prompt('Alternativa D:') || '';
        var correctAnswer = prompt('Resposta correta (A, B, C ou D):', 'A').toUpperCase();
        
        db.questions.add({
            content: content,
            type: 'multiple-choice',
            options: [optionA, optionB, optionC, optionD].filter(function(o) { return o; }),
            correctAnswer: correctAnswer,
            difficulty: 2,
            timesAnswered: 0,
            timesCorrect: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }).then(function() {
            window.AppState.showToast('Questão adicionada!', 'success');
            window.AppState.navigate('my-questions');
        });
    };

    window.myQuestionsStudy = function(id) {
        window.AppState.goTo('quiz', { type: 'question', questionId: id });
    };

    window.myQuestionsEdit = function(id) {
        db.questions.get(id).then(function(q) {
            var content = prompt('Conteúdo da questão:', q.content);
            if (content === null) return;
            
            var correctAnswer = prompt('Resposta correta:', q.correctAnswer);
            
            db.questions.update(id, {
                content: content,
                correctAnswer: correctAnswer,
                updatedAt: new Date()
            }).then(function() {
                window.AppState.showToast('Questão atualizada!', 'success');
                window.AppState.navigate('my-questions');
            });
        });
    };

    window.myQuestionsDelete = function(id) {
        if (confirm('Tem certeza que deseja excluir esta questão?')) {
            db.questions.delete(id).then(function() {
                window.AppState.showToast('Questão excluída!', 'success');
                window.AppState.navigate('my-questions');
            });
        }
    };

    window.myQuestionsSearch = function(query) {
        // Implementar busca
        console.log('Buscar:', query);
    };

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return MyQuestions;
})();

// MyQuestions loaded
