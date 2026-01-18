/**
 * Dashboard Page
 * Página principal do aplicativo
 * Versão: Non-Module (Global Scope)
 */

window.Dashboard = (function() {
    'use strict';

    function Dashboard(options) {
        this.options = options || {};
        this.db = options.db;
        this.auth = options.auth;
        this.toast = options.toast;
        this.stats = null;
    }

    Dashboard.prototype.getTitle = function() {
        return 'Dashboard';
    };

    Dashboard.prototype.getSubtitle = function() {
        var user = AuthService.getCurrentUser();
        if (user && user.full_name) {
            var firstName = user.full_name.split(' ')[0];
            return 'Olá, ' + firstName + '! Vamos estudar hoje?';
        }
        return 'Bem-vindo!';
    };

    Dashboard.prototype.renderHeader = function() {
        var title = this.getTitle();
        var subtitle = this.getSubtitle();
        
        return '<div class="page-header">' +
            '<h1 class="page-title">' + escapeHtml(title) + '</h1>' +
            (subtitle ? '<p class="page-subtitle">' + escapeHtml(subtitle) + '</p>' : '') +
            '</div>';
    };

    Dashboard.prototype.mount = function(params) {
        try {
            var user = AuthService.getCurrentUser();
            if (!user) {
                this.renderNotLoggedIn();
                return;
            }

            // Dados do usuário diretamente - sem chamadas assíncronas
            var totalQuizzes = user.total_quizzes || 0;
            var totalQuestions = user.total_questions || 0;
            var streak = user.study_streak || 0;
            var totalTime = user.stats ? user.stats.total_time_spent || 0 : 0;
            var hitRate = user.stats && user.stats.questions_answered > 0 
                ? Math.round((user.stats.correct_answers / user.stats.questions_answered) * 100) 
                : 0;

            this.render(user, totalQuizzes, hitRate, streak, totalTime);
            this.bindEvents();
        } catch (error) {
            console.error('Dashboard error:', error);
            this.renderError('Erro ao carregar dashboard: ' + error.message);
        }
    };

    Dashboard.prototype.render = function(user, totalQuizzes, hitRate, streak, totalTime) {
        var mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Elemento main-content não encontrado');
            return;
        }

        var headerHtml = this.renderHeader();

        mainContent.innerHTML = '<div class="page dashboard">' +
            headerHtml +
            
            // Quick Actions
            '<div class="quick-actions">' +
                '<div class="quick-action" data-action="custom-quiz">' +
                    '<div class="quick-action-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>' +
                    '<span class="quick-action-label">Novo Quiz</span>' +
                '</div>' +
                '<div class="quick-action" data-action="my-contests">' +
                    '<div class="quick-action-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
                    '<span class="quick-action-label">Meus Concursos</span>' +
                '</div>' +
                '<div class="quick-action" data-action="pomodoro">' +
                    '<div class="quick-action-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>' +
                    '<span class="quick-action-label">Pomodoro</span>' +
                '</div>' +
                '<div class="quick-action" data-action="library">' +
                    '<div class="quick-action-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>' +
                    '<span class="quick-action-label">Biblioteca</span>' +
                '</div>' +
            '</div>' +

            // Stats Grid
            '<div class="stats-grid mb-6">' +
                '<div class="stat-card">' +
                    '<div class="stat-card-icon cyan"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
                    '<div class="stat-card-content">' +
                        '<div class="stat-card-value">' + totalQuizzes + '</div>' +
                        '<div class="stat-card-label">Quizzes Realizados</div>' +
                    '</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-card-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></div>' +
                    '<div class="stat-card-content">' +
                        '<div class="stat-card-value">' + hitRate + '%</div>' +
                        '<div class="stat-card-label">Taxa de Acerto</div>' +
                    '</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-card-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></div>' +
                    '<div class="stat-card-content">' +
                        '<div class="stat-card-value">' + streak + '</div>' +
                        '<div class="stat-card-label">Dias Seguidos</div>' +
                    '</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-card-icon purple"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>' +
                    '<div class="stat-card-content">' +
                        '<div class="stat-card-value">' + this.formatTime(totalTime) + '</div>' +
                        '<div class="stat-card-label">Tempo Total</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            // Próximos Concursos
            '<div class="card">' +
                '<div class="card-header">' +
                    '<h3 class="card-title">Próximos Concursos</h3>' +
                    '<button class="btn btn-ghost btn-sm" onclick="window.AppState.goTo(\'my-contests\')">Ver todos</button>' +
                '</div>' +
                '<div class="card-body">' +
                '<div class="empty-state" style="padding: 2rem 1rem;">' +
                    '<p class="text-secondary">Nenhum concurso adicionado ainda</p>' +
                    '<button class="btn btn-primary mt-4" onclick="window.AppState.goTo(\'my-contests\')">Adicionar Concurso</button>' +
                '</div>' +
                '</div>' +
            '</div>' +
            '</div>';
    };

    Dashboard.prototype.renderNotLoggedIn = function() {
        var mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        mainContent.innerHTML = '<div class="page dashboard">' +
            '<div class="empty-state" style="padding: 3rem;">' +
                '<h3>Bem-vindo ao Enfermagem Concurseira!</h3>' +
                '<p>Faça login para acessar seus concursos e acompanhar seu progresso.</p>' +
            '</div>' +
            '</div>';
    };

    Dashboard.prototype.renderError = function(message) {
        var mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        mainContent.innerHTML = '<div class="page dashboard">' +
            '<div class="error-state">' +
                '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-error-500); margin: 0 auto 1rem;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' +
                '<h3>Erro ao carregar</h3>' +
                '<p>' + escapeHtml(message) + '</p>' +
                '<button class="btn btn-primary mt-4" onclick="location.reload()">Tentar novamente</button>' +
            '</div>' +
            '</div>';
    };

    Dashboard.prototype.formatTime = function(seconds) {
        if (!seconds) return '0h';
        var hours = Math.floor(seconds / 3600);
        var mins = Math.floor((seconds % 3600) / 60);
        return hours + 'h ' + mins + 'm';
    };

    Dashboard.prototype.bindEvents = function() {
        var self = this;
        document.querySelectorAll('.quick-action').forEach(function(action) {
            action.addEventListener('click', function() {
                var actionType = action.dataset.action;
                self.handleQuickAction(actionType);
            });
        });
    };

    Dashboard.prototype.handleQuickAction = function(action) {
        var actions = {
            'custom-quiz': function() { window.AppState.goTo('quiz', { type: 'random' }); },
            'my-contests': function() { window.AppState.goTo('my-contests'); },
            'pomodoro': function() { window.AppState.goTo('pomodoro'); },
            'library': function() { window.AppState.goTo('library'); }
        };
        
        if (actions[action]) {
            actions[action]();
        }
    };

    Dashboard.prototype.unmount = function() {};

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return Dashboard;
})();

console.log('Dashboard.js carregado com sucesso');
