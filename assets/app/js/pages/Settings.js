/**
 * Configurações do Aplicativo
 * Personalização e preferências do usuário
 */

var Settings = (function() {
    'use strict';

    function Settings(options) {
        this.options = options || {};
        this.db = options.db;
        this.auth = options.auth;
        this.toast = options.toast;
        this.title = 'Configurações';
        this.settings = {
            theme: 'system',
            fontSize: 'medium'
        };
    }

    Settings.prototype.mount = function(params) {
        this.loadSettings();
        this.render();
        this.bindEvents();
    };

    Settings.prototype.loadSettings = function() {
        try {
            var saved = localStorage.getItem('appSettings');
            if (saved) {
                this.settings = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Erro ao carregar configurações:', error);
        }
    };

    Settings.prototype.render = function() {
        var mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = '<div class="page settings">\
            <header class="page-header">\
                <h1>Configurações</h1>\
                <p>Personalize sua experiência de estudo</p>\
            </header>\
            <div class="settings-container">\
                <div class="settings-section">\
                    <h2>Aparência</h2>\
                    <div class="setting-item">\
                        <label>Tema</label>\
                        <select id="theme-select">\
                            <option value="light" ' + (this.settings.theme === 'light' ? 'selected' : '') + '>Claro</option>\
                            <option value="dark" ' + (this.settings.theme === 'dark' ? 'selected' : '') + '>Escuro</option>\
                            <option value="system" ' + (this.settings.theme === 'system' ? 'selected' : '') + '>Automático</option>\
                        </select>\
                    </div>\
                    <div class="setting-item">\
                        <label>Tamanho da Fonte</label>\
                        <select id="font-size-select">\
                            <option value="small" ' + (this.settings.fontSize === 'small' ? 'selected' : '') + '>Pequeno</option>\
                            <option value="medium" ' + (this.settings.fontSize === 'medium' ? 'selected' : '') + '>Médio</option>\
                            <option value="large" ' + (this.settings.fontSize === 'large' ? 'selected' : '') + '>Grande</option>\
                        </select>\
                    </div>\
                </div>\
                <div class="settings-section">\
                    <h2>Dados</h2>\
                    <div class="setting-item">\
                        <label>Exportar Dados</label>\
                        <button class="btn btn-primary" onclick="settingsExportData()">📤 Exportar</button>\
                    </div>\
                    <div class="setting-item">\
                        <label>Importar Dados</label>\
                        <button class="btn btn-secondary" onclick="document.getElementById(\'import-file\').click()">📥 Importar</button>\
                        <input type="file" id="import-file" accept=".json" style="display:none" onchange="settingsImportData(this)">\
                    </div>\
                    <div class="setting-item">\
                        <label>Limpar Dados</label>\
                        <button class="btn btn-danger" onclick="settingsClearData()">🗑️ Limpar</button>\
                    </div>\
                </div>\
                <button class="btn btn-primary btn-block" style="margin-top: 1rem;" onclick="settingsSave()">Salvar Configurações</button>\
            </div>\
        </div>';
    };

    Settings.prototype.bindEvents = function() {
        // Eventos inline
    };

    Settings.prototype.saveSettings = function() {
        this.settings.theme = document.getElementById('theme-select').value;
        this.settings.fontSize = document.getElementById('font-size-select').value;
        
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
        
        // Aplicar tema
        this.applyTheme();
        
        this.toast('Configurações salvas!', 'success');
    };

    Settings.prototype.applyTheme = function() {
        var root = document.documentElement;
        var theme = this.settings.theme;
        
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    };

    Settings.prototype.unmount = function() {};

    // Funções globais
    window.settingsSave = function() {
        var settings = window.AppState.currentPage;
        if (settings) settings.saveSettings();
    };

    window.settingsExportData = async function() {
        try {
            var data = {
                questions: await db.questions.toArray(),
                contests: await db.contests.toArray(),
                publicContests: await db.publicContests.toArray(),
                quizzes: await db.quizzes.toArray(),
                topics: await db.topics.toArray(),
                quizAttempts: await db.quizAttempts.toArray(),
                studySessions: await db.studySessions.toArray()
            };
            
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'enfermagem-backup-' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            window.AppState.showToast('Dados exportados!', 'success');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            window.AppState.showToast('Erro ao exportar dados', 'error');
        }
    };

    window.settingsImportData = async function(input) {
        var file = input.files[0];
        if (!file) return;
        
        try {
            var text = await file.text();
            var data = JSON.parse(text);
            
            if (confirm('Isso substituirá todos os dados. Deseja continuar?')) {
                // Importar dados
                var tables = ['questions', 'contests', 'publicContests', 'quizzes', 'topics', 'quizAttempts', 'studySessions'];
                
                for (var i = 0; i < tables.length; i++) {
                    var table = tables[i];
                    if (data[table] && Array.isArray(data[table])) {
                        await db.transaction('rw', db[table], async function() {
                            await db[table].clear();
                            for (var j = 0; j < data[table].length; j++) {
                                await db[table].add(data[table][j]);
                            }
                        });
                    }
                }
                
                window.AppState.showToast('Dados importados!', 'success');
                setTimeout(function() { location.reload(); }, 1500);
            }
        } catch (error) {
            console.error('Erro ao importar:', error);
            window.AppState.showToast('Erro ao importar dados', 'error');
        }
    };

    window.settingsClearData = function() {
        if (confirm('Tem certeza? Isso excluirá TODOS os dados locais.')) {
            if (confirm('Última confirmação: deseja mesmo limpar todos os dados?')) {
                localStorage.clear();
                db.delete().then(function() {
                    window.AppState.showToast('Dados limpos!', 'success');
                    setTimeout(function() { location.reload(); }, 1000);
                });
            }
        }
    };

    return Settings;
})();

// Settings loaded
