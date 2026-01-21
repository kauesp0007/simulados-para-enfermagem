/**
 * Accessibility Loader - Gerencia carregamento e funcionalidades de acessibilidade
 * Simulados de Enfermagem
 */

class AccessibilityLoader {
    constructor() {
        this.accessibilityContainer = document.getElementById('accessibility-container');
        this.accessibilityPath = '../../assets/components/html/accessibility.html';
        this.storageKey = 'accessibility-settings';
        this.init();
    }

    async init() {
        try {
            await this.loadAccessibility();
            this.loadSettings();
            this.setupEventListeners();
        } catch (error) {
            console.error('Erro ao carregar painel de acessibilidade:', error);
        }
    }

    async loadAccessibility() {
        if (!this.accessibilityContainer) {
            console.warn('Accessibility container não encontrado');
            return;
        }

        try {
            const response = await fetch(this.accessibilityPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            this.accessibilityContainer.innerHTML = html;
        } catch (error) {
            console.error('Erro ao buscar accessibility:', error);
        }
    }

    setupEventListeners() {
        // Toggle do painel
        const toggle = document.getElementById('accessibility-toggle');
        const controls = document.getElementById('accessibility-controls');
        const closeBtn = document.getElementById('accessibility-close');

        if (toggle && controls) {
            toggle.addEventListener('click', () => {
                const isHidden = controls.hasAttribute('hidden');
                if (isHidden) {
                    controls.removeAttribute('hidden');
                    toggle.setAttribute('aria-expanded', 'true');
                } else {
                    controls.setAttribute('hidden', '');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        if (closeBtn && controls) {
            closeBtn.addEventListener('click', () => {
                controls.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
            });
        }

        // Controle de fonte
        const fontDecrease = document.getElementById('font-decrease');
        const fontIncrease = document.getElementById('font-increase');
        const fontValue = document.getElementById('font-value');

        if (fontDecrease && fontIncrease) {
            fontDecrease.addEventListener('click', () => {
                this.adjustFontSize(-10);
            });

            fontIncrease.addEventListener('click', () => {
                this.adjustFontSize(10);
            });
        }

        // Toggle de contraste
        const contrastToggle = document.getElementById('contrast-toggle');
        if (contrastToggle) {
            contrastToggle.addEventListener('click', () => {
                this.toggleContrast(contrastToggle);
            });
        }

        // Toggle de modo escuro
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode(darkModeToggle);
            });
        }

        // Toggle de leitor de tela
        const screenReaderToggle = document.getElementById('screen-reader-toggle');
        if (screenReaderToggle) {
            screenReaderToggle.addEventListener('click', () => {
                this.toggleScreenReader(screenReaderToggle);
            });
        }

        // Toggle de redução de animações
        const reduceMotionToggle = document.getElementById('reduce-motion-toggle');
        if (reduceMotionToggle) {
            reduceMotionToggle.addEventListener('click', () => {
                this.toggleReduceMotion(reduceMotionToggle);
            });
        }

        // Botão de reset
        const resetBtn = document.getElementById('accessibility-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.accessibility-panel') && controls && !controls.hasAttribute('hidden')) {
                controls.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    adjustFontSize(delta) {
        let currentSize = parseInt(localStorage.getItem('font-size') || '100');
        let newSize = currentSize + delta;

        // Limitar entre 80% e 150%
        if (newSize < 80) newSize = 80;
        if (newSize > 150) newSize = 150;

        document.documentElement.style.fontSize = (newSize / 100) * 16 + 'px';
        localStorage.setItem('font-size', newSize);

        const fontValue = document.getElementById('font-value');
        if (fontValue) {
            fontValue.textContent = newSize + '%';
        }
    }

    toggleContrast(button) {
        const isActive = button.getAttribute('aria-pressed') === 'true';
        const newState = !isActive;

        button.setAttribute('aria-pressed', newState);
        document.documentElement.setAttribute('data-contrast', newState ? 'high' : 'normal');
        localStorage.setItem('contrast', newState ? 'high' : 'normal');
    }

    toggleDarkMode(button) {
        const isActive = button.getAttribute('aria-pressed') === 'true';
        const newState = !isActive;

        button.setAttribute('aria-pressed', newState);
        document.documentElement.setAttribute('data-theme', newState ? 'dark' : 'light');
        localStorage.setItem('theme', newState ? 'dark' : 'light');
    }

    toggleScreenReader(button) {
        const isActive = button.getAttribute('aria-pressed') === 'true';
        const newState = !isActive;

        button.setAttribute('aria-pressed', newState);
        document.documentElement.setAttribute('data-screen-reader', newState ? 'enabled' : 'disabled');
        localStorage.setItem('screen-reader', newState ? 'enabled' : 'disabled');

        if (newState) {
            this.announceMessage('Leitor de tela ativado');
        }
    }

    toggleReduceMotion(button) {
        const isActive = button.getAttribute('aria-pressed') === 'true';
        const newState = !isActive;

        button.setAttribute('aria-pressed', newState);
        document.documentElement.setAttribute('data-reduce-motion', newState ? 'reduce' : 'normal');
        localStorage.setItem('reduce-motion', newState ? 'reduce' : 'normal');
    }

    loadSettings() {
        // Carregar tamanho da fonte
        const fontSize = localStorage.getItem('font-size') || '100';
        document.documentElement.style.fontSize = (parseInt(fontSize) / 100) * 16 + 'px';
        const fontValue = document.getElementById('font-value');
        if (fontValue) {
            fontValue.textContent = fontSize + '%';
        }

        // Carregar contraste
        const contrast = localStorage.getItem('contrast') || 'normal';
        document.documentElement.setAttribute('data-contrast', contrast);
        const contrastToggle = document.getElementById('contrast-toggle');
        if (contrastToggle) {
            contrastToggle.setAttribute('aria-pressed', contrast === 'high');
        }

        // Carregar tema
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.setAttribute('aria-pressed', theme === 'dark');
        }

        // Carregar leitor de tela
        const screenReader = localStorage.getItem('screen-reader') || 'disabled';
        document.documentElement.setAttribute('data-screen-reader', screenReader);
        const screenReaderToggle = document.getElementById('screen-reader-toggle');
        if (screenReaderToggle) {
            screenReaderToggle.setAttribute('aria-pressed', screenReader === 'enabled');
        }

        // Carregar redução de animações
        const reduceMotion = localStorage.getItem('reduce-motion') || 'normal';
        document.documentElement.setAttribute('data-reduce-motion', reduceMotion);
        const reduceMotionToggle = document.getElementById('reduce-motion-toggle');
        if (reduceMotionToggle) {
            reduceMotionToggle.setAttribute('aria-pressed', reduceMotion === 'reduce');
        }
    }

    resetSettings() {
        // Limpar localStorage
        localStorage.removeItem('font-size');
        localStorage.removeItem('contrast');
        localStorage.removeItem('theme');
        localStorage.removeItem('screen-reader');
        localStorage.removeItem('reduce-motion');

        // Resetar DOM
        document.documentElement.style.fontSize = '16px';
        document.documentElement.removeAttribute('data-contrast');
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.removeAttribute('data-screen-reader');
        document.documentElement.removeAttribute('data-reduce-motion');

        // Resetar botões
        const buttons = document.querySelectorAll('[aria-pressed]');
        buttons.forEach(btn => {
            btn.setAttribute('aria-pressed', 'false');
        });

        const fontValue = document.getElementById('font-value');
        if (fontValue) {
            fontValue.textContent = '100%';
        }

        this.announceMessage('Configurações restauradas para o padrão');
    }

    announceMessage(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.textContent = message;
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.accessibilityLoader = new AccessibilityLoader();
    });
} else {
    window.accessibilityLoader = new AccessibilityLoader();
}
