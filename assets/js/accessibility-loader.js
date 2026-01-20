/**
 * Accessibility Loader - Gerencia o carregamento e funcionalidades de acessibilidade
 * Integra painel de acessibilidade com controles de fonte, contraste, tema escuro, etc
 */

const AccessibilityLoader = {
    config: {
        accessibilityUrl: 'assets/html/accessibility.html',
        containerId: 'accessibility-container'
    },

    /**
     * Inicializa o carregamento do painel de acessibilidade
     */
    init() {
        this.load();
    },

    /**
     * Carrega o painel de acessibilidade do arquivo HTML
     */
    load() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.warn('Container de acessibilidade não encontrado');
            return;
        }

        fetch(this.config.accessibilityUrl)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao carregar accessibility');
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
                // AccessibilityManager.init() é chamado automaticamente no script do HTML
            })
            .catch(error => {
                console.error('Erro ao carregar accessibility:', error);
                this.loadFallback(container);
            });
    },

    /**
     * Fallback para acessibilidade
     */
    loadFallback(container) {
        container.innerHTML = `
            <div class="accessibility-panel" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
                <button class="accessibility-toggle" style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #1A3E74 0%, #152c4f 100%); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(26, 62, 116, 0.3);" title="Acessibilidade">
                    <i class="fas fa-universal-access"></i>
                </button>
            </div>
        `;
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AccessibilityLoader.init());
} else {
    AccessibilityLoader.init();
}
