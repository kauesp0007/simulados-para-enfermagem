/**
 * Component Loader - Carrega todos os componentes modulares
 * Integra: Header, Footer, Accessibility
 * 
 * Uso: Adicione <script src="assets/js/component-loader.js"></script> antes de fechar </body>
 */

const ComponentLoader = {
    /**
     * Carrega todos os componentes
     */
    loadAll() {
        // Carregar componentes em paralelo
        this.loadHeaderComponent();
        this.loadFooterComponent();
        this.loadAccessibilityComponent();
    },

    /**
     * Carrega o header via header-loader.js
     */
    loadHeaderComponent() {
        const script = document.createElement('script');
        script.src = 'assets/js/header-loader.js';
        script.async = true;
        script.onerror = () => console.error('Erro ao carregar header-loader.js');
        document.body.appendChild(script);
    },

    /**
     * Carrega o footer via footer-loader.js
     */
    loadFooterComponent() {
        const script = document.createElement('script');
        script.src = 'assets/js/footer-loader.js';
        script.async = true;
        script.onerror = () => console.error('Erro ao carregar footer-loader.js');
        document.body.appendChild(script);
    },

    /**
     * Carrega acessibilidade via accessibility-loader.js
     */
    loadAccessibilityComponent() {
        const script = document.createElement('script');
        script.src = 'assets/js/accessibility-loader.js';
        script.async = true;
        script.onerror = () => console.error('Erro ao carregar accessibility-loader.js');
        document.body.appendChild(script);
    },

    /**
     * Verifica se todos os componentes foram carregados
     */
    checkAllLoaded() {
        return !!(
            window.HeaderLoader &&
            window.FooterLoader &&
            window.AccessibilityLoader
        );
    }
};

// Carregar componentes quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ComponentLoader.loadAll();
    });
} else {
    ComponentLoader.loadAll();
}
