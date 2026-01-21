/**
 * BasePage Class
 * Classe base para todas as páginas do aplicativo
 * Versão: Non-Module (Global Scope)
 */

window.BasePage = (function() {
    'use strict';

    function BasePage() {
        this.container = null;
        this.isLoading = false;
    }

    /**
     * Título da página
     */
    BasePage.prototype.getTitle = function() {
        return 'Página';
    };

    /**
     * Subtítulo da página
     */
    BasePage.prototype.getSubtitle = function() {
        return '';
    };

    /**
     * Renderiza o cabeçalho da página
     */
    BasePage.prototype.renderHeader = function() {
        var title = this.getTitle();
        var subtitle = this.getSubtitle();
        
        return '<div class="page-header">' +
            '<h1 class="page-title">' + escapeHtml(title) + '</h1>' +
            (subtitle ? '<p class="page-subtitle">' + escapeHtml(subtitle) + '</p>' : '') +
            '</div>';
    };

    /**
     * Renderiza o conteúdo da página (deve ser implementado pelas subclasses)
     */
    BasePage.prototype.mount = async function(params) {
        this.showLoading();
        try {
            await this.onMount();
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            console.error('Erro ao montar página:', error);
        }
    };

    /**
     * Chamado após a página ser renderizada (para bind de eventos)
     */
    BasePage.prototype.onMount = function() {
        // Override em subclasses
    };

    /**
     * Chamado quando a página é fechada
     */
    BasePage.prototype.unmount = function() {
        // Override em subclasses
    };

    /**
     * Shows loading indicator
     */
    BasePage.prototype.showLoading = function() {
        this.isLoading = true;
        var mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        var loading = document.createElement('div');
        loading.id = 'page-loading';
        loading.className = 'page-loading';
        loading.innerHTML = '<div class="loading-spinner"></div><p>Carregando...</p>';
        mainContent.appendChild(loading);
    };

    /**
     * Esconde loading
     */
    BasePage.prototype.hideLoading = function() {
        this.isLoading = false;
        var loading = document.getElementById('page-loading');
        if (loading) loading.remove();
    };

    /**
     * Renderiza estado de erro
     */
    BasePage.prototype.renderError = function(message) {
        return '<div class="error-state">' +
            '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-error-500); margin: 0 auto 1rem;">' +
            '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' +
            '</svg>' +
            '<h3>Erro ao carregar</h3>' +
            '<p>' + escapeHtml(message) + '</p>' +
            '<button class="btn btn-primary mt-4" onclick="window.location.reload()">Tentar novamente</button></div>';
    };

    /**
     * Renderiza estado vazio
     */
    BasePage.prototype.renderEmpty = function(title, description, actionLabel, onAction) {
        var html = '<div class="empty-state">' +
            '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-tertiary); margin: 0 auto 1rem;">' +
            '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' +
            '</svg>' +
            '<h4 class="empty-state-title">' + escapeHtml(title) + '</h4>' +
            '<p class="empty-state-description">' + escapeHtml(description) + '</p>';
        
        if (actionLabel) {
            html += '<button class="btn btn-primary mt-4" id="empty-action-btn">' + escapeHtml(actionLabel) + '</button>';
        }
        
        html += '</div>';
        return html;
    };

    /**
     * Navega para outra página
     */
    BasePage.prototype.navigate = function(pageId, params) {
        window.AppState.goTo(pageId, params);
    };

    /**
     * Mostra toast
     */
    BasePage.prototype.showToast = function(message, type) {
        if (window.toastInstance) {
            window.toastInstance.show(message, type || 'info');
        }
    };

    /**
     * Abre modal
     */
    BasePage.prototype.openModal = function(options) {
        if (window.modalInstance) {
            return window.modalInstance.open(options);
        }
    };

    /**
     * Abre diálogo de confirmação
     */
    BasePage.prototype.confirm = function(options) {
        if (window.modalInstance) {
            return window.modalInstance.confirm(options);
        }
    };

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return BasePage;
})();

console.log('BasePage.js carregado com sucesso');
