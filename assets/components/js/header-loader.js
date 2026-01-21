/**
 * Header Loader - Gerencia carregamento e funcionalidades do header
 * Simulados de Enfermagem
 */

class HeaderLoader {
    constructor() {
        this.headerContainer = document.getElementById('header-container');
        this.headerPath = '../../assets/components/html/header.html';
        this.init();
    }

    async init() {
        try {
            await this.loadHeader();
            this.setupEventListeners();
            this.setupMobileMenu();
            this.setupMegaMenu();
            this.setupThemeToggle();
            this.setupUserMenu();
            this.setupBreadcrumb();
        } catch (error) {
            console.error('Erro ao carregar header:', error);
            this.showFallback();
        }
    }

    async loadHeader() {
        if (!this.headerContainer) {
            console.warn('Header container não encontrado');
            return;
        }

        try {
            const response = await fetch(this.headerPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            this.headerContainer.innerHTML = html;
        } catch (error) {
            console.error('Erro ao buscar header:', error);
            this.showFallback();
        }
    }

    setupEventListeners() {
        // Logo link
        const logoLink = document.querySelector('.logo-link');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                console.log('Logo clicado - navegando para home');
            });
        }

        // Notificações
        const notificationsBtn = document.querySelector('.notifications-btn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const mainNav = document.getElementById('main-nav');

        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', () => {
                const isActive = mainNav.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', isActive);
            });

            // Fechar menu ao clicar em um link
            const navLinks = mainNav.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                });
            });

            // Fechar menu ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.header-container')) {
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    setupMegaMenu() {
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const parent = toggle.closest('.nav-item');
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

                // Fechar outros menus
                document.querySelectorAll('.dropdown-toggle').forEach(t => {
                    if (t !== toggle) {
                        t.setAttribute('aria-expanded', 'false');
                        t.closest('.nav-item').classList.remove('active');
                    }
                });

                // Toggle atual
                toggle.setAttribute('aria-expanded', !isExpanded);
                parent.classList.toggle('active');
            });
        });

        // Fechar mega-menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                document.querySelectorAll('.dropdown-toggle').forEach(t => {
                    t.setAttribute('aria-expanded', 'false');
                    t.closest('.nav-item').classList.remove('active');
                });
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // Carregar tema salvo
            const savedTheme = localStorage.getItem('theme') || 'light';
            this.applyTheme(savedTheme);

            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.applyTheme(newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }

    setupUserMenu() {
        const userMenuToggle = document.getElementById('user-menu-toggle');
        const userDropdown = document.getElementById('user-dropdown');

        if (userMenuToggle && userDropdown) {
            userMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = userMenuToggle.getAttribute('aria-expanded') === 'true';
                userMenuToggle.setAttribute('aria-expanded', !isExpanded);
                userDropdown.style.display = isExpanded ? 'none' : 'block';
            });

            // Fechar ao clicar fora
            document.addEventListener('click', () => {
                userMenuToggle.setAttribute('aria-expanded', 'false');
                userDropdown.style.display = 'none';
            });

            // Logout
            const logoutBtn = userDropdown.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    console.log('Logout clicado');
                    localStorage.clear();
                    window.location.href = '../../assets/app/html/index.html';
                });
            }
        }
    }

    setupBreadcrumb() {
        const breadcrumbContainer = document.getElementById('breadcrumb-container');
        if (breadcrumbContainer) {
            const breadcrumbs = this.generateBreadcrumbs();
            breadcrumbContainer.innerHTML = breadcrumbs;
        }
    }

    generateBreadcrumbs() {
        const path = window.location.pathname;
        const parts = path.split('/').filter(p => p && p.endsWith('.html'));

        if (parts.length === 0) return '';

        let html = '<nav aria-label="Breadcrumb"><ol>';
        html += '<li><a href="../../assets/app/html/index.html">Início</a></li>';

        parts.forEach((part, index) => {
            const name = part.replace('.html', '').replace(/-/g, ' ');
            const isLast = index === parts.length - 1;

            if (isLast) {
                html += `<li aria-current="page">${this.capitalize(name)}</li>`;
            } else {
                html += `<li><a href="#">${this.capitalize(name)}</a></li>`;
            }
        });

        html += '</ol></nav>';
        return html;
    }

    capitalize(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    showNotifications() {
        console.log('Notificações clicadas');
        // Implementar modal de notificações
    }

    showFallback() {
        if (this.headerContainer) {
            this.headerContainer.innerHTML = `
                <header class="main-header" role="banner">
                    <div class="header-container">
                        <a href="../../assets/app/html/index.html" class="logo-link">
                            <img src="https://simulados-para-enfermagem.com.br/assets/components/images/logotipo-simulados-para-enfermagem.webp" 
                                 alt="Logo" 
                                 class="logo-img"
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 60%22%3E%3Ctext x=%2210%22 y=%2240%22 font-size=%2224%22 fill=%22%231A3E74%22%3ESimulados%3C/text%3E%3C/svg%3E'">
                        </a>
                        <h1>Simulados de Enfermagem</h1>
                    </div>
                </header>
            `;
        }
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.headerLoader = new HeaderLoader();
    });
} else {
    window.headerLoader = new HeaderLoader();
}
