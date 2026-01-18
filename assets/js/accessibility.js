/**
 * Accessibility Widget Module
 * Gerencia o painel de acessibilidade e recursos de acessibilidade
 * Integração com EventBus para comunicação entre módulos
 */
(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES E CONSTANTES
    // ============================================
    const CONFIG = {
        storageKeys: {
            settings: 'ec_accessibility_settings'
        },
        fontSizeLevels: [0.875, 1, 1.125, 1.25, 1.5],
        fontSizeLabels: ['85%', '100%', '112.5%', '125%', '150%']
    };

    // ============================================
    // ESTADO DO MÓDULO
    // ============================================
    const state = {
        elements: {},
        initialized: false,
        isPanelOpen: false,
        eventBusReady: false,
        currentSettings: {
            fontSize: 1,
            contrast: 'normal',
            colorblind: 'none',
            saturation: 'normal',
            cursor: 'normal',
            readingGuide: 'none',
            highlightLinks: false,
            highlightHeaders: false,
            boldText: false,
            stopAnim: false,
            hideImages: false,
            readingMode: false
        }
    };

    // ============================================
    // EVENTBUS INTEGRATION
    // ============================================
    function setupAccessibilityEventBusIntegration() {
        if (!window.EventBus) {
            window.addEventListener('eventbus:ready', function onEventBusReady() {
                window.removeEventListener('eventbus:ready', onEventBusReady);
                registerAccessibilityEventBusListeners();
                state.eventBusReady = true;
                console.log('[Accessibility] EventBus integration activated');
            });
        } else {
            registerAccessibilityEventBusListeners();
            state.eventBusReady = true;
        }
    }

    function registerAccessibilityEventBusListeners() {
        if (!window.EventBus) return;

        // Escutar eventos de theme
        window.EventBus.on('theme:changed', function(data) {
            console.log('[Accessibility] Tema alterado detectado via EventBus:', data.theme);
        }, { module: 'accessibility' });

        // Escutar eventos de fonte
        window.EventBus.on('font:changed', function(data) {
            console.log('[Accessibility] Fonte alterada detectada via EventBus:', data.size);
        }, { module: 'accessibility' });

        // Escutar comandos de sync
        window.EventBus.on('accessibility:request-state', function(data) {
            emitAccessibilityEvent('state:sync', { settings: state.currentSettings });
        }, { module: 'accessibility' });
    }

    function emitAccessibilityEvent(eventName, data) {
        const eventData = {
            ...data,
            source: 'accessibility',
            timestamp: Date.now()
        };

        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('accessibility:' + eventName, eventData);
        }

        window.dispatchEvent(new CustomEvent('accessibility:' + eventName, {
            detail: eventData
        }));
    }

    function emitSettingsChangedEvent(settings) {
        const eventData = {
            settings: settings,
            source: 'accessibility',
            timestamp: Date.now()
        };

        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('accessibility:settings:changed', eventData);
        }

        window.dispatchEvent(new CustomEvent('accessibility:settings:changed', {
            detail: eventData
        }));
    }

    // ============================================
    // UTILITÁRIOS
    // ============================================
    function log(message, type = 'info') {
        console[`${type}`](`[Accessibility] ${message}`);
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function $(selector) {
        return document.querySelector(selector);
    }

    function $$(selector) {
        return document.querySelectorAll(selector);
    }

    function announce(message) {
        const announcer = getElement('sr-announcer') || document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = message;
        
        if (!getElement('sr-announcer')) {
            document.body.appendChild(announcer);
        }
        
        // Limpar após announcements
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }

    // ============================================
    // GERENCIADOR DO PAINEL
    // ============================================
    const PanelManager = {
        open() {
            const { accessibilityPanel, accessibilityToggle } = state.elements;
            if (!accessibilityPanel) return;

            state.isPanelOpen = true;
            accessibilityPanel.classList.remove('accessibility-panel-hidden');
            accessibilityPanel.classList.add('accessibility-panel-visible');

            if (accessibilityToggle) {
                accessibilityToggle.classList.add('active');
                accessibilityToggle.setAttribute('aria-expanded', 'true');
            }

            document.body.style.overflow = 'hidden';
            log('Painel de acessibilidade aberto');
            announce('Painel de acessibilidade aberto');

            // Focar no primeiro elemento interativo
            const firstFocusable = accessibilityPanel.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
        },

        close() {
            const { accessibilityPanel, accessibilityToggle } = state.elements;
            if (!accessibilityPanel) return;

            state.isPanelOpen = false;
            accessibilityPanel.classList.remove('accessibility-panel-visible');
            accessibilityPanel.classList.add('accessibility-panel-hidden');

            if (accessibilityToggle) {
                accessibilityToggle.classList.remove('active');
                accessibilityToggle.setAttribute('aria-expanded', 'false');
            }

            document.body.style.overflow = '';
            log('Painel de acessibilidade fechado');
            announce('Painel de acessibilidade fechado');
        },

        toggle() {
            if (state.isPanelOpen) {
                this.close();
            } else {
                this.open();
            }
        }
    };

    // ============================================
    // GERENCIADOR DE ACESSIBILIDADE
    // ============================================
    const AccessibilityManager = {
        init() {
            this.setupCards();
            this.setupSpecialButtons();
            log('Gerenciador de acessibilidade inicializado');
        },

        setupCards() {
            const cards = $$('.accessibility-card[data-action]');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const action = card.dataset.action;
                    const param = card.dataset.param || null;
                    this.applyAction(action, param);
                });
            });
        },

        setupSpecialButtons() {
            // Atalhos de teclado
            const shortcutsBtn = getElement('shortcuts-btn');
            if (shortcutsBtn) {
                shortcutsBtn.addEventListener('click', () => this.showShortcuts());
            }

            // Restaurar padrões
            const restoreBtn = getElement('accessibility-restore');
            if (restoreBtn) {
                restoreBtn.addEventListener('click', () => {
                    this.restoreAll();
                    announce('Configurações de acessibilidade restauradas para padrões');
                });
            }
        },

        applyAction(action, param) {
            switch (action) {
                case 'font-size':
                    this.applyFontSize(param);
                    break;
                case 'contrast':
                    this.applyContrast(param);
                    break;
                case 'colorblind':
                    this.applyColorblind(param);
                    break;
                case 'saturation':
                    this.applySaturation(param);
                    break;
                case 'cursor':
                    this.applyCursor(param);
                    break;
                case 'reading-guide':
                    this.applyReadingGuide(param);
                    break;
                case 'highlight-links':
                    this.toggleHighlightLinks();
                    break;
                case 'highlight-headers':
                    this.toggleHighlightHeaders();
                    break;
                case 'bold-text':
                    this.toggleBoldText();
                    break;
                case 'stop-anim':
                    this.toggleStopAnim();
                    break;
                case 'hide-images':
                    this.toggleHideImages();
                    break;
                case 'reading-mode':
                    this.toggleReadingMode();
                    break;
                default:
                    log(`Ação desconhecida: ${action}`, 'warn');
            }
            emitSettingsChangedEvent(state.currentSettings);
        },

        applyFontSize(param) {
            let index = state.currentSettings.fontSize;
            
            switch (param) {
                case 'decrease':
                    index = Math.max(0, index - 1);
                    break;
                case 'increase':
                    index = Math.min(CONFIG.fontSizeLevels.length - 1, index + 1);
                    break;
                case 'reset':
                    index = 1;
                    break;
            }
            
            state.currentSettings.fontSize = index;
            const multiplier = CONFIG.fontSizeLevels[index];
            
            document.documentElement.style.setProperty('--font-size-multiplier', multiplier);
            document.body.setAttribute('data-font-index', index);
            
            announce(`Tamanho da fonte: ${CONFIG.fontSizeLabels[index]}`);
            log(`Fonte ajustada para: ${CONFIG.fontSizeLabels[index]}`);
        },

        applyContrast(param) {
            state.currentSettings.contrast = param;
            
            // Remove TODAS as classes de contraste primeiro
            document.body.classList.remove(
                'inverted-colors', 'high-contrast-light', 'high-contrast-dark',
                'inverted', 'light-contrast', 'dark-contrast'
            );

            switch (param) {
                case 'inverted':
                case 'inverted-colors':
                    document.body.classList.add('inverted-colors', 'inverted');
                    announce('Cores invertidas ativadas');
                    break;
                case 'light-contrast':
                    document.body.classList.add('high-contrast-light', 'light-contrast');
                    announce('Alto contraste claro ativado');
                    break;
                case 'dark-contrast':
                    document.body.classList.add('high-contrast-dark', 'dark-contrast');
                    announce('Alto contraste escuro ativado');
                    break;
                default:
                    announce('Contraste normal');
            }
        },

        applyColorblind(param) {
            state.currentSettings.colorblind = param;
            const html = document.documentElement;
            
            // Remove TODAS as classes de daltonismo
            html.classList.remove('protanopia', 'deuteranopia', 'tritanopia');

            if (param !== 'none' && param !== 'normal') {
                html.classList.add(param);
            }

            const labels = {
                protanopia: 'Protanopia',
                deuteranopia: 'Deuteranopia',
                tritanopia: 'Tritanopia'
            };
            
            announce(param !== 'none' && param !== 'normal' ? `${labels[param]} ativado` : 'Filtros de cores desativados');
        },

        applySaturation(param) {
            state.currentSettings.saturation = param;
            
            // Remove TODAS as classes de saturação
            document.body.classList.remove(
                'low-saturation', 'high-saturation', 'monochrome',
                'saturation-low', 'saturation-high'
            );

            switch (param) {
                case 'low':
                case 'saturation-low':
                    document.body.classList.add('low-saturation', 'saturation-low');
                    announce('Baixa saturação ativada');
                    break;
                case 'high':
                case 'saturation-high':
                    document.body.classList.add('high-saturation', 'saturation-high');
                    announce('Alta saturação ativada');
                    break;
                case 'monochrome':
                    document.body.classList.add('monochrome');
                    announce('Modo monocromático ativado');
                    break;
                default:
                    announce('Saturação normal');
            }
        },

        applyCursor(param) {
            state.currentSettings.cursor = param;
            
            // Remove TODAS as classes de cursor
            document.body.classList.remove(
                'large-cursor', 'xl-cursor',
                'big-cursor-medium', 'big-cursor-large', 'big-cursor-xlarge'
            );

            switch (param) {
                case 'medium':
                    document.body.classList.add('large-cursor', 'big-cursor-medium');
                    announce('Cursor grande ativado');
                    break;
                case 'large':
                    document.body.classList.add('xl-cursor', 'big-cursor-large');
                    announce('Cursor extra grande ativado');
                    break;
                default:
                    announce('Cursor normal');
            }
        },

        applyReadingGuide(param) {
            state.currentSettings.readingGuide = param;
            
            // Remove guias existentes
            const existingGuide = document.querySelector('.reading-guide, #reading-guide');
            if (existingGuide) {
                existingGuide.remove();
            }

            if (param !== 'none' && param !== 'off') {
                const guide = document.createElement('div');
                guide.id = 'reading-guide';
                guide.className = 'reading-guide';
                guide.style.display = 'block';

                switch (param) {
                    case 'azul':
                        guide.classList.add('guide-azul');
                        break;
                    case 'laranja':
                        guide.classList.add('guide-laranja');
                        break;
                    case 'preto':
                        guide.classList.add('guide-preto');
                        break;
                }

                document.body.appendChild(guide);

                // Seguir mouse
                document.addEventListener('mousemove', function guideFollow(e) {
                    const g = document.getElementById('reading-guide');
                    if (g) {
                        g.style.top = `${e.clientY - 25}px`;
                        g.style.left = `${e.clientX - 100}px`;
                    } else {
                        document.removeEventListener('mousemove', guideFollow);
                    }
                });

                announce('Guia de leitura ativado');
            } else {
                announce('Guia de leitura desativado');
            }
        },

        toggleHighlightLinks() {
            state.currentSettings.highlightLinks = !state.currentSettings.highlightLinks;
            document.body.classList.toggle('highlight-links', state.currentSettings.highlightLinks);
            announce(state.currentSettings.highlightLinks ? 'Links destacados' : 'Links não destacados');
        },

        toggleHighlightHeaders() {
            state.currentSettings.highlightHeaders = !state.currentSettings.highlightHeaders;
            document.body.classList.toggle('highlight-headers', state.currentSettings.highlightHeaders);
            announce(state.currentSettings.highlightHeaders ? 'Títulos destacados' : 'Títulos não destacados');
        },

        toggleBoldText() {
            state.currentSettings.boldText = !state.currentSettings.boldText;
            document.body.classList.toggle('bold-text', state.currentSettings.boldText);
            announce(state.currentSettings.boldText ? 'Texto em negrito ativado' : 'Texto em negrito desativado');
        },

        toggleStopAnim() {
            state.currentSettings.stopAnim = !state.currentSettings.stopAnim;
            document.body.classList.toggle('reduced-motion', state.currentSettings.stopAnim);
            document.body.classList.toggle('stop-anim', state.currentSettings.stopAnim);

            if (state.currentSettings.stopAnim) {
                document.documentElement.style.setProperty('--transition-duration', '0s');
            } else {
                document.documentElement.style.removeProperty('--transition-duration');
            }

            announce(state.currentSettings.stopAnim ? 'Animações paradas' : 'Animações ativadas');
        },

        toggleHideImages() {
            state.currentSettings.hideImages = !state.currentSettings.hideImages;
            document.body.classList.toggle('hide-images', state.currentSettings.hideImages);
            announce(state.currentSettings.hideImages ? 'Imagens escondidas' : 'Imagens visíveis');
        },

        toggleReadingMode() {
            state.currentSettings.readingMode = !state.currentSettings.readingMode;
            document.body.classList.toggle('reading-mode', state.currentSettings.readingMode);

            if (state.currentSettings.readingMode) {
                document.body.classList.add('hide-navigational', 'focused-content');
            } else {
                document.body.classList.remove('hide-navigational', 'focused-content');
            }

            announce(state.currentSettings.readingMode ? 'Modo leitura ativado' : 'Modo leitura desativado');
        },

        showShortcuts() {
            const modal = getElement('shortcuts-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('visible');
                modal.setAttribute('aria-hidden', 'false');
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // Renderizar atalhos
                this.renderShortcuts();
                
                // Focar no botão de fechar
                const closeBtn = modal.querySelector('#shortcuts-close');
                if (closeBtn) {
                    setTimeout(() => closeBtn.focus(), 100);
                }
            }
        },

        renderShortcuts() {
            const shortcutsList = getElement('shortcuts-list');
            if (!shortcutsList) return;

            const shortcuts = [
                { key: 'Alt + A', action: 'Abrir painel de acessibilidade' },
                { key: 'Alt + +', action: 'Aumentar fonte' },
                { key: 'Alt + -', action: 'Diminuir fonte' },
                { key: 'Alt + 0', action: 'Restaurar tamanho padrão' },
                { key: 'Esc', action: 'Fechar painéis modais' }
            ];

            shortcutsList.innerHTML = shortcuts.map(shortcut => `
                <code>${shortcut.key}</code>
                ${shortcut.action}
            `).join('');
        },

        restoreAll() {
            // Resetar estado interno
            state.currentSettings = {
                fontSize: 1,
                contrast: 'normal',
                colorblind: 'none',
                saturation: 'normal',
                cursor: 'normal',
                readingGuide: 'none',
                highlightLinks: false,
                highlightHeaders: false,
                boldText: false,
                stopAnim: false,
                hideImages: false,
                readingMode: false
            };

            // REMOVER TODAS as classes de acessibilidade do body
            document.body.classList.remove(
                'inverted-colors', 'high-contrast-light', 'high-contrast-dark',
                'inverted', 'light-contrast', 'dark-contrast',
                'low-saturation', 'high-saturation', 'monochrome',
                'saturation-low', 'saturation-high',
                'large-cursor', 'xl-cursor',
                'big-cursor-medium', 'big-cursor-large', 'big-cursor-xlarge',
                'highlight-links', 'highlight-headers',
                'bold-text', 'reduced-motion', 'stop-anim',
                'hide-images', 'reading-mode',
                'hide-navigational', 'focused-content'
            );

            // REMOVER TODAS as classes de acessibilidade do html
            document.documentElement.classList.remove(
                'protanopia', 'deuteranopia', 'tritanopia'
            );

            // Remover guia de leitura
            const readingGuide = document.querySelector('.reading-guide, #reading-guide');
            if (readingGuide) {
                readingGuide.remove();
            }

            // Resetar propriedades CSS inline
            document.documentElement.style.removeProperty('--font-size-multiplier');
            document.documentElement.style.removeProperty('--transition-duration');
            document.body.removeAttribute('data-font-index');

            log('Todos os recursos de acessibilidade restaurados');
            emitSettingsChangedEvent(state.currentSettings);
        }
    };

    // ============================================
    // GERENCIADOR DE EVENTOS
    // ============================================
    function setupEventListeners() {
        const { accessibilityToggle, accessibilityClose, accessibilityPanel } = state.elements;

        // Toggle do painel de acessibilidade
        if (accessibilityToggle) {
            accessibilityToggle.addEventListener('click', () => PanelManager.toggle());
        }

        // Fechar painel de acessibilidade
        if (accessibilityClose) {
            accessibilityClose.addEventListener('click', () => PanelManager.close());
        }

        // Fechar painel ao clicar fora
        if (accessibilityPanel) {
            accessibilityPanel.addEventListener('click', (e) => {
                if (e.target === accessibilityPanel) {
                    PanelManager.close();
                }
            });
        }

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (state.isPanelOpen) {
                    PanelManager.close();
                    return;
                }
                // Fechar modais
                const shortcutsModal = getElement('shortcuts-modal');
                if (shortcutsModal && shortcutsModal.classList.contains('visible')) {
                    shortcutsModal.classList.remove('visible');
                    shortcutsModal.classList.add('hidden');
                    shortcutsModal.setAttribute('aria-hidden', 'true');
                    shortcutsModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }
        });

        // Atalhos de teclado para acessibilidade
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                PanelManager.toggle();
            }
        });

        // Botão de fechar atalhos
        const shortcutsClose = getElement('shortcuts-close');
        if (shortcutsClose) {
            shortcutsClose.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const shortcutsModal = getElement('shortcuts-modal');
                if (shortcutsModal) {
                    shortcutsModal.classList.remove('visible');
                    shortcutsModal.classList.add('hidden');
                    shortcutsModal.setAttribute('aria-hidden', 'true');
                    shortcutsModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }

        // Fechar modal de atalhos ao clicar fora
        const shortcutsModal = getElement('shortcuts-modal');
        if (shortcutsModal) {
            shortcutsModal.addEventListener('click', function(e) {
                if (e.target === shortcutsModal) {
                    shortcutsModal.classList.remove('visible');
                    shortcutsModal.classList.add('hidden');
                    shortcutsModal.setAttribute('aria-hidden', 'true');
                    shortcutsModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function init() {
        if (state.initialized) {
            log('Módulo já inicializado', 'warn');
            return;
        }

        log('Inicializando módulo de acessibilidade...');

        // Selecionar elementos do DOM
        state.elements = {
            accessibilityToggle: getElement('accessibility-panel-toggle'),
            accessibilityClose: getElement('accessibility-close'),
            accessibilityPanel: getElement('accessibility-panel')
        };

        // Verificar se elementos essenciais existem
        if (!state.elements.accessibilityPanel) {
            log('Elementos do painel de acessibilidade não encontrados', 'warn');
            return;
        }

        log('Elementos do DOM encontrados');

        // Iniciar integração com EventBus
        setupAccessibilityEventBusIntegration();

        // Inicializar gerenciadores
        AccessibilityManager.init();
        setupEventListeners();

        state.initialized = true;
        log('Módulo de acessibilidade inicializado com sucesso');

        // Disparar evento de ready
        emitAccessibilityEvent('ready', { initialized: true });
    }

    // ============================================
    // EXPOSIÇÃO DA API PÚBLICA
    // ============================================
    window.AccessibilityInit = init;
    window.AccessibilityAPI = {
        openPanel: () => PanelManager.open(),
        closePanel: () => PanelManager.close(),
        togglePanel: () => PanelManager.toggle(),
        applyAction: (action, param) => AccessibilityManager.applyAction(action, param),
        restoreAll: () => AccessibilityManager.restoreAll(),
        getState: () => ({ ...state })
    };

    // ============================================
    // EXECUTAR QUANDO PRONTO
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 50));
    } else {
        setTimeout(init, 50);
    }

    console.log('Accessibility module loaded');
})();
