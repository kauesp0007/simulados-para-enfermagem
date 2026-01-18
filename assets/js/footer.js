/**
 * Footer JavaScript Module
 * Gerencia o rodapé, consentimento de cookies e funcionalidades
 * Integração com EventBus para comunicação entre módulos
 */
(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES E CONSTANTES
    // ============================================
    const CONFIG = {
        cookieName: 'ec_cookie_consent_v1',
        expirationDays: 365,
        selectors: {
            banner: 'cookie-banner',
            overlay: 'cookie-overlay',
            modal: 'cookie-modal',
            backToTop: 'backToTop',
            yearSpan: 'current-year',
            toast: 'toast-notification'
        }
    };

    // ============================================
    // ESTADO DO MÓDULO
    // ============================================
    const state = {
        modalStack: [],
        lastFocusedElement: null,
        isBannerVisible: false,
        initialized: false,
        eventBusReady: false,
        consent: {
            necessary: true,
            analytics: false,
            marketing: false
        }
    };

    // ============================================
    // EVENTBUS INTEGRATION
    // ============================================
    function setupFooterEventBusIntegration() {
        if (!window.EventBus) {
            window.addEventListener('eventbus:ready', function onEventBusReady() {
                window.removeEventListener('eventbus:ready', onEventBusReady);
                registerFooterEventBusListeners();
                state.eventBusReady = true;
                console.log('[Footer] EventBus integration activated');
            });
        } else {
            registerFooterEventBusListeners();
            state.eventBusReady = true;
        }
    }

    function registerFooterEventBusListeners() {
        if (!window.EventBus) return;

        // Escutar eventos de theme para sincronização
        window.EventBus.on('theme:changed', function(data) {
            console.log('[Footer] Tema alterado detectado via EventBus:', data.theme);
        }, { module: 'footer' });

        // Escutar eventos de accessibility
        window.EventBus.on('accessibility:settings:changed', function(data) {
            console.log('[Footer] Configurações de acessibilidade alteradas via EventBus');
        }, { module: 'footer' });
    }

    function emitFooterEvent(eventName, data) {
        const eventData = {
            ...data,
            source: 'footer',
            timestamp: Date.now()
        };

        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('footer:' + eventName, eventData);
        }

        window.dispatchEvent(new CustomEvent('footer:' + eventName, {
            detail: eventData
        }));
    }

    // ============================================
    // UTILITÁRIOS
    // ============================================
    function log(message, type = 'info') {
        console[`${type}`](`[Footer] ${message}`);
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

    function getCookie(name) {
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        } catch (e) {
            log('Cookie bloqueado', 'warn');
            return null;
        }
    }

    function setCookie(name, value, days) {
        try {
            const d = new Date();
            d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${d.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
        } catch (e) {
            log('Erro ao definir cookie', 'warn');
        }
    }

    function showToast(message) {
        const toast = getElement(CONFIG.selectors.toast);
        if (!toast) return;
        
        const toastMessage = toast.querySelector?.('.toast-message') || toast;
        if (toastMessage) toastMessage.textContent = message;
        
        toast.classList.add('visible');
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // ============================================
    // GERENCIAMENTO DE CONSENTIMENTO
    // ============================================
    const ConsentManager = {
        init() {
            this.applyStoredConsent();
            log('ConsentManager inicializado');
        },

        getConsent() {
            // Tentar cookie primeiro
            const cookieConsent = getCookie(CONFIG.cookieName);
            if (cookieConsent) {
                try {
                    return JSON.parse(cookieConsent);
                } catch (e) {
                    log('Erro ao parsear cookie', 'error');
                }
            }
            
            // Tentar localStorage
            try {
                const stored = localStorage.getItem(CONFIG.cookieName);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {
                log('Erro ao ler localStorage', 'error');
            }
            
            return null;
        },

        applyStoredConsent() {
            const saved = this.getConsent();
            if (saved) {
                state.consent = saved;
                this.updateUI();
                log('Consentimento aplicado:', saved);
            }
        },

        saveConsent(preferences) {
            state.consent = { ...state.consent, ...preferences };
            
            // Salvar em cookie
            setCookie(CONFIG.cookieName, JSON.stringify(state.consent), CONFIG.expirationDays);
            
            // Salvar em localStorage
            try {
                localStorage.setItem(CONFIG.cookieName, JSON.stringify(state.consent));
            } catch (e) {
                log('localStorage bloqueado', 'warn');
            }
            
            // Emitir evento
            emitFooterEvent('consent:updated', state.consent);
            
            window.dispatchEvent(new CustomEvent('CookieConsentUpdated', { detail: state.consent }));
            
            showToast('Preferências salvas com sucesso!');
        },

        acceptAll() {
            this.saveConsent({ necessary: true, analytics: true, marketing: true });
        },

        rejectAll() {
            this.saveConsent({ necessary: true, analytics: false, marketing: false });
        },

        updateUI() {
            const analyticsSwitch = getElement('cookie-analytics');
            const marketingSwitch = getElement('cookie-marketing');
            
            if (analyticsSwitch) {
                analyticsSwitch.checked = state.consent.analytics;
            }
            if (marketingSwitch) {
                marketingSwitch.checked = state.consent.marketing;
            }
        }
    };

    // ============================================
    // GERENCIAMENTO DE UI
    // ============================================
    const UIManager = {
        init() {
            this.setupBanner();
            this.setupModal();
            this.setupBackToTop();
            this.setupAccordion();
            log('UIManager inicializado');
        },

        setupBanner() {
            const banner = getElement(CONFIG.selectors.banner);
            if (!banner) return;
            
            // Verificar se já tem consentimento
            const hasConsent = ConsentManager.getConsent();
            
            if (!hasConsent) {
                setTimeout(() => {
                    banner.classList.add('visible');
                    banner.classList.remove('hidden');
                    state.isBannerVisible = true;
                }, 1000);
            }
        },

        showBanner() {
            const banner = getElement(CONFIG.selectors.banner);
            if (!banner) return;
            
            banner.classList.remove('hidden');
            banner.classList.add('visible');
            banner.setAttribute('aria-hidden', 'false');
            state.isBannerVisible = true;
        },

        hideBanner() {
            const banner = getElement(CONFIG.selectors.banner);
            if (!banner) return;
            
            banner.classList.remove('visible');
            banner.classList.add('hidden');
            banner.setAttribute('aria-hidden', 'true');
            state.isBannerVisible = false;
        },

        setupModal() {
            // Modal principal
            const openBtn = getElement('cookie-settings');
            const closeBtn = getElement('cookie-modal-close');
            
            if (openBtn) {
                openBtn.addEventListener('click', () => this.openMainModal());
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }
            
            // Overlay click para fechar
            const overlay = getElement(CONFIG.selectors.overlay);
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeModal();
                    }
                });
            }
            
            // Botões do banner
            const acceptAllBtn = getElement('cookie-accept-all');
            const rejectAllBtn = getElement('cookie-reject');
            
            if (acceptAllBtn) {
                acceptAllBtn.addEventListener('click', () => {
                    ConsentManager.acceptAll();
                    this.hideBanner();
                });
            }
            
            if (rejectAllBtn) {
                rejectAllBtn.addEventListener('click', () => {
                    ConsentManager.rejectAll();
                    this.hideBanner();
                });
            }
            
            // Botão de salvar preferências
            const savePrefsBtn = getElement('cookie-save-preferences');
            if (savePrefsBtn) {
                savePrefsBtn.addEventListener('click', () => {
                    const analytics = getElement('cookie-analytics')?.checked || false;
                    const marketing = getElement('cookie-marketing')?.checked || false;
                    ConsentManager.saveConsent({ analytics, marketing });
                    this.closeModal();
                });
            }
            
            // Switch listeners
            $$('.cookie-switch input[type="checkbox"]').forEach(chk => {
                chk.addEventListener('change', function() {
                    const slider = this.nextElementSibling;
                    if (slider) {
                        slider.style.backgroundColor = this.checked ? 'var(--color-primary)' : '#ccc';
                    }
                });
            });
        },

        openMainModal() {
            const modal = getElement(CONFIG.selectors.modal);
            const overlay = getElement(CONFIG.selectors.overlay);
            
            if (!modal || !overlay) {
                log('Modal não encontrado', 'warn');
                return;
            }
            
            state.lastFocusedElement = document.activeElement;
            state.modalStack.push(modal);
            
            overlay.classList.remove('hidden');
            overlay.classList.add('visible');
            modal.classList.remove('hidden');
            modal.classList.add('visible');
            modal.setAttribute('aria-hidden', 'false');
            
            document.body.style.overflow = 'hidden';
            
            // Esconder banner se visível
            if (state.isBannerVisible) {
                this.hideBanner();
            }
        },

        closeModal() {
            const overlay = getElement(CONFIG.selectors.overlay);
            
            const currentModal = state.modalStack.pop();
            if (currentModal) {
                currentModal.classList.remove('visible');
                currentModal.classList.add('hidden');
                currentModal.setAttribute('aria-hidden', 'true');
            }
            
            if (state.modalStack.length === 0) {
                if (overlay) {
                    overlay.classList.remove('visible');
                    overlay.classList.add('hidden');
                }
                document.body.style.overflow = '';
                
                // Mostrar banner se não tiver consentimento
                const hasConsent = ConsentManager.getConsent();
                if (!hasConsent && state.isBannerVisible) {
                    this.showBanner();
                }
                
                if (state.lastFocusedElement) {
                    state.lastFocusedElement.focus();
                }
            }
        },

        setupBackToTop() {
            const backToTop = getElement(CONFIG.selectors.backToTop);
            if (!backToTop) return;
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTop.classList.add('visible');
                    backToTop.classList.remove('hidden');
                } else {
                    backToTop.classList.remove('visible');
                    backToTop.classList.add('hidden');
                }
            });
            
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        },

        setupAccordion() {
            const headers = $$('.footer-category-header');
            
            headers.forEach(header => {
                header.addEventListener('click', function(e) {
                    if (e.target.closest('.footer-link') || e.target.closest('a')) return;
                    
                    const group = this.parentElement;
                    if (!group) return;
                    
                    const isExpanded = group.classList.contains('active');
                    
                    // Fechar outros
                    $$('.footer-category.active').forEach(g => {
                        if (g !== group) g.classList.remove('active');
                    });
                    
                    group.classList.toggle('active', !isExpanded);
                });
                
                // Accessibility
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        header.click();
                    }
                });
            });
        }
    };

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function init() {
        if (state.initialized) {
            log('Módulo já inicializado', 'warn');
            return;
        }
        
        log('Inicializando módulo do footer...');
        
        // Verificar se footer existe
        const footer = $('footer.main-footer') || $('#footer');
        if (!footer) {
            log('Footer não encontrado no DOM', 'warn');
            return;
        }
        
        // Iniciar módulos
        ConsentManager.init();
        UIManager.init();
        
        // EventBus
        setupFooterEventBusIntegration();
        
        // Atualizar ano
        const yearSpan = getElement(CONFIG.selectors.yearSpan);
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
        
        // Setup keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.modalStack.length > 0) {
                UIManager.closeModal();
            }
        });
        
        state.initialized = true;
        log('Módulo do footer inicializado com sucesso');
        
        // Expor funções globalmente
        window.showCookieBanner = () => UIManager.showBanner();
        window.hideCookieBanner = () => UIManager.hideBanner();
        window.openCookieSettings = () => UIManager.openMainModal();
        
        // Emitir evento de ready
        emitFooterEvent('ready', { initialized: true });
    }

    // ============================================
    // EXPOSIÇÃO DA API PÚBLICA
    // ============================================
    window.FooterInit = init;
    window.FooterAPI = {
        showBanner: () => UIManager.showBanner(),
        hideBanner: () => UIManager.hideBanner(),
        openSettings: () => UIManager.openMainModal(),
        acceptAll: () => ConsentManager.acceptAll(),
        rejectAll: () => ConsentManager.rejectAll(),
        getConsent: () => ({ ...state.consent }),
        scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    };

    // ============================================
    // EXECUTAR QUANDO PRONTO
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 50));
    } else {
        setTimeout(init, 50);
    }

    console.log('Footer module loaded');
})();
