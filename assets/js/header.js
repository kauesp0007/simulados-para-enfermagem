/**
 * Header JavaScript Module
 * Gerencia o cabeçalho, navegação e funcionalidades do header
 * Integração com EventBus para comunicação entre módulos
 */
(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES E CONSTANTES
    // ============================================
    const CONFIG = {
        storageKeys: {
            fontSize: 'ec_font_size',
            theme: 'ec_theme',
            language: 'ec_language'
        },
        fontSizeLevels: [0.875, 1, 1.125, 1.25, 1.5],
        fontSizeLabels: ['85%', '100%', '112.5%', '125%', '150%'],
        megaMenuBreakpoint: 1024
    };

    // ============================================
    // ESTADO DO MÓDULO
    // ============================================
    const state = {
        currentFontIndex: 1,
        isDarkMode: false,
        initialized: false,
        eventBusReady: false,
        activeMegaPanel: null
    };

    // ============================================
    // EVENTBUS INTEGRATION
    // ============================================
    function setupEventBusIntegration() {
        if (!window.EventBus) {
            window.addEventListener('eventbus:ready', function onEventBusReady() {
                window.removeEventListener('eventbus:ready', onEventBusReady);
                registerEventBusListeners();
                state.eventBusReady = true;
                console.log('[Header] EventBus integration activated');
            });
        } else {
            registerEventBusListeners();
            state.eventBusReady = true;
        }
    }

    function registerEventBusListeners() {
        if (!window.EventBus) return;

        // Escutar eventos do ThemeManager
        window.EventBus.on('theme:changed', function(data) {
            const isDark = data.isDark || data.theme === 'dark';
            state.isDarkMode = isDark;
            updateThemeIcons(isDark);
            console.log('[Header] Tema atualizado via EventBus:', data.theme);
        }, { module: 'header' });

        // Escutar mudanças de fonte
        window.EventBus.on('font:changed', function(data) {
            if (data.size && data.index !== undefined) {
                state.currentFontIndex = data.index;
                updateFontButtons();
            }
        }, { module: 'header' });

        // Escutar comando para sincronizar estado
        window.EventBus.on('header:sync', function() {
            syncWithAccessibility();
        }, { module: 'header' });
    }

    function emitHeaderEvent(eventName, data) {
        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('header:' + eventName, {
                ...data,
                source: 'header',
                timestamp: Date.now()
            });
        }
        window.dispatchEvent(new CustomEvent('header:' + eventName, {
            detail: { ...data, source: 'header' }
        }));
    }

    // ============================================
    // UTILITÁRIOS
    // ============================================
    function log(message, type = 'info') {
        console[`${type}`](`[Header] ${message}`);
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

    // ============================================
    // GERENCIAMENTO DE FUNDO
    // ============================================
    const ThemeManager = {
        init() {
            // Tentar carregar tema salvo
            const savedTheme = localStorage.getItem(CONFIG.storageKeys.theme);
            if (savedTheme) {
                state.isDarkMode = savedTheme === 'dark';
            } else {
                // Detectar preferência do sistema
                state.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            
            this.applyTheme(state.isDarkMode);
            log('ThemeManager inicializado');
        },

        toggle() {
            state.isDarkMode = !state.isDarkMode;
            this.applyTheme(state.isDarkMode);
            
            // Salvar preferência
            try {
                localStorage.setItem(CONFIG.storageKeys.theme, state.isDarkMode ? 'dark' : 'light');
            } catch (e) {
                log('localStorage indisponível', 'warn');
            }
            
            // Emitir evento
            emitHeaderEvent('theme:changed', { 
                theme: state.isDarkMode ? 'dark' : 'light', 
                isDark: state.isDarkMode 
            });
        },

        applyTheme(isDark) {
            document.body.classList.toggle('dark-theme', isDark);
            updateThemeIcons(isDark);
        },

        isDarkMode() {
            return state.isDarkMode;
        }
    };

    // ============================================
    // GERENCIADOR DE TAMANHO DA FONTE
    // ============================================
    const FontManager = {
        init() {
            // Carregar tamanho salvo
            try {
                const savedIndex = localStorage.getItem(CONFIG.storageKeys.fontSize);
                if (savedIndex !== null) {
                    state.currentFontIndex = parseInt(savedIndex, 10);
                }
            } catch (e) {
                log('localStorage indisponível', 'warn');
            }
            
            this.applyFontSize(state.currentFontIndex);
            this.setupButtons();
            log('FontManager inicializado');
        },

        setupButtons() {
            const decreaseBtn = getElement('font-decrease');
            const increaseBtn = getElement('font-increase');
            
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => this.decrease());
            }
            
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => this.increase());
            }
            
            updateFontButtons();
        },

        decrease() {
            if (state.currentFontIndex > 0) {
                state.currentFontIndex--;
                this.applyFontSize(state.currentFontIndex);
                this.save();
            }
        },

        increase() {
            if (state.currentFontIndex < CONFIG.fontSizeLevels.length - 1) {
                state.currentFontIndex++;
                this.applyFontSize(state.currentFontIndex);
                this.save();
            }
        },

        applyFontSize(index) {
            const multiplier = CONFIG.fontSizeLevels[index];
            document.documentElement.style.setProperty('--font-size-multiplier', multiplier);
            document.body.setAttribute('data-font-index', index);
            updateFontButtons();
            
            // Emitir evento
            emitHeaderEvent('font:changed', { 
                size: CONFIG.fontSizeLevels[index], 
                index: index 
            });
        },

        save() {
            try {
                localStorage.setItem(CONFIG.storageKeys.fontSize, state.currentFontIndex);
            } catch (e) {
                log('localStorage indisponível', 'warn');
            }
        },

        reset() {
            state.currentFontIndex = 1;
            this.applyFontSize(state.currentFontIndex);
            this.save();
        }
    };

    // ============================================
    // MENU MEGA
    // ============================================
    const MegaMenu = {
        init() {
            this.setupMenuToggle();
            this.setupMobileMenu();
            this.setupKeyboardNavigation();
            log('MegaMenu inicializado');
        },

        setupMenuToggle() {
            const menuItems = $$('.nav-item-has-children');
            
            menuItems.forEach(item => {
                const link = item.querySelector('.nav-link');
                const panel = item.querySelector('.mega-panel, .submenu');
                
                if (link && panel) {
                    // Desktop: hover
                    item.addEventListener('mouseenter', () => this.openPanel(panel));
                    item.addEventListener('mouseleave', () => this.closePanel(panel));
                    
                    // Mobile: clique
                    link.addEventListener('click', (e) => {
                        if (window.innerWidth < CONFIG.megaMenuBreakpoint) {
                            e.preventDefault();
                            this.toggleMobilePanel(item, panel);
                        }
                    });
                }
            });
        },

        setupMobileMenu() {
            const menuToggle = getElement('menu-toggle');
            const mobileMenu = getElement('mobile-menu');
            
            if (menuToggle && mobileMenu) {
                menuToggle.addEventListener('click', () => {
                    mobileMenu.classList.toggle('active');
                    menuToggle.classList.toggle('active');
                    document.body.classList.toggle('menu-open');
                    
                    // Atualizar aria
                    const isOpen = mobileMenu.classList.contains('active');
                    menuToggle.setAttribute('aria-expanded', isOpen);
                });
            }
            
            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.main-header') && !e.target.closest('.mobile-menu')) {
                    this.closeAllPanels();
                }
            });
        },

        setupKeyboardNavigation() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAllPanels();
                }
            });
        },

        openPanel(panel) {
            if (!panel) return;
            
            // Fechar outros painéis
            this.closeAllPanels();
            
            panel.classList.add('active');
            panel.setAttribute('aria-hidden', 'false');
            state.activeMegaPanel = panel;
            
            // Emitir evento
            emitHeaderEvent('menu:opened', { panel: panel.id });
        },

        closePanel(panel) {
            if (!panel) return;
            
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
            
            if (state.activeMegaPanel === panel) {
                state.activeMegaPanel = null;
            }
            
            emitHeaderEvent('menu:closed', { panel: panel.id });
        },

        toggleMobilePanel(item, panel) {
            if (panel.classList.contains('active')) {
                panel.classList.remove('active');
                item.classList.remove('submenu-active');
            } else {
                // Fechar outros
                $$('.mega-panel.active, .submenu.active').forEach(p => {
                    p.classList.remove('active');
                });
                $$('.nav-item-has-children.submenu-active').forEach(i => {
                    i.classList.remove('submenu-active');
                });
                
                panel.classList.add('active');
                item.classList.add('submenu-active');
            }
        },

        closeAllPanels() {
            $$('.mega-panel.active, .submenu.active, .mobile-menu.active').forEach(panel => {
                panel.classList.remove('active');
            });
            $$('.nav-item-has-children.submenu-active').forEach(item => {
                item.classList.remove('submenu-active');
            });
            
            const menuToggle = getElement('menu-toggle');
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            
            document.body.classList.remove('menu-open');
            state.activeMegaPanel = null;
        }
    };

    // ============================================
    // ATUALIZAÇÕES DE UI
    // ============================================
    function updateThemeIcons(isDark) {
        const themeIcons = $$('.theme-icon');
        themeIcons.forEach(icon => {
            if (isDark) {
                icon.textContent = '☀️';
                icon.setAttribute('aria-label', 'Alternar para tema claro');
            } else {
                icon.textContent = '🌙';
                icon.setAttribute('aria-label', 'Alternar para tema escuro');
            }
        });
    }

    function updateFontButtons() {
        const decreaseBtn = getElement('font-decrease');
        const increaseBtn = getElement('font-increase');
        const currentLabel = getElement('font-current');
        
        if (decreaseBtn) {
            decreaseBtn.disabled = state.currentFontIndex <= 0;
            decreaseBtn.classList.toggle('disabled', state.currentFontIndex <= 0);
        }
        
        if (increaseBtn) {
            increaseBtn.disabled = state.currentFontIndex >= CONFIG.fontSizeLevels.length - 1;
            increaseBtn.classList.toggle('disabled', state.currentFontIndex >= CONFIG.fontSizeLevels.length - 1);
        }
        
        if (currentLabel) {
            currentLabel.textContent = CONFIG.fontSizeLabels[state.currentFontIndex];
        }
    }

    // ============================================
    // SINCRONIZAÇÃO COM ACCESSIBILITY
    // ============================================
    function syncWithAccessibility() {
        // Sincronizar configurações do Accessibility Manager
        if (window.AccessibilityAPI) {
            const accessibilityState = window.AccessibilityAPI.getState();
            if (accessibilityState && accessibilityState.currentSettings) {
                const settings = accessibilityState.currentSettings;
                
                // Sincronizar fonte
                if (settings.fontSize !== undefined) {
                    // Encontrar índice correspondente
                    const fontIndex = CONFIG.fontSizeLevels.indexOf(settings.fontSize);
                    if (fontIndex !== -1) {
                        state.currentFontIndex = fontIndex;
                        FontManager.applyFontSize(fontIndex);
                    }
                }
                
                // Sincronizar tema
                if (settings.contrast === 'dark-contrast' || settings.contrast === 'high-contrast-dark') {
                    state.isDarkMode = true;
                    ThemeManager.applyTheme(true);
                } else if (settings.contrast === 'normal' || settings.contrast === 'light-contrast') {
                    state.isDarkMode = false;
                    ThemeManager.applyTheme(false);
                }
            }
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
        
        log('Inicializando módulo do header...');
        
        // Verificar se elementos existem
        if (!$('.main-header')) {
            log('Header não encontrado no DOM', 'warn');
            return;
        }
        
        // Inicializar gerenciadores
        ThemeManager.init();
        FontManager.init();
        MegaMenu.init();
        
        // Setup EventBus
        setupEventBusIntegration();
        
        // Configurar listeners globais
        setupGlobalListeners();
        
        state.initialized = true;
        log('Módulo do header inicializado com sucesso');
        
        // Emitir evento de ready
        emitHeaderEvent('ready', { initialized: true });
    }

    function setupGlobalListeners() {
        const themeToggle = getElement('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => ThemeManager.toggle());
        }
        
        const fontReset = getElement('font-reset');
        if (fontReset) {
            fontReset.addEventListener('click', () => FontManager.reset());
        }
    }

    // ============================================
    // EXPOSIÇÃO DA API PÚBLICA
    // ============================================
    window.HeaderInit = init;
    window.HeaderAPI = {
        toggleTheme: () => ThemeManager.toggle(),
        increaseFont: () => FontManager.increase(),
        decreaseFont: () => FontManager.decrease(),
        resetFont: () => FontManager.reset(),
        openMenu: () => MegaMenu.openPanel(),
        closeMenu: () => MegaMenu.closeAllPanels(),
        isDarkMode: () => ThemeManager.isDarkMode(),
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

    console.log('Header module loaded');
})();
