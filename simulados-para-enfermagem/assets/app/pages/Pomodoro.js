/**
 * Pomodoro Timer
 * Técnica Pomodoro para gerenciamento de tempo de estudo
 */

var Pomodoro = (function() {
    'use strict';

    function Pomodoro(options) {
        this.options = options || {};
        this.db = options.db;
        this.auth = options.auth;
        this.toast = options.toast;
        this.title = 'Pomodoro';
        this.timer = null;
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.isPaused = false;
        this.mode = 'focus';
        this.settings = {
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15,
            soundEnabled: true
        };
    }

    Pomodoro.prototype.mount = function(params) {
        this.loadSettings();
        this.render();
        this.bindEvents();
    };

    Pomodoro.prototype.loadSettings = function() {
        try {
            var saved = localStorage.getItem('pomodoroSettings');
            if (saved) {
                this.settings = JSON.parse(saved);
            }
            this.timeLeft = this.settings.focusTime * 60;
        } catch (e) {
            console.warn('Erro ao carregar configurações:', e);
        }
    };

    Pomodoro.prototype.render = function() {
        var mainContent = document.getElementById('main-content');
        var timeDisplay = this.formatTime(this.timeLeft);
        var modeLabel = this.getModeLabel();

        mainContent.innerHTML = '<div class="page pomodoro">\
            <header class="page-header">\
                <h1>🍅 Técnica Pomodoro</h1>\
                <p>Gerencie seu tempo de estudo com eficiência</p>\
            </header>\
            <div class="pomodoro-container">\
                <div class="timer-section">\
                    <div class="mode-tabs">\
                        <button class="mode-tab ' + (this.mode === 'focus' ? 'active' : '') + '" data-mode="focus">Foco</button>\
                        <button class="mode-tab ' + (this.mode === 'shortBreak' ? 'active' : '') + '" data-mode="shortBreak">Pausa Curta</button>\
                        <button class="mode-tab ' + (this.mode === 'longBreak' ? 'active' : '') + '" data-mode="longBreak">Pausa Longa</button>\
                    </div>\
                    <div class="timer-display">\
                        <div class="timer-circle">\
                            <svg class="timer-svg" viewBox="0 0 200 200">\
                                <circle class="timer-bg" cx="100" cy="100" r="90"></circle>\
                                <circle class="timer-progress" cx="100" cy="100" r="90" style="stroke-dashoffset: ' + this.getProgressOffset() + '"></circle>\
                            </svg>\
                            <div class="timer-text">\
                                <span class="time-display">' + timeDisplay + '</span>\
                                <span class="mode-display">' + modeLabel + '</span>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="timer-controls">\
                        ' + (this.isRunning ? 
                            '<button class="btn btn-secondary btn-lg" onclick="pomodoroPause()">Pausar</button>' :
                            '<button class="btn btn-primary btn-lg" onclick="pomodoroStart()">' + (this.isPaused ? 'Continuar' : 'Iniciar') + '</button>'
                        ) + '\
                        <button class="btn btn-outline btn-lg" onclick="pomodoroReset()">Reiniciar</button>\
                    </div>\
                </div>\
                <div class="settings-section">\
                    <h3>Configurações</h3>\
                    <div class="setting-item">\
                        <label>Tempo de Foco (minutos)</label>\
                        <input type="number" id="focus-time" value="' + this.settings.focusTime + '" min="1" max="60">\
                    </div>\
                    <div class="setting-item">\
                        <label>Pausa Curta (minutos)</label>\
                        <input type="number" id="short-break" value="' + this.settings.shortBreak + '" min="1" max="30">\
                    </div>\
                    <div class="setting-item">\
                        <label>Pausa Longa (minutos)</label>\
                        <input type="number" id="long-break" value="' + this.settings.longBreak + '" min="1" max="60">\
                    </div>\
                    <button class="btn btn-primary" onclick="pomodoroSaveSettings()">Salvar Configurações</button>\
                </div>\
            </div>\
        </div>';
    };

    Pomodoro.prototype.bindEvents = function() {
        var self = this;
        document.querySelectorAll('.mode-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                self.switchMode(this.dataset.mode);
            });
        });
    };

    Pomodoro.prototype.switchMode = function(mode) {
        this.mode = mode;
        this.pause();
        
        switch (mode) {
            case 'focus':
                this.timeLeft = this.settings.focusTime * 60;
                break;
            case 'shortBreak':
                this.timeLeft = this.settings.shortBreak * 60;
                break;
            case 'longBreak':
                this.timeLeft = this.settings.longBreak * 60;
                break;
        }
        
        this.render();
        this.bindEvents();
    };

    Pomodoro.prototype.start = function() {
        if (this.isRunning) return;
        
        var self = this;
        this.isRunning = true;
        this.isPaused = false;
        
        this.timer = setInterval(function() {
            self.timeLeft--;
            
            if (self.timeLeft <= 0) {
                self.complete();
            } else {
                self.updateDisplay();
            }
        }, 1000);
        
        this.updateDisplay();
        this.toast('Timer iniciado!', 'success');
    };

    Pomodoro.prototype.pause = function() {
        this.isRunning = false;
        this.isPaused = true;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.render();
        this.bindEvents();
    };

    Pomodoro.prototype.reset = function() {
        this.pause();
        
        switch (this.mode) {
            case 'focus':
                this.timeLeft = this.settings.focusTime * 60;
                break;
            case 'shortBreak':
                this.timeLeft = this.settings.shortBreak * 60;
                break;
            case 'longBreak':
                this.timeLeft = this.settings.longBreak * 60;
                break;
        }
        
        this.updateDisplay();
        this.render();
        this.bindEvents();
    };

    Pomodoro.prototype.complete = function() {
        this.pause();
        
        if (this.settings.soundEnabled) {
            this.playSound();
        }
        
        this.toast(this.mode === 'focus' ? 'Sessão de foco concluída! 🎉' : 'Pausa terminada!', 'success');
        
        if (this.mode === 'focus') {
            // Salvar sessão
            var today = new Date().toDateString();
            db.studySessions.add({
                type: 'pomodoro',
                date: today,
                duration: this.settings.focusTime * 60,
                createdAt: new Date()
            });
        }
        
        // Sugerir próximo modo
        if (this.mode === 'focus') {
            var nextMode = 'shortBreak';
            if (confirm('Sessão concluída! Deseja iniciar uma pausa curta?')) {
                this.switchMode(nextMode);
            }
        } else {
            if (confirm('Pausa terminada! Deseja voltar ao foco?')) {
                this.switchMode('focus');
            }
        }
    };

    Pomodoro.prototype.updateDisplay = function() {
        var timeDisplay = document.querySelector('.time-display');
        if (timeDisplay) {
            timeDisplay.textContent = this.formatTime(this.timeLeft);
        }
        
        var progressCircle = document.querySelector('.timer-progress');
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = this.getProgressOffset();
        }
        
        document.title = this.formatTime(this.timeLeft) + ' - Pomodoro';
    };

    Pomodoro.prototype.getProgressOffset = function() {
        var totalTime = this.getTotalTime();
        var progress = (totalTime - this.timeLeft) / totalTime;
        return 565.48 * (1 - progress);
    };

    Pomodoro.prototype.getTotalTime = function() {
        switch (this.mode) {
            case 'focus': return this.settings.focusTime * 60;
            case 'shortBreak': return this.settings.shortBreak * 60;
            case 'longBreak': return this.settings.longBreak * 60;
            default: return 25 * 60;
        }
    };

    Pomodoro.prototype.getModeLabel = function() {
        var labels = {'focus': 'Tempo de Foco', 'shortBreak': 'Pausa Curta', 'longBreak': 'Pausa Longa'};
        return labels[this.mode] || 'Timer';
    };

    Pomodoro.prototype.formatTime = function(seconds) {
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
    };

    Pomodoro.prototype.playSound = function() {
        try {
            var audioContext = new (window.AudioContext || window.webkitAudioContext)();
            var oscillator = audioContext.createOscillator();
            var gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            
            setTimeout(function() {
                oscillator.stop();
                audioContext.close();
            }, 300);
        } catch (e) {
            console.warn('Não foi possível reproduzir som:', e);
        }
    };

    Pomodoro.prototype.saveSettings = function() {
        var focusTime = parseInt(document.getElementById('focus-time').value) || 25;
        var shortBreak = parseInt(document.getElementById('short-break').value) || 5;
        var longBreak = parseInt(document.getElementById('long-break').value) || 15;
        
        this.settings = {
            focusTime: focusTime,
            shortBreak: shortBreak,
            longBreak: longBreak,
            soundEnabled: this.settings.soundEnabled
        };
        
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
        
        this.reset();
        this.toast('Configurações salvas!', 'success');
    };

    Pomodoro.prototype.unmount = function() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    };

    // Funções globais
    window.pomodoroStart = function() {
        var pomodoro = window.AppState.currentPage;
        if (pomodoro) pomodoro.start();
    };

    window.pomodoroPause = function() {
        var pomodoro = window.AppState.currentPage;
        if (pomodoro) pomodoro.pause();
    };

    window.pomodoroReset = function() {
        var pomodoro = window.AppState.currentPage;
        if (pomodoro) pomodoro.reset();
    };

    window.pomodoroSaveSettings = function() {
        var pomodoro = window.AppState.currentPage;
        if (pomodoro) pomodoro.saveSettings();
    };

    return Pomodoro;
})();

// Pomodoro loaded
