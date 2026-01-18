/**
 * Painel de Administração
 * Gerenciamento de questões e concursos
 */

var AdminPanel = (function() {
    'use strict';

    function AdminPanel(options) {
        this.options = options || {};
        this.db = options.db;
        this.auth = options.auth;
        this.toast = options.toast;
        this.title = 'Administração';
    }

    AdminPanel.prototype.mount = async function(params) {
        this.render();
        this.bindEvents();
        await this.loadStatistics();
    };

    AdminPanel.prototype.render = function() {
        var mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = '<div class="page admin-panel">\
            <header class="page-header">\
                <h1>Painel de Administração</h1>\
                <p>Gerencie questões e visualize estatísticas</p>\
            </header>\
            <div class="stats-grid">\
                <div class="stat-card">\
                    <div class="stat-icon">📚</div>\
                    <div class="stat-info">\
                        <span class="stat-value" id="total-questions">0</span>\
                        <span class="stat-label">Questões</span>\
                    </div>\
                </div>\
                <div class="stat-card">\
                    <div class="stat-icon">🏆</div>\
                    <div class="stat-info">\
                        <span class="stat-value" id="total-contests">0</span>\
                        <span class="stat-label">Concursos</span>\
                    </div>\
                </div>\
                <div class="stat-card">\
                    <div class="stat-icon">✅</div>\
                    <div class="stat-info">\
                        <span class="stat-value" id="total-attempts">0</span>\
                        <span class="stat-label">Simulados</span>\
                    </div>\
                </div>\
            </div>\
            <div class="admin-actions">\
                <button class="btn btn-primary" onclick="adminAddQuestion()">+ Nova Questão</button>\
                <button class="btn btn-secondary" onclick="adminImportData()">📥 Importar Dados CSV</button>\
                <button class="btn btn-outline" onclick="adminExportData()">📤 Exportar Dados</button>\
            </div>\
            <div class="data-preview">\
                <h3>Questões Recentes</h3>\
                <div id="questions-list">Carregando...</div>\
            </div>\
        </div>';
    };

    AdminPanel.prototype.bindEvents = function() {};

    AdminPanel.prototype.loadStatistics = async function() {
        try {
            var questionCount = await this.db.questions.count();
            var contestCount = await this.db.contests.count();
            var attemptCount = await this.db.quizAttempts.count();
            
            document.getElementById('total-questions').textContent = questionCount;
            document.getElementById('total-contests').textContent = contestCount;
            document.getElementById('total-attempts').textContent = attemptCount;
            
            // Carregar questões recentes
            var questions = await this.db.questions.toArray();
            questions = questions.slice(0, 10);
            
            var questionsList = document.getElementById('questions-list');
            if (questions.length === 0) {
                questionsList.innerHTML = '<p style="color: var(--text-secondary);">Nenhuma questão adicionada ainda.</p>';
            } else {
                questionsList.innerHTML = '<table class="data-table">\
                    <thead><tr><th>ID</th><th>Conteúdo</th><th>Ações</th></tr></thead>\
                    <tbody>' +
                    questions.map(function(q) {
                        return '<tr>\
                            <td>' + q.id + '</td>\
                            <td>' + escapeHtml((q.content || '').substring(0, 50)) + '...</td>\
                            <td>\
                                <button class="btn btn-secondary btn-sm" onclick="adminEditQuestion(' + q.id + ')">Editar</button>\
                                <button class="btn btn-danger btn-sm" onclick="adminDeleteQuestion(' + q.id + ')">Excluir</button>\
                            </td>\
                        </tr>';
                    }).join('') + '</tbody></table>';
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    AdminPanel.prototype.unmount = function() {};

    // Funções globais
    window.adminAddQuestion = function() {
        var content = prompt('Conteúdo da questão:');
        if (!content) return;
        
        var optionA = prompt('Alternativa A:') || '';
        var optionB = prompt('Alternativa B:') || '';
        var optionC = prompt('Alternativa C:') || '';
        var optionD = prompt('Alternativa D:') || '';
        var correctAnswer = prompt('Resposta correta (A, B, C ou D):').toUpperCase();
        var explanation = prompt('Explicação (opcional):') || '';
        
        db.questions.add({
            content: content,
            type: 'multiple-choice',
            options: [optionA, optionB, optionC, optionD].filter(function(o) { return o; }),
            correctAnswer: correctAnswer,
            explanation: explanation,
            difficulty: 2,
            timesAnswered: 0,
            timesCorrect: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }).then(function() {
            window.AppState.showToast('Questão adicionada!', 'success');
            window.AppState.navigate('admin');
        });
    };

    window.adminEditQuestion = function(id) {
        db.questions.get(id).then(function(q) {
            var content = prompt('Conteúdo da questão:', q.content);
            if (content === null) return;
            
            var explanation = prompt('Explicação:', q.explanation) || '';
            
            db.questions.update(id, {
                content: content,
                explanation: explanation,
                updatedAt: new Date()
            }).then(function() {
                window.AppState.showToast('Questão atualizada!', 'success');
                window.AppState.navigate('admin');
            });
        });
    };

    window.adminDeleteQuestion = function(id) {
        if (confirm('Tem certeza que deseja excluir esta questão?')) {
            db.questions.delete(id).then(function() {
                window.AppState.showToast('Questão excluída!', 'success');
                window.AppState.navigate('admin');
            });
        }
    };

    window.adminImportData = function() {
        alert('Para importar dados, use o script dataImport.js ou carregue um arquivo JSON.');
    };

    window.adminExportData = async function() {
        try {
            var data = {
                questions: await db.questions.toArray(),
                contests: await db.contests.toArray(),
                quizAttempts: await db.quizAttempts.toArray()
            };
            
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'admin-backup.json';
            a.click();
            
            window.AppState.showToast('Dados exportados!', 'success');
        } catch (error) {
            window.AppState.showToast('Erro ao exportar', 'error');
        }
    };

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return AdminPanel;
})();

// AdminPanel loaded
