/**
 * Main Application Orchestrator
 * Gerencia a navegação e transição entre telas
 */
(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES
    // ============================================
    const CONFIG = {
        defaultPage: 'iniciar',
        transitionDuration: 400
    };

    // ============================================
    // DADOS DOS MÓDULOS (Dashboard)
    // ============================================
    const APP_MODULES = {
        'iniciar': {
            title: 'Enfermagem Concurseira',
            description: 'Sua plataforma de estudos especializada',
            icon: '🏥'
        },
        'dashboard': {
            title: 'Dashboard',
            description: 'Visão geral dos seus estudos',
            icon: '📊'
        },
        'questions': {
            title: 'Banco de Questões',
            description: 'Pratique com questões de concursos',
            icon: '📝',
            route: '#questions'
        },
        'contests': {
            title: 'Concursos',
            description: 'Acompanhe editais e inscrições',
            icon: '📅',
            route: '#contests'
        },
        'simulations': {
            title: 'Simulados',
            description: 'Teste seus conhecimentos',
            icon: '🎯',
            route: '#simulations'
        },
        'library': {
            title: 'Biblioteca',
            description: 'Apostilas, resumos e protocolos',
            icon: '📚',
            route: '#library'
        },
        'calculators': {
            title: 'Calculadoras',
            description: 'Ferramentas de cálculo clínico',
            icon: '🧮',
            route: '#calculators'
        },
        'progress': {
            title: 'Meu Progresso',
            description: 'Acompanhe sua evolução',
            icon: '📈',
            route: '#progress'
        },
        'favorites': {
            title: 'Favoritos',
            description: 'Questões e materiais salvos',
            icon: '⭐',
            route: '#favorites'
        },
        'statistics': {
            title: 'Estatísticas',
            description: 'Análise detalhada do desempenho',
            icon: '📉',
            route: '#statistics'
        },
        'settings': {
            title: 'Configurações',
            description: 'Personalize sua experiência',
            icon: '⚙️',
            route: '#settings'
        }
    };

    // ============================================
    // COMPONENT LOADER (Simplificado para módulos)
    // ============================================
    const AppLoader = {
        async loadTemplate(templateId) {
            const template = document.getElementById(templateId);
            if (!template) {
                console.error('Template não encontrado:', templateId);
                return null;
            }
            return template.content.cloneNode(true);
        },

        async render(containerId, templateId, data = {}) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('Container não encontrado:', containerId);
                return false;
            }

            const content = await this.loadTemplate(templateId);
            if (!content) return false;

            // Inject data if placeholders exist
            if (data) {
                const elements = content.querySelectorAll('[data-key]');
                elements.forEach(el => {
                    const key = el.dataset.key;
                    if (data[key]) {
                        if (el.tagName === 'IMG' || el.tagName === 'SVG') {
                            // For SVG, inject content
                            if (el.tagName === 'SVG') {
                                el.innerHTML = data[key];
                            }
                        } else {
                            el.textContent = data[key];
                        }
                    }
                });
            }

            // Clear container
            container.innerHTML = '';

            // Add new content
            container.appendChild(content);

            // Dispatch event
            window.dispatchEvent(new CustomEvent('app:rendered', {
                detail: { containerId, templateId, data }
            }));

            return true;
        },

        async renderHTML(containerId, html) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('Container não encontrado:', containerId);
                return false;
            }

            container.innerHTML = html;
            return true;
        }
    };

    // ============================================
    // APP STATE
    // ============================================
    const AppState = {
        currentPage: null,
        isStarted: false,
        user: null
    };

    // ============================================
    // PAGE RENDERERS
    // ============================================
    const PageRenderer = {
        async renderStartScreen() {
            console.log('Renderizando tela inicial...');
            await AppLoader.render('main-content', 'start-screen-template');
            
            // Setup start button
            const startBtn = document.getElementById('btn-start-app');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    AppNavigator.startApp();
                });
            }
        },

        async renderDashboard() {
            console.log('Renderizando dashboard...');
            
            // Get modules data
            const modules = Object.entries(APP_MODULES).map(([key, data]) => ({
                id: key,
                ...data
            }));

            // Render dashboard
            await AppLoader.render('main-content', 'dashboard-template', {
                modules: JSON.stringify(modules)
            });

            // Setup card clicks
            const cards = document.querySelectorAll('.dashboard-card');
            cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const moduleId = card.dataset.module;
                    AppNavigator.navigateTo(moduleId);
                });
            });
        },

        async renderPage(pageId) {
            const module = APP_MODULES[pageId];
            if (!module) {
                console.error('Módulo não encontrado:', pageId);
                return false;
            }

            await AppLoader.render('main-content', 'page-template', {
                pageTitle: module.title,
                pageDescription: module.description,
                pageIcon: module.icon
            });

            return true;
        }
    };

    // ============================================
    // NAVIGATOR
    // ============================================
    const AppNavigator = {
        async startApp() {
            console.log('Iniciando aplicação...');
            AppState.isStarted = true;

            // Emit event
            if (window.EventBus) {
                window.EventBus.emit('app:started', {
                    timestamp: Date.now(),
                    user: AppState.user
                });
            }

            // Show main app
            const mainApp = document.getElementById('main-app');
            if (mainApp) {
                mainApp.classList.remove('hidden');
            }

            // Hide login screen
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) {
                loginScreen.classList.add('hidden');
            }

            // Render dashboard
            await PageRenderer.renderDashboard();

            // Dispatch event
            window.dispatchEvent(new CustomEvent('app:started'));
        },

        async navigateTo(pageId) {
            console.log('Navegando para:', pageId);

            if (!AppState.isStarted && pageId !== 'iniciar') {
                await this.startApp();
                return;
            }

            AppState.currentPage = pageId;

            // Emit navigation event
            if (window.EventBus) {
                window.EventBus.emit('navigate', {
                    page: pageId,
                    module: APP_MODULES[pageId],
                    timestamp: Date.now()
                });
            }

            // Render page
            await PageRenderer.renderPage(pageId);

            // Update active nav
            this.updateActiveNav(pageId);

            // Dispatch event
            window.dispatchEvent(new CustomEvent('app:navigate', {
                detail: { pageId }
            }));
        },

        updateActiveNav(pageId) {
            // Update nav links in header
            const navLinks = document.querySelectorAll('.nav-link[data-page]');
            navLinks.forEach(link => {
                const page = link.dataset.page;
                if (page === pageId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        },

        async handleRoute() {
            const hash = window.location.hash.slice(1) || 'iniciar';
            await this.navigateTo(hash);
        }
    };

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Hash change for SPA routing
        window.addEventListener('hashchange', () => {
            AppNavigator.handleRoute();
        });

        // Navigation links in header
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                AppNavigator.navigateTo(page);
            }
        });

        // Logo click - go to dashboard
        document.addEventListener('click', (e) => {
            const logo = e.target.closest('.site-logo');
            if (logo) {
                e.preventDefault();
                AppNavigator.navigateTo('dashboard');
            }
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    async function init() {
        console.log('Inicializando App Orchestrator...');

        // Setup event listeners
        setupEventListeners();

        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onDOMReady);
        } else {
            onDOMReady();
        }
    }

    function onDOMReady() {
        // Wait for modules to load
        setTimeout(async () => {
            try {
                // Check if we have hash or default to start screen
                const hash = window.location.hash.slice(1);
                
                if (hash && hash !== 'iniciar') {
                    AppState.isStarted = true;
                    await PageRenderer.renderDashboard();
                    await AppNavigator.handleRoute();
                } else {
                    // Show main app container but render start screen
                    const mainApp = document.getElementById('main-app');
                    if (mainApp) {
                        mainApp.classList.remove('hidden');
                    }
                    await PageRenderer.renderStartScreen();
                }

                // Emit ready event
                window.dispatchEvent(new CustomEvent('app:ready'));

                console.log('App Orchestrator inicializado com sucesso');
            } catch (error) {
                console.error('Erro ao inicializar app:', error);
            }
        }, 100);
    }

    // ============================================
    // EXPOSE GLOBAL API
    // ============================================
    window.AppNavigator = AppNavigator;
    window.AppLoader = AppLoader;
    window.APP_MODULES = APP_MODULES;
    window.AppState = AppState;

    // Start app
    init();
})();
