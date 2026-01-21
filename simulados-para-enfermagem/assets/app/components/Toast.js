/**
 * Toast Component
 * Sistema de notificações toast (snackbars)
 */

const Toast = {
    toasts: [],
    maxVisible: 3,
    duration: 5000,

    /**
     * Mostra um toast
     */
    show(options) {
        const {
            title = '',
            message = '',
            type = 'info', // info, success, warning, error
            duration = this.duration,
            closable = true
        } = options;

        const container = document.getElementById('toast-container');
        const id = 'toast-' + Date.now();

        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            ${closable ? `
                <button class="toast-close" data-toast-close="${id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            ` : ''}
        `;

        container.appendChild(toast);

        // Animar entrada
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Bind evento de fechar
        if (closable) {
            toast.querySelector('[data-toast-close]').addEventListener('click', () => {
                this.hide(id);
            });
        }

        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        this.toasts.push({ id, type });
        this.limitVisible();

        return id;
    },

    /**
     * Esconde um toast específico
     */
    hide(id) {
        const toast = document.getElementById(id);
        if (!toast) return;

        toast.classList.add('hiding');

        setTimeout(() => {
            toast.remove();
            this.toasts = this.toasts.filter(t => t.id !== id);
        }, 300);
    },

    /**
     * Limita número de toasts visíveis
     */
    limitVisible() {
        const visible = this.toasts.filter(t => {
            const el = document.getElementById(t.id);
            return el && !el.classList.contains('hiding');
        });

        if (visible.length > this.maxVisible) {
            const toHide = visible.slice(0, visible.length - this.maxVisible);
            toHide.forEach(t => this.hide(t.id));
        }
    },

    /**
     * Toast de sucesso
     */
    success(message, title = 'Sucesso!') {
        return this.show({ message, title, type: 'success' });
    },

    /**
     * Toast de erro
     */
    error(message, title = 'Erro') {
        return this.show({ message, title, type: 'error' });
    },

    /**
     * Toast de aviso
     */
    warning(message, title = 'Aviso') {
        return this.show({ message, title, type: 'warning' });
    },

    /**
     * Toast de informação
     */
    info(message, title = 'Informação') {
        return this.show({ message, title, type: 'info' });
    },

    /**
     * Esconde todos os toasts
     */
    hideAll() {
        this.toasts.forEach(t => this.hide(t.id));
    }
};

// Exportar para uso global
window.Toast = Toast;
