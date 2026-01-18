/**
 * Meus Concursos
 * Gestão dos concursos que o usuário está estudando
 */

var MyContests = (function() {
    'use strict';

    function MyContests(options) {
        this.options = options || {};
        this.db = options.db;
        this.auth = options.auth;
        this.toast = options.toast;
        this.modal = options.modal;
        this.title = 'Meus Concursos';
        this.contests = [];
        this.currentView = 'grid';
    }

    MyContests.prototype.mount = async function(params) {
        this.contests = await this.db.contests.toArray();
        this.contests.sort(function(a, b) {
            return (b.studyProgress || 0) - (a.studyProgress || 0);
        });
        this.render();
        this.bindEvents();
    };

    MyContests.prototype.render = function() {
        var mainContent = document.getElementById('main-content');
        var activeContests = this.contests.filter(function(c) { return c.status === 'active' || !c.status; });
        var plannedContests = this.contests.filter(function(c) { return c.status === 'planned'; });
        var completedContests = this.contests.filter(function(c) { return c.status === 'completed'; });

        mainContent.innerHTML = '<div class="page my-contests">\
            <header class="page-header">\
                <h1>Meus Concursos</h1>\
                <p>Gerencie seus concursos e acompanhe seu progresso</p>\
            </header>\
            <div class="contests-stats">\
                <div class="stat-card">\
                    <div class="stat-icon">📚</div>\
                    <div class="stat-content">\
                        <span class="stat-value">' + this.contests.length + '</span>\
                        <span class="stat-label">Total</span>\
                    </div>\
                </div>\
                <div class="stat-card">\
                    <div class="stat-icon">🎯</div>\
                    <div class="stat-content">\
                        <span class="stat-value">' + activeContests.length + '</span>\
                        <span class="stat-label">Em Andamento</span>\
                    </div>\
                </div>\
                <div class="stat-card">\
                    <div class="stat-icon">📋</div>\
                    <div class="stat-content">\
                        <span class="stat-value">' + plannedContests.length + '</span>\
                        <span class="stat-label">Planejados</span>\
                    </div>\
                </div>\
                <div class="stat-card">\
                    <div class="stat-icon">✅</div>\
                    <div class="stat-content">\
                        <span class="stat-value">' + completedContests.length + '</span>\
                        <span class="stat-label">Concluídos</span>\
                    </div>\
                </div>\
            </div>\
            <button class="btn btn-primary" onclick="myContestsAddNew()">+ Novo Concurso</button>\
            <div class="contests-sections">\
                ' + (activeContests.length > 0 ? this.renderSection('Em Andamento', activeContests, 'active') : '') + '\
                ' + (plannedContests.length > 0 ? this.renderSection('Planejados', plannedContests, 'planned') : '') + '\
                ' + (completedContests.length > 0 ? this.renderSection('Concluídos', completedContests, 'completed') : '') + '\
            </div>\
        </div>';
    };

    MyContests.prototype.renderSection = function(title, contests, status) {
        var self = this;
        return '<section class="contests-section">\
            <h2 class="section-title">' + title + '</h2>\
            <div class="contests-grid">\
                ' + contests.map(function(contest) {
                    return self.renderContestCard(contest);
                }).join('') + '\
            </div>\
        </section>';
    };

    MyContests.prototype.renderContestCard = function(contest) {
        var progress = contest.studyProgress || 0;
        return '<div class="contest-card">\
            <div class="contest-header">\
                <span class="contest-status status-' + (contest.status || 'planned') + '">' + this.getStatusLabel(contest.status) + '</span>\
            </div>\
            <h3 class="contest-name">' + escapeHtml(contest.name || '') + '</h3>\
            <p class="contest-institution">' + escapeHtml(contest.institution || '') + ' - ' + (contest.year || 'N/A') + '</p>\
            <div class="progress-section">\
                <div class="progress-header">\
                    <span>Progresso</span>\
                    <span class="progress-value">' + Math.round(progress) + '%</span>\
                </div>\
                <div class="progress-bar">\
                    <div class="progress-fill" style="width: ' + progress + '%"></div>\
                </div>\
            </div>\
            <div class="contest-actions">\
                <button class="btn btn-primary btn-sm" onclick="window.AppState.goTo(\'quiz\', {contestId: ' + contest.id + '})">Continuar</button>\
                <button class="btn btn-secondary btn-sm" onclick="myContestsEdit(' + contest.id + ')">Editar</button>\
                <button class="btn btn-danger btn-sm" onclick="myContestsDelete(' + contest.id + ')">Excluir</button>\
            </div>\
        </div>';
    };

    MyContests.prototype.getStatusLabel = function(status) {
        var labels = {'active': 'Em Andamento', 'planned': 'Planejado', 'completed': 'Concluído'};
        return labels[status] || 'Planejado';
    };

    MyContests.prototype.bindEvents = function() {
        // Botões inline já configurados
    };

    MyContests.prototype.unmount = function() {
        var styles = document.querySelectorAll('style');
        for (var i = 0; i < styles.length; i++) {
            if (styles[i].textContent.includes('my-contests')) {
                styles[i].remove();
                break;
            }
        }
    };

    // Funções auxiliares globais
    window.myContestsAddNew = function() {
        var name = prompt('Nome do concurso:');
        if (!name) return;
        
        var institution = prompt('Instituição:') || '';
        var year = prompt('Ano:') || new Date().getFullYear();
        
        db.contests.add({
            name: name,
            institution: institution,
            year: parseInt(year),
            status: 'planned',
            studyProgress: 0,
            totalQuestions: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }).then(function() {
            window.AppState.showToast('Concurso adicionado!', 'success');
            window.AppState.navigate('my-contests');
        });
    };

    window.myContestsEdit = function(id) {
        db.contests.get(id).then(function(contest) {
            var name = prompt('Nome do concurso:', contest.name);
            if (name === null) return;
            
            var institution = prompt('Instituição:', contest.institution) || '';
            var year = prompt('Ano:', contest.year) || new Date().getFullYear();
            var status = prompt('Status (planned, active, completed):', contest.status) || 'planned';
            
            db.contests.update(id, {
                name: name,
                institution: institution,
                year: parseInt(year),
                status: status,
                updatedAt: new Date()
            }).then(function() {
                window.AppState.showToast('Concurso atualizado!', 'success');
                window.AppState.navigate('my-contests');
            });
        });
    };

    window.myContestsDelete = function(id) {
        if (confirm('Tem certeza que deseja excluir este concurso?')) {
            db.contests.delete(id).then(function() {
                window.AppState.showToast('Concurso excluído!', 'success');
                window.AppState.navigate('my-contests');
            });
        }
    };

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return MyContests;
})();

// MyContests loaded
