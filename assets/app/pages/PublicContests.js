/**
 * Concursos Públicos
 * Visualização e acesso aos concursos disponíveis
 */

var PublicContests = (function() {
    'use strict';

    function PublicContests(options) {
        this.options = options || {};
        this.db = options.db;
        this.auth = options.auth;
        this.toast = options.toast;
        this.title = 'Concursos Públicos';
        this.contests = [];
    }

    PublicContests.prototype.mount = async function(params) {
        await this.loadContests();
        this.render();
        this.bindEvents();
    };

    PublicContests.prototype.loadContests = async function() {
        try {
            this.contests = await this.db.publicContests.toArray();
        } catch (error) {
            console.error('Erro ao carregar concursos:', error);
        }
    };

    PublicContests.prototype.render = function() {
        var mainContent = document.getElementById('main-content');
        var self = this;
        
        var contestsByYear = this.contests.reduce(function(groups, contest) {
            var year = contest.year || 'Outro';
            if (!groups[year]) groups[year] = [];
            groups[year].push(contest);
            return groups;
        }, {});
        
        var years = Object.keys(contestsByYear).sort(function(a, b) { return parseInt(b) - parseInt(a); });
        
        mainContent.innerHTML = '<div class="page public-contests">\
            <header class="page-header">\
                <h1>Concursos Públicos</h1>\
                <p>Explore questões de concursos públicos de Enfermagem</p>\
            </header>\
            <div class="contests-stats">\
                <div class="stat">\
                    <span class="stat-value">' + this.contests.length + '</span>\
                    <span class="stat-label">Concursos</span>\
                </div>\
                <div class="stat">\
                    <span class="stat-value">' + this.contests.reduce(function(sum, c) { return sum + (c.questionCount || 0); }, 0) + '</span>\
                    <span class="stat-label">Questões</span>                </div>\
            </div>\
            <div class="contests-container">\
                ' + years.map(function(year) {
                    return '<section class="year-section">\
                        <h2 class="year-title">' + year + '</h2>\
                        <div class="contests-grid">\
                            ' + contestsByYear[year].map(function(contest) {
                                return self.renderContestCard(contest);
                            }).join('') + '\
                        </div>\
                    </section>';
                }).join('') + '\
            </div>\
        </div>';
    };

    PublicContests.prototype.renderContestCard = function(contest) {
        return '<div class="contest-card">\
            <div class="contest-header">\
                <span class="contest-year">' + contest.year + '</span>\
                <span class="contest-level level-' + (contest.level || 'medium') + '">' + this.getLevelLabel(contest.level) + '</span>\
            </div>\
            <h3 class="contest-name">' + escapeHtml(contest.name || '') + '</h3>\
            <p class="contest-institution">' + escapeHtml(contest.institution || '') + '</p>\
            <div class="contest-info">\
                <span class="question-count">' + (contest.questionCount || 0) + ' questões</span>\
            </div>\
            <div class="contest-actions">\
                <button class="btn btn-primary btn-sm" onclick="publicContestsStart(' + contest.id + ')">Iniciar Simulado</button>\
            </div>\
        </div>';
    };

    PublicContests.prototype.getLevelLabel = function(level) {
        var labels = {'easy': 'Fácil', 'medium': 'Médio', 'hard': 'Difícil'};
        return labels[level] || 'Médio';
    };

    PublicContests.prototype.bindEvents = function() {
        // Eventos inline
    };

    PublicContests.prototype.unmount = function() {};

    // Funções globais
    window.publicContestsStart = function(contestId) {
        window.AppState.goTo('quiz', { type: 'contest', contestId: contestId });
    };

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return PublicContests;
})();

// PublicContests loaded
