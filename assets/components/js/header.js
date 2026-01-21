/**
 * =====================================================
 * CABEÇALHO MODULAR - Simulados para Enfermagem
 * Arquivo: header-v4-dashboard.js
 * Descrição: JavaScript completo para o cabeçalho com
 *            mega-menus e controles de acessibilidade
 * =====================================================
 */

(function() {
    'use strict';

    // Namespace para evitar conflitos
    var HeaderManager = window.HeaderManager || {};

    /**
     * Inicializa o módulo do cabeçalho
     */
    HeaderManager.init = function() {
        initDateDisplay();
        initFontSizeControls();
        initThemeToggle();
        initMegaMenus();
        initMobileMenu();
        initSearchBox();
        initSkipLinks();
        initResponsiveHandlers();
    };

    /**
     * Exibe a data atual na top bar
     */
    function initDateDisplay() {
        var dateEl = document.getElementById('current-date');
        if (dateEl) {
            var now = new Date();
            var options = { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            };
            var formattedDate = now.toLocaleDateString('pt-BR', options);
            // Capitaliza a primeira letra
            dateEl.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        }
    }

    /**
     * Controles de tamanho da fonte
     */
    function initFontSizeControls() {
        var fontSize = 100;
        var minFontSize = 70;
        var maxFontSize = 150;
        var fontStep = 10;
        
        var fontIncreaseBtn = document.getElementById('font-increase');
        var fontDecreaseBtn = document.getElementById('font-decrease');

        function updateFontSize() {
            document.documentElement.style.fontSize = fontSize + '%';
            localStorage.setItem('headerFontSize', fontSize);
            
            // Atualiza estado dos botões
            if (fontIncreaseBtn) {
                fontIncreaseBtn.disabled = fontSize >= maxFontSize;
                fontIncreaseBtn.style.opacity = fontSize >= maxFontSize ? '0.5' : '1';
            }
            if (fontDecreaseBtn) {
                fontDecreaseBtn.disabled = fontSize <= minFontSize;
                fontDecreaseBtn.style.opacity = fontSize <= minFontSize ? '0.5' : '1';
            }
        }

        function increaseFont() {
            if (fontSize < maxFontSize) {
                fontSize = Math.min(fontSize + fontStep, maxFontSize);
                updateFontSize();
                HeaderManager.utils.announceChange('Tamanho da fonte aumentado para ' + fontSize + '%');
            }
        }

        function decreaseFont() {
            if (fontSize > minFontSize) {
                fontSize = Math.max(fontSize - fontStep, minFontSize);
                updateFontSize();
                HeaderManager.utils.announceChange('Tamanho da fonte reduzido para ' + fontSize + '%');
            }
        }

        function resetFontSize() {
            fontSize = 100;
            updateFontSize();
        }

        // Event listeners
        if (fontIncreaseBtn) {
            fontIncreaseBtn.addEventListener('click', increaseFont);
            // Suporte a teclado para acessibilidade
            fontIncreaseBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    increaseFont();
                }
            });
        }

        if (fontDecreaseBtn) {
            fontDecreaseBtn.addEventListener('click', decreaseFont);
            // Suporte a teclado para acessibilidade
            fontDecreaseBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    decreaseFont();
                }
            });
        }

        // Carregar tamanho salvo do localStorage
        var savedFontSize = localStorage.getItem('headerFontSize');
        if (savedFontSize) {
            fontSize = parseInt(savedFontSize, 10);
            // Limita o valor salvo ao intervalo válido
            fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize));
            updateFontSize();
        } else {
            // Define o estado inicial dos botões
            updateFontSize();
        }

        // Expõe funções globalmente para uso externo
        HeaderManager.fontSize = {
            increase: increaseFont,
            decrease: decreaseFont,
            reset: resetFontSize,
            getCurrent: function() { return fontSize; }
        };
    }

    /**
     * Alternador de tema claro/escuro
     */
    function initThemeToggle() {
        var themeToggle = document.getElementById('theme-toggle');
        var isDarkMode = false;
        var body = document.body;

        function applyTheme() {
            if (isDarkMode) {
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
            }
            
            localStorage.setItem('headerDarkMode', isDarkMode);
            
            if (themeToggle) {
                themeToggle.classList.toggle('active', isDarkMode);
                themeToggle.setAttribute('aria-checked', isDarkMode);
            }
            
            // Anuncia mudança para leitores de tela
            var message = isDarkMode ? 'Tema escuro ativado' : 'Tema claro ativado';
            HeaderManager.utils.announceChange(message);
        }

        function toggleTheme() {
            isDarkMode = !isDarkMode;
            applyTheme();
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
            
            // Suporte a teclado para acessibilidade
            themeToggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTheme();
                }
            });
        }

        // Carregar tema salvo
        var savedTheme = localStorage.getItem('headerDarkMode');
        if (savedTheme === 'true') {
            isDarkMode = true;
            applyTheme();
        } else if (savedTheme === 'false') {
            isDarkMode = false;
            applyTheme();
        } else {
            // Verificar preferência do sistema
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                isDarkMode = true;
                applyTheme();
            }
        }

        // Escutar mudanças na preferência do sistema
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                // Só altera automaticamente se o usuário não tiver definido uma preferência
                if (localStorage.getItem('headerDarkMode') === null) {
                    isDarkMode = e.matches;
                    applyTheme();
                }
            });
        }

        // Expõe funções globalmente
        HeaderManager.theme = {
            toggle: toggleTheme,
            isDark: function() { return isDarkMode; },
            setDark: function() { isDarkMode = true; applyTheme(); },
            setLight: function() { isDarkMode = false; applyTheme(); }
        };
    }

    /**
     * Inicializa mega-menus com interações de hover e foco
     */
    function initMegaMenus() {
        var navItems = document.querySelectorAll('.nav-item');
        var navLinks = document.querySelectorAll('.nav-link[aria-haspopup="true"]');
        var isMobile = window.innerWidth <= 768;

        function openMegaMenu(navItem) {
            var megaMenu = navItem.querySelector('.mega-menu');
            var navLink = navItem.querySelector('.nav-link');
            
            if (megaMenu) {
                megaMenu.style.display = 'block';
            }
            if (navLink) {
                navLink.setAttribute('aria-expanded', 'true');
                navLink.classList.add('active');
            }
        }

        function closeMegaMenu(navItem) {
            var megaMenu = navItem.querySelector('.mega-menu');
            var navLink = navItem.querySelector('.nav-link');
            
            if (megaMenu) {
                megaMenu.style.display = '';
            }
            if (navLink) {
                navLink.setAttribute('aria-expanded', 'false');
                navLink.classList.remove('active');
            }
        }

        function closeAllMenus() {
            navItems.forEach(function(item) {
                closeMegaMenu(item);
            });
        }

        // Configura eventos para cada item de navegação
        navItems.forEach(function(navItem) {
            var megaMenu = navItem.querySelector('.mega-menu');
            
            if (!megaMenu) return;

            // Mouse enter - abre o menu
            navItem.addEventListener('mouseenter', function() {
                if (!isMobile) {
                    openMegaMenu(navItem);
                }
            });

            // Mouse leave - fecha o menu
            navItem.addEventListener('mouseleave', function() {
                if (!isMobile) {
                    closeMegaMenu(navItem);
                }
            });

            // Focus within - abre quando recebe foco
            navItem.addEventListener('focusin', function() {
                if (!isMobile) {
                    openMegaMenu(navItem);
                }
            });

            // Focus leave - fecha quando perde foco
            navItem.addEventListener('focusout', function(e) {
                if (!isMobile && !navItem.contains(e.relatedTarget)) {
                    closeMegaMenu(navItem);
                }
            });
        });

        // Configura eventos para links de navegação (click no mobile)
        navLinks.forEach(function(navLink) {
            navLink.addEventListener('click', function(e) {
                if (isMobile) {
                    e.preventDefault();
                    var navItem = this.parentElement;
                    var isExpanded = this.getAttribute('aria-expanded') === 'true';
                    
                    // Fecha todos os outros menus
                    navItems.forEach(function(item) {
                        if (item !== navItem) {
                            closeMegaMenu(item);
                        }
                    });
                    
                    // Alterna o menu atual
                    if (isExpanded) {
                        closeMegaMenu(navItem);
                    } else {
                        openMegaMenu(navItem);
                    }
                }
            });

            // Tecla Enter para acessibilidade
            navLink.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (isMobile) {
                        e.preventDefault();
                        this.click();
                    }
                }
            });
        });

        // Fecha menus ao pressionar Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllMenus();
                closeMobileMenu();
            }
        });

        // Fecha menus ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-item') && !e.target.closest('.mega-menu')) {
                closeAllMenus();
            }
        });

        // Expõe funções globalmente
        HeaderManager.megaMenus = {
            open: openMegaMenu,
            close: closeMegaMenu,
            closeAll: closeAllMenus,
            refreshMobileState: function() {
                isMobile = window.innerWidth <= 768;
            }
        };
    }

    /**
     * Menu mobile com drawer
     */
    function initMobileMenu() {
        var mobileBtn = document.getElementById('mobile-menu-btn');
        var drawer = document.getElementById('mobile-drawer');
        var overlay = document.getElementById('mobile-overlay');
        var closeBtn = document.getElementById('mobile-drawer-close');
        var body = document.body;
        var isOpen = false;

        function openMobileMenu() {
            if (!drawer || !overlay) return;
            
            isOpen = true;
            drawer.classList.add('open');
            overlay.classList.add('active');
            
            if (mobileBtn) {
                mobileBtn.setAttribute('aria-expanded', 'true');
                mobileBtn.setAttribute('aria-label', 'Fechar menu');
            }
            
            // Impede scroll do body
            body.style.overflow = 'hidden';
            
            // Foco no botão de fechar para acessibilidade
            setTimeout(function() {
                if (closeBtn) {
                    closeBtn.focus();
                }
            }, 100);
            
            HeaderManager.utils.announceChange('Menu mobile aberto');
        }

        function closeMobileMenu() {
            if (!drawer || !overlay) return;
            
            isOpen = false;
            drawer.classList.remove('open');
            overlay.classList.remove('active');
            
            if (mobileBtn) {
                mobileBtn.setAttribute('aria-expanded', 'false');
                mobileBtn.setAttribute('aria-label', 'Abrir menu mobile');
                mobileBtn.focus();
            }
            
            // Restaura scroll do body
            body.style.overflow = '';
            
            HeaderManager.utils.announceChange('Menu mobile fechado');
        }

        function toggleMobileMenu() {
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }

        // Event listeners para o botão do menu
        if (mobileBtn) {
            mobileBtn.addEventListener('click', toggleMobileMenu);
            
            // Suporte a teclado
            mobileBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMobileMenu();
                }
            });
        }

        // Botão de fechar
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMobileMenu);
            
            closeBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeMobileMenu();
                }
            });
        }

        // Overlay - fecha ao clicar
        if (overlay) {
            overlay.addEventListener('click', closeMobileMenu);
        }

        // Submenus do mobile
        var mobileLinks = document.querySelectorAll('.mobile-nav-link[data-submenu]');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                var submenuId = this.getAttribute('data-submenu');
                var submenu = document.getElementById(submenuId);
                
                if (!submenu) return;
                
                var isOpen = submenu.classList.contains('open');
                
                // Fecha todos os outros submenus
                document.querySelectorAll('.mobile-submenu').forEach(function(s) {
                    s.classList.remove('open');
                });
                document.querySelectorAll('.mobile-nav-link').forEach(function(l) {
                    l.classList.remove('active');
                });
                
                // Alterna o submenu atual
                if (!isOpen) {
                    submenu.classList.add('open');
                    this.classList.add('active');
                    HeaderManager.utils.announceChange('Submenu aberto');
                } else {
                    HeaderManager.utils.announceChange('Submenu fechado');
                }
            });
            
            // Suporte a teclado
            link.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Links que não são submenus - fecham o menu ao clicar
        var directLinks = document.querySelectorAll('.mobile-nav-link:not([data-submenu])');
        directLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Pequeno delay para permitir a navegação
                setTimeout(closeMobileMenu, 100);
            });
        });

        // Expõe funções globalmente
        HeaderManager.mobileMenu = {
            open: openMobileMenu,
            close: closeMobileMenu,
            toggle: toggleMobileMenu,
            isOpen: function() { return isOpen; }
        };
    }

    /**
     * Funcionalidades da caixa de busca
     */
    function initSearchBox() {
        var searchBox = document.querySelector('.search-box');
        var searchInput = searchBox ? searchBox.querySelector('input') : null;
        var searchButton = searchBox ? searchBox.querySelector('button[type="submit"]') : null;

        function performSearch() {
            if (!searchInput) return;
            
            var query = searchInput.value.trim();
            
            if (query) {
                // Emitir evento de busca para que outras partes do aplicativo possam ouvir
                var event = new CustomEvent('headerSearch', {
                    detail: { query: query },
                    bubbles: true
                });
                document.dispatchEvent(event);
                
                // Aqui você pode adicionar lógica adicional de busca
                // Por exemplo: window.location.href = 'busca.html?q=' + encodeURIComponent(query);
                console.log('Busca realizada:', query);
            }
        }

        function handleKeydown(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        }

        if (searchInput) {
            searchInput.addEventListener('keydown', handleKeydown);
            
            // Foco no input quando Tab é pressionado
            searchBox.addEventListener('keydown', function(e) {
                if (e.key === 'Tab' && !e.shiftKey) {
                    // Permite tab normal
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', function(e) {
                e.preventDefault();
                performSearch();
            });
        }

        // Expõe funções globalmente
        HeaderManager.search = {
            perform: performSearch,
            getQuery: function() {
                return searchInput ? searchInput.value.trim() : '';
            },
            clear: function() {
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
            }
        };
    }

    /**
     * Funcionalidades de skip links
     */
    function initSkipLinks() {
        var skipLinks = document.querySelectorAll('.skip-link');
        
        skipLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                var targetId = this.getAttribute('href');
                
                if (targetId && targetId.startsWith('#')) {
                    var targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        e.preventDefault();
                        
                        // Foca no elemento alvo
                        targetElement.setAttribute('tabindex', '-1');
                        targetElement.focus();
                        
                        // Remove o tabindex após o uso
                        targetElement.addEventListener('blur', function() {
                            this.removeAttribute('tabindex');
                        }, { once: true });
                        
                        // Faz scroll até o elemento
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Anuncia para leitores de tela
                        var targetName = targetElement.id.replace(/-/g, ' ');
                        HeaderManager.utils.announceChange('Navegado para ' + targetName);
                    }
                }
            });
        });
    }

    /**
     * Handlers de redimensionamento da janela
     */
    function initResponsiveHandlers() {
        var mainNav = document.getElementById('main-nav');
        var mobileBtn = document.getElementById('mobile-menu-btn');
        var lastWidth = window.innerWidth;

        function checkScreenSize() {
            var currentWidth = window.innerWidth;
            var isMobile = currentWidth <= 768;
            var wasMobile = lastWidth <= 768;
            
            // Atualiza estado dos mega menus
            if (HeaderManager.megaMenus) {
                HeaderManager.megaMenus.refreshMobileState();
            }
            
            // Se mudou de mobile para desktop, fecha o menu mobile
            if (wasMobile && !isMobile && HeaderManager.mobileMenu) {
                HeaderManager.mobileMenu.close();
            }
            
            // Atualiza visibilidade da navegação
            if (mainNav) {
                mainNav.style.display = isMobile ? 'none' : 'flex';
            }
            
            if (mobileBtn) {
                mobileBtn.style.display = isMobile ? 'block' : 'none';
            }
            
            lastWidth = currentWidth;
        }

        // Executa na inicialização
        checkScreenSize();

        // Escuta redimensionamento com debounce
        var resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(checkScreenSize, 100);
        });
    }

    /**
     * Utilitários do cabeçalho
     */
    HeaderManager.utils = {
        /**
         * Anuncia mudanças para leitores de tela usando ARIA live region
         */
        announceChange: function(message) {
            var announcer = document.getElementById('header-announcer');
            
            if (!announcer) {
                announcer = document.createElement('div');
                announcer.id = 'header-announcer';
                announcer.setAttribute('role', 'status');
                announcer.setAttribute('aria-live', 'polite');
                announcer.setAttribute('aria-atomic', 'true');
                announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
                document.body.appendChild(announcer);
            }
            
            announcer.textContent = message;
            
            // Limpa após um momento
            setTimeout(function() {
                announcer.textContent = '';
            }, 1000);
        },

        /**
         * Salva configuração no localStorage
         */
        saveSetting: function(key, value) {
            try {
                localStorage.setItem('header_' + key, JSON.stringify(value));
            } catch (e) {
                console.warn('Não foi possível salvar configuração:', e);
            }
        },

        /**
         * Carrega configuração do localStorage
         */
        loadSetting: function(key, defaultValue) {
            try {
                var saved = localStorage.getItem('header_' + key);
                return saved !== null ? JSON.parse(saved) : defaultValue;
            } catch (e) {
                console.warn('Não foi possível carregar configuração:', e);
                return defaultValue;
            }
        },

        /**
         * Detecta se é dispositivo touch
         */
        isTouchDevice: function() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
    };

    // Atribui ao objeto global
    window.HeaderManager = HeaderManager;

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', HeaderManager.init);
    } else {
        // DOM já carregado
        HeaderManager.init();
    }

    // Expor funções de acesso rápido globalmente (para compatibilidade)
    window.headerFontIncrease = HeaderManager.fontSize ? HeaderManager.fontSize.increase : null;
    window.headerFontDecrease = HeaderManager.fontSize ? HeaderManager.fontSize.decrease : null;
    window.headerThemeToggle = HeaderManager.theme ? HeaderManager.theme.toggle : null;
    window.headerMobileMenuToggle = HeaderManager.mobileMenu ? HeaderManager.mobileMenu.toggle : null;

})();
