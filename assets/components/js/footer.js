/**
 * Footer Component JavaScript
 * Gerencia funcionalidades do rodapé
 */
(function() {
    'use strict';

    /**
     * Inicializa o rodapé quando o DOM estiver pronto
     */
    function initFooter() {
        setCurrentYear();
        initBackToTopButton();
    }

    /**
     * Define o ano atual no rodapé
     */
    function setCurrentYear() {
        var yearEl = document.getElementById('footer-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

    /**
     * Inicializa o botão de voltar ao topo
     */
    function initBackToTopButton() {
        var backToTopBtn = document.getElementById('back-to-top');
        
        if (!backToTopBtn) {
            return;
        }

        // Mostrar/esconder botão baseado no scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        // Evento de clique para retornar ao topo
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Inicialização quando o DOM estiver carregado
     */
    function onDOMReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    // Inicializar quando o DOM estiver pronto
    onDOMReady(function() {
        initFooter();
    });

})();
