/**
 * =====================================================
 * ACESSIBILIDADE - Simulados para Enfermagem
 * Arquivo: accessibility-v4-dashboard.js
 * Descrição: JavaScript para o painel de acessibilidade
 * =====================================================
 */

(function() {
    'use strict';

    // Namespace para acessibilidade
    var AccessibilityWidget = window.AccessibilityWidget || {};

    /**
     * Inicializa o widget de acessibilidade
     */
    AccessibilityWidget.init = function() {
        cacheElements();
        loadSettings();
        bindEvents();
        applySettings();
    };

    // Elementos cacheados
    var elements = {};

    /**
     * Cacheia os elementos do DOM
     */
    function cacheElements() {
        elements.panel = document.getElementById('accessibility-panel');
        elements.toggle = document.getElementById('accessibility-toggle');
        elements.menu = document.getElementById('accessibility-menu');
        elements.close = document.getElementById('accessibility-close');
        elements.darkModeBtn = document.getElementById('btn-dark-mode');
        elements.lightModeBtn = document.getElementById('btn-light-mode');
        elements.highContrastBtn = document.getElementById('btn-high-contrast');
        elements.largeTextBtn = document.getElementById('btn-large-text');
        elements.reduceMotionBtn = document.getElementById('btn-reduce-motion');
        elements.resetBtn = document.getElementById('btn-reset-accessibility');
    }

    // Estado atual
    var state = {
        darkMode: false,
        highContrast: false,
        largeText: false,
        reduceMotion: false
    };

    // Chave para localStorage
    var storageKey = 'accessibility_widget_settings';

    /**
     * Carrega configurações do localStorage
     */
    function loadSettings() {
        try {
            var saved = localStorage.getItem(storageKey);
            if (saved) {
                state = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Não foi possível carregar configurações de acessibilidade:', e);
        }
    }

    /**
     * Salva configurações no localStorage
     */
    function saveSettings() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (e) {
            console.warn('Não foi possível salvar configurações de acessibilidade:', e);
        }
    }

    /**
     * Vincula eventos aos elementos
     */
    function bindEvents() {
        // Toggle do menu
        if (elements.toggle) {
            elements.toggle.addEventListener('click', toggleMenu);
        }

        // Fechar menu
        if (elements.close) {
            elements.close.addEventListener('click', closeMenu);
        }

        // Modo escuro
        if (elements.darkModeBtn) {
            elements.darkModeBtn.addEventListener('click', toggleDarkMode);
        }

        // Modo claro
        if (elements.lightModeBtn) {
            elements.lightModeBtn.addEventListener('click', toggleLightMode);
        }

        // Alto contraste
        if (elements.highContrastBtn) {
            elements.highContrastBtn.addEventListener('click', toggleHighContrast);
        }

        // Aumentar fonte
        if (elements.largeTextBtn) {
            elements.largeTextBtn.addEventListener('click', toggleLargeText);
        }

        // Reduzir animações
        if (elements.reduceMotionBtn) {
            elements.reduceMotionBtn.addEventListener('click', toggleReduceMotion);
        }

        // Restaurar padrões
        if (elements.resetBtn) {
            elements.resetBtn.addEventListener('click', resetSettings);
        }

        // Fechar ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && elements.menu && elements.menu.classList.contains('open')) {
                closeMenu();
            }
        });

        // Fechar ao clicar fora
        document.addEventListener('click', function(e) {
            if (elements.panel && !elements.panel.contains(e.target)) {
                closeMenu();
            }
        });
    }

    /**
     * Alterna a abertura do menu
     */
    function toggleMenu() {
        if (!elements.menu || !elements.toggle) return;

        var isOpen = elements.menu.classList.contains('open');

        if (isOpen) {
            closeMenu();
        } else {
            elements.menu.classList.add('open');
            elements.toggle.classList.add('active');
            elements.toggle.setAttribute('aria-expanded', 'true');
            elements.menu.setAttribute('aria-hidden', 'false');

            // Focar no primeiro botão
            var firstBtn = elements.menu.querySelector('.accessibility-btn');
            if (firstBtn) {
                setTimeout(function() {
                    firstBtn.focus();
                }, 100);
            }

            announceChange('Menu de acessibilidade aberto');
        }
    }

    /**
     * Fecha o menu
     */
    function closeMenu() {
        if (!elements.menu || !elements.toggle) return;

        elements.menu.classList.remove('open');
        elements.toggle.classList.remove('active');
        elements.toggle.setAttribute('aria-expanded', 'false');
        elements.menu.setAttribute('aria-hidden', 'true');
        elements.toggle.focus();

        announceChange('Menu de acessibilidade fechado');
    }

    /**
     * Alterna o modo escuro
     */
    function toggleDarkMode() {
        state.darkMode = !state.darkMode;

        document.body.classList.toggle('dark-mode', state.darkMode);
        updateButtonState(elements.darkModeBtn, state.darkMode);

        // Sincroniza com o Header Manager se existir
        if (window.HeaderManager && window.HeaderManager.theme) {
            if (state.darkMode) {
                window.HeaderManager.theme.setDark();
            } else {
                window.HeaderManager.theme.setLight();
            }
        }

        saveSettings();
        announceChange(state.darkMode ? 'Modo escuro ativado' : 'Modo escuro desativado');
    }

    /**
     * Alterna para o modo claro
     */
    function toggleLightMode() {
        state.darkMode = false;
        state.highContrast = false;

        document.body.classList.remove('dark-mode');
        document.body.removeAttribute('data-contrast');

        updateButtonState(elements.darkModeBtn, false);
        updateButtonState(elements.highContrastBtn, false);

        // Sincroniza com o Header Manager se existir
        if (window.HeaderManager && window.HeaderManager.theme) {
            window.HeaderManager.theme.setLight();
        }

        saveSettings();
        announceChange('Modo claro ativado');
    }

    /**
     * Alterna alto contraste
     */
    function toggleHighContrast() {
        state.highContrast = !state.highContrast;

        document.body.setAttribute('data-contrast', state.highContrast ? 'high' : 'normal');
        updateButtonState(elements.highContrastBtn, state.highContrast);

        // Desativa modo escuro se alto contraste estiver ativo
        if (state.highContrast && state.darkMode) {
            state.darkMode = false;
            document.body.classList.remove('dark-mode');
            updateButtonState(elements.darkModeBtn, false);
        }

        saveSettings();
        announceChange(state.highContrast ? 'Alto contraste ativado' : 'Alto contraste desativado');
    }

    /**
     * Alterna texto grande
     */
    function toggleLargeText() {
        state.largeText = !state.largeText;

        document.body.classList.toggle('large-text', state.largeText);
        updateButtonState(elements.largeTextBtn, state.largeText);

        // Atualiza tamanho da fonte no documento
        if (state.largeText) {
            document.documentElement.style.fontSize = '120%';
        } else {
            document.documentElement.style.fontSize = '100%';
        }

        // Sincroniza com o Header Manager se existir
        if (window.HeaderManager && window.HeaderManager.fontSize) {
            if (state.largeText) {
                document.documentElement.style.fontSize = '120%';
            }
        }

        saveSettings();
        announceChange(state.largeText ? 'Texto grande ativado' : 'Texto normal');
    }

    /**
     * Alterna redução de animações
     */
    function toggleReduceMotion() {
        state.reduceMotion = !state.reduceMotion;

        document.body.classList.toggle('reduce-motion', state.reduceMotion);
        document.body.setAttribute('data-reduce-motion', state.reduceMotion ? 'reduce' : 'prefers-reduced-motion');
        updateButtonState(elements.reduceMotionBtn, state.reduceMotion);

        // Notifica mídia query
        if (state.reduceMotion && window.matchMedia) {
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: function(query) {
                    var original = originalMatchMedia(query);
                    if (query.includes('prefers-reduced-motion') && state.reduceMotion) {
                        return { matches: true, addListener: function() {}, removeListener: function() {} };
                    }
                    return original(query);
                }
            });
        }

        saveSettings();
        announceChange(state.reduceMotion ? 'Animações reduzidas' : 'Animações normais');
    }

    /**
     * Armazena matchMedia original
     */
    var originalMatchMedia = window.matchMedia;

    /**
     * Restaura configurações padrão
     */
    function resetSettings() {
        // Reseta estado
        state = {
            darkMode: false,
            highContrast: false,
            largeText: false,
            reduceMotion: false
        };

        // Reseta classes do body
        document.body.classList.remove('dark-mode', 'large-text', 'reduce-motion');
        document.body.removeAttribute('data-contrast');
        document.body.removeAttribute('data-reduce-motion');
        document.documentElement.style.fontSize = '100%';

        // Atualiza todos os botões
        updateButtonState(elements.darkModeBtn, false);
        updateButtonState(elements.highContrastBtn, false);
        updateButtonState(elements.largeTextBtn, false);
        updateButtonState(elements.reduceMotionBtn, false);

        // Sincroniza com o Header Manager se existir
        if (window.HeaderManager && window.HeaderManager.theme) {
            window.HeaderManager.theme.setLight();
        }
        if (window.HeaderManager && window.HeaderManager.fontSize) {
            document.documentElement.style.fontSize = '100%';
        }

        saveSettings();
        announceChange('Configurações de acessibilidade restauradas');
    }

    /**
     * Atualiza estado visual de um botão
     */
    function updateButtonState(button, isActive) {
        if (button) {
            button.setAttribute('aria-pressed', isActive);
            button.classList.toggle('active', isActive);
        }
    }

    /**
     * Aplica configurações ao carregar
     */
    function applySettings() {
        // Aplica modo escuro
        if (state.darkMode) {
            document.body.classList.add('dark-mode');
            updateButtonState(elements.darkModeBtn, true);
        }

        // Aplica alto contraste
        if (state.highContrast) {
            document.body.setAttribute('data-contrast', 'high');
            updateButtonState(elements.highContrastBtn, true);
        }

        // Aplica texto grande
        if (state.largeText) {
            document.body.classList.add('large-text');
            document.documentElement.style.fontSize = '120%';
            updateButtonState(elements.largeTextBtn, true);
        }

        // Aplica redução de animações
        if (state.reduceMotion) {
            document.body.classList.add('reduce-motion');
            document.body.setAttribute('data-reduce-motion', 'reduce');
            updateButtonState(elements.reduceMotionBtn, true);
        }

        console.log('[INFO] Widget de acessibilidade inicializado');
    }

    /**
     * Anuncia mudanças para leitores de tela
     */
    function announceChange(message) {
        var announcer = document.getElementById('accessibility-announcer');

        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'accessibility-announcer';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
            document.body.appendChild(announcer);
        }

        announcer.textContent = message;

        // Limpa após um momento
        setTimeout(function() {
            announcer.textContent = '';
        }, 1000);
    }

    // Expõe funções globalmente
    window.AccessibilityWidget = AccessibilityWidget;

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', AccessibilityWidget.init);
    } else {
        AccessibilityWidget.init();
    }

})();
