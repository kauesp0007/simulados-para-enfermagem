/**
 * Modal Component - Versão Simplificada e Funcional
 * Sistema modular de diálogos e modais
 */

window.Modal = (function() {
    'use strict';

    var activeModal = null;
    var closeCallback = null;

    // Ícones para diferentes tipos de modal
    var icons = {
        success: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #22c55e; margin-bottom: 1rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ef4444; margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #f59e0b; margin-bottom: 1rem;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #0891b2; margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function create(options) {
        var title = escapeHtml(options.title || '');
        var content = options.content || '';
        var showFooter = options.showFooter !== false;
        var footerContent = options.footerContent || '';
        var closeOnBackdrop = options.closeOnBackdrop !== false;
        var onClose = options.onClose || null;
        var size = options.size || '';

        closeCallback = onClose;

        var container = document.getElementById('modal-container');
        if (!container) {
            console.error('Modal: Container #modal-container não encontrado');
            return;
        }

        var sizeClass = size ? ' ' + size : '';

        container.innerHTML = 
            '<div class="modal" id="modal-overlay">' +
                '<div class="modal-backdrop" id="modal-backdrop"></div>' +
                '<div class="modal-content' + sizeClass + '" id="modal-content">' +
                    (title ? '<div class="modal-header"><h2>' + title + '</h2><button class="modal-close" id="modal-close">&times;</button></div>' : '') +
                    '<div class="modal-body" id="modal-body">' + content + '</div>' +
                    (showFooter ? '<div class="modal-footer" id="modal-footer">' + footerContent + '</div>' : '') +
                '</div>' +
            '</div>';

        // Mostrar modal com animação
        var overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('hidden');

        // Bind eventos
        bindEvents(closeOnBackdrop);

        activeModal = {
            element: overlay,
            body: document.getElementById('modal-body'),
            footer: document.getElementById('modal-footer')
        };

        return activeModal;
    }

    function bindEvents(closeOnBackdrop) {
        var overlay = document.getElementById('modal-overlay');
        var backdrop = document.getElementById('modal-backdrop');
        var closeBtn = document.getElementById('modal-close');

        // Fechar ao clicar no backdrop
        if (closeOnBackdrop && backdrop) {
            backdrop.addEventListener('click', close);
        }

        // Botão de fechar
        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }

        // ESC key
        var handleEsc = function(e) {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    function close() {
        var overlay = document.getElementById('modal-overlay');
        if (!overlay) return;

        overlay.classList.add('hidden');
        setTimeout(function() {
            overlay.remove();
            if (closeCallback) {
                closeCallback();
            }
            activeModal = null;
            closeCallback = null;
        }, 200);
    }

    // Métodos públicos
    return {
        open: create,
        close: close,
        
        alert: function(options) {
            var title = escapeHtml(options.title || 'Aviso');
            var message = escapeHtml(options.message || '');
            var buttonText = escapeHtml(options.buttonText || 'OK');
            var onClose = options.onClose || function() {};

            return create({
                title: title,
                content: '<div style="text-align: center;">' + icons.info + '<p style="font-size: 1rem; color: var(--text-primary);">' + message + '</p></div>',
                footerContent: '<button class="btn btn-primary" id="modal-btn-ok" style="width: 100%;">' + buttonText + '</button>',
                showFooter: true,
                closeOnBackdrop: false,
                onClose: onClose
            });
        },
        
        success: function(options) {
            var title = escapeHtml(options.title || 'Sucesso!');
            var message = escapeHtml(options.message || '');
            var buttonText = escapeHtml(options.buttonText || 'OK');
            var onClose = options.onClose || function() {};

            return create({
                title: title,
                content: '<div style="text-align: center;">' + icons.success + '<p style="font-size: 1rem; color: var(--text-primary);">' + message + '</p></div>',
                footerContent: '<button class="btn btn-success" id="modal-btn-ok" style="width: 100%;">' + buttonText + '</button>',
                showFooter: true,
                closeOnBackdrop: false,
                onClose: onClose
            });
        },
        
        error: function(options) {
            var title = escapeHtml(options.title || 'Erro');
            var message = escapeHtml(options.message || '');
            var buttonText = escapeHtml(options.buttonText || 'OK');
            var onClose = options.onClose || function() {};

            return create({
                title: title,
                content: '<div style="text-align: center;">' + icons.error + '<p style="font-size: 1rem; color: var(--text-primary);">' + message + '</p></div>',
                footerContent: '<button class="btn btn-danger" id="modal-btn-ok" style="width: 100%;">' + buttonText + '</button>',
                showFooter: true,
                closeOnBackdrop: false,
                onClose: onClose
            });
        },
        
        confirm: function(options) {
            var title = escapeHtml(options.title || 'Confirmar');
            var message = escapeHtml(options.message || 'Tem certeza?');
            var confirmText = escapeHtml(options.confirmText || 'Confirmar');
            var cancelText = escapeHtml(options.cancelText || 'Cancelar');
            var onConfirm = options.onConfirm || function() {};
            var onCancel = options.onCancel || function() {};
            var type = options.type || 'default';

            var confirmClass = type === 'danger' ? 'btn-danger' : 'btn-primary';

            return create({
                title: title,
                content: '<div style="text-align: center;">' + icons.warning + '<p style="font-size: 1rem; color: var(--text-primary);">' + message + '</p></div>',
                footerContent: '<button class="btn btn-secondary" id="modal-btn-cancel">' + cancelText + '</button><button class="btn ' + confirmClass + '" id="modal-btn-confirm">' + confirmText + '</button>',
                showFooter: true,
                onClose: onCancel
            });
        },
        
        prompt: function(options) {
            var title = escapeHtml(options.title || 'Entrada');
            var label = escapeHtml(options.label || '');
            var placeholder = escapeHtml(options.placeholder || '');
            var defaultValue = escapeHtml(options.defaultValue || '');
            var confirmText = escapeHtml(options.confirmText || 'Confirmar');
            var cancelText = escapeHtml(options.cancelText || 'Cancelar');
            var onConfirm = options.onConfirm || function() {};
            var onCancel = options.onCancel || function() {};

            var inputHtml = label ? '<label class="form-label">' + label + '</label>' : '';
            inputHtml += '<input type="text" class="form-input" id="modal-input" placeholder="' + placeholder + '" value="' + defaultValue + '">';

            return create({
                title: title,
                content: '<div class="form-group">' + inputHtml + '</div>',
                footerContent: '<button class="btn btn-secondary" id="modal-btn-cancel">' + cancelText + '</button><button class="btn btn-primary" id="modal-btn-confirm">' + confirmText + '</button>',
                showFooter: true,
                onClose: onCancel
            });
        },
        
        loading: function(options) {
            var title = escapeHtml(options.title || 'Carregando...');
            var message = escapeHtml(options.message || 'Por favor, aguarde');

            return create({
                title: title,
                content: '<div style="text-align: center; padding: 2rem 0;"><div class="loading-spinner" style="width: 48px; height: 48px; margin: 0 auto 1rem;"></div><p style="color: var(--text-secondary);">' + message + '</p></div>',
                showFooter: false,
                closeOnBackdrop: false
            });
        }
    };

})();

console.log('Modal.js carregado com sucesso');
