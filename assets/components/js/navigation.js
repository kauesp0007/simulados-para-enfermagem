/**
 * Navigation.js - Sistema de Navegação Centralizado
 */
const Navigation = {
    init() {
        console.log('Navigation initialized');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Navigation.init());
} else {
    Navigation.init();
}
