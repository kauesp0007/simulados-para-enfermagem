/**
 * Navigation.js - Sistema de Navegação Centralizado
 * Desktop: Mega-menu horizontal | Mobile/Tablet: Menu hamburger lateral
 */

const Navigation = {
    // Mapa de páginas e suas informações
    pages: {
        'index.html': { title: 'Início', icon: 'fas fa-home', category: 'principal', breadcrumb: ['Início'] },
        'dashboard.html': { title: 'Dashboard', icon: 'fas fa-chart-line', category: 'principal', breadcrumb: ['Início', 'Dashboard'] },
        'concursospublicos.html': { title: 'Concursos Públicos', icon: 'fas fa-trophy', category: 'concursos', breadcrumb: ['Início', 'Concursos', 'Públicos'] },
        'meusconcursos.html': { title: 'Meus Concursos', icon: 'fas fa-bookmark', category: 'concursos', breadcrumb: ['Início', 'Concursos', 'Meus'] },
        'minhasquestoes.html': { title: 'Minhas Questões', icon: 'fas fa-question-circle', category: 'questoes', breadcrumb: ['Início', 'Questões', 'Minhas'] },
        'estudopersonalizado.html': { title: 'Estudo Personalizado', icon: 'fas fa-book', category: 'simulados', breadcrumb: ['Início', 'Simulados', 'Personalizado'] },
        'provascompletas.html': { title: 'Provas Completas', icon: 'fas fa-file-alt', category: 'simulados', breadcrumb: ['Início', 'Simulados', 'Provas'] },
        'simuladoreal.html': { title: 'Simulado Real', icon: 'fas fa-play-circle', category: 'simulados', breadcrumb: ['Início', 'Simulados', 'Real'] },
        'memoriarapida.html': { title: 'Memória Rápida', icon: 'fas fa-bolt', category: 'simulados', breadcrumb: ['Início', 'Simulados', 'Memória'] },
        'desafioinverso.html': { title: 'Desafio Inverso', icon: 'fas fa-exchange-alt', category: 'simulados', breadcrumb: ['Início', 'Simulados', 'Inverso'] },
        'quizcuriosidade.html': { title: 'Quiz Curiosidade', icon: 'fas fa-lightbulb', category: 'simulados', breadcrumb: ['Início', 'Simulados', 'Curiosidade'] },
        'modoantiestresse.html': { title: 'Modo Anti-Estresse', icon: 'fas fa-spa', category: 'ferramentas', breadcrumb: ['Início', 'Ferramentas', 'Anti-Estresse'] },
        'timerpomodoro.html': { title: 'Timer Pomodoro', icon: 'fas fa-clock', category: 'ferramentas', breadcrumb: ['Início', 'Ferramentas', 'Pomodoro'] },
        'estudooffline.html': { title: 'Estudo Offline', icon: 'fas fa-wifi', category: 'ferramentas', breadcrumb: ['Início', 'Ferramentas', 'Offline'] },
        'biblioteca.html': { title: 'Biblioteca', icon: 'fas fa-book-open', category: 'recursos', breadcrumb: ['Início', 'Recursos', 'Biblioteca'] },
        'settings.html': { title: 'Configurações', icon: 'fas fa-cog', category: 'configuracoes', breadcrumb: ['Início', 'Configurações'] },
        'admin-panel.html': { title: 'Painel Admin', icon: 'fas fa-lock', category: 'admin', breadcrumb: ['Início', 'Admin'] },
        'quiz.html': { title: 'Quiz', icon: 'fas fa-question', category: 'simulados', breadcrumb: ['Início', 'Quiz'] }
    },

    // Estrutura do menu
    menuStructure: {
        principal: [
            { page: 'index.html', title: 'Início', icon: 'fas fa-home', desc: 'Voltar à página inicial' },
            { page: 'dashboard.html', title: 'Dashboard', icon: 'fas fa-chart-line', desc: 'Seu progresso e atividades' }
        ],
        concursos: [
            { page: 'concursospublicos.html', title: 'Concursos Públicos', icon: 'fas fa-trophy', desc: 'Explore concursos disponíveis' },
            { page: 'meusconcursos.html', title: 'Meus Concursos', icon: 'fas fa-bookmark', desc: 'Gerencie seus concursos' }
        ],
        simulados: [
            { page: 'estudopersonalizado.html', title: 'Estudo Personalizado', icon: 'fas fa-book', desc: 'Crie seu próprio estudo' },
            { page: 'provascompletas.html', title: 'Provas Completas', icon: 'fas fa-file-alt', desc: 'Realize provas' },
            { page: 'simuladoreal.html', title: 'Simulado Real', icon: 'fas fa-play-circle', desc: 'Simule uma prova real' },
            { page: 'memoriarapida.html', title: 'Memória Rápida', icon: 'fas fa-bolt', desc: 'Quiz rápido' },
            { page: 'desafioinverso.html', title: 'Desafio Inverso', icon: 'fas fa-exchange-alt', desc: 'Modo inverso' },
            { page: 'quizcuriosidade.html', title: 'Quiz Curiosidade', icon: 'fas fa-lightbulb', desc: 'Curiosidades' }
        ],
        ferramentas: [
            { page: 'modoantiestresse.html', title: 'Modo Anti-Estresse', icon: 'fas fa-spa', desc: 'Respire e relaxe' },
            { page: 'timerpomodoro.html', title: 'Timer Pomodoro', icon: 'fas fa-clock', desc: 'Técnica Pomodoro' },
            { page: 'estudooffline.html', title: 'Estudo Offline', icon: 'fas fa-wifi', desc: 'Estude sem internet' }
        ],
        recursos: [
            { page: 'minhasquestoes.html', title: 'Minhas Questões', icon: 'fas fa-question-circle', desc: 'Suas questões personalizadas' },
            { page: 'biblioteca.html', title: 'Biblioteca', icon: 'fas fa-book-open', desc: 'Acervo de materiais' }
        ],
        configuracoes: [
            { page: 'settings.html', title: 'Configurações', icon: 'fas fa-cog', desc: 'Suas preferências' },
            { page: 'admin-panel.html', title: 'Painel Admin', icon: 'fas fa-lock', desc: 'Administração' }
        ]
    },

    /**
     * Inicializa o sistema de navegação
     */
    init() {
        this.injetarMenu();
        this.injetarBreadcrumb();
        this.ativarMenuAtivo();
        this.configurarMenuMobile();
        this.adicionarEstilos();
    },

    /**
     * Injeta o menu principal (mega-menu desktop + hamburger mobile)
     */
    injetarMenu() {
        const navContainer = document.getElementById('nav-container');
        if (!navContainer) return;

        let menuHTML = `
            <nav class="navbar">
                <div class="navbar-container">
                    <!-- Logo/Brand -->
                    <div class="navbar-brand">
                        <a href="index.html" class="brand-link">
                            <i class="fas fa-graduation-cap"></i>
                            <span class="brand-text">Simulados</span>
                        </a>
                    </div>

                    <!-- Mega Menu (Desktop) -->
                    <ul class="navbar-menu navbar-desktop" id="navbar-menu">
        `;

        // Adicionar itens do mega-menu
        for (const [category, items] of Object.entries(this.menuStructure)) {
            const categoryLabel = this.getCategoryLabel(category);
            menuHTML += `
                <li class="navbar-item">
                    <a href="#" class="navbar-link" data-category="${category}">
                        <span>${categoryLabel}</span>
                        <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="mega-submenu">
                        <div class="mega-submenu-content">
            `;
            
            items.forEach(item => {
                menuHTML += `
                    <a href="${item.page}" class="mega-submenu-item" data-page="${item.page}">
                        <i class="${item.icon}"></i>
                        <div class="submenu-text">
                            <span class="submenu-title">${item.title}</span>
                            <span class="submenu-desc">${item.desc}</span>
                        </div>
                    </a>
                `;
            });

            menuHTML += `
                        </div>
                    </div>
                </li>
            `;
        }

        menuHTML += `
                    </ul>

                    <!-- Hamburger Toggle (Mobile/Tablet) -->
                    <button class="navbar-toggle" id="navbar-toggle" aria-label="Menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                <!-- Mobile Menu Lateral -->
                <div class="navbar-mobile-overlay" id="navbar-mobile-overlay"></div>
                <div class="navbar-mobile" id="navbar-mobile">
                    <div class="mobile-menu-header">
                        <h2>Menu</h2>
                        <button class="mobile-menu-close" id="mobile-menu-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <ul class="mobile-menu-list">
        `;

        // Adicionar itens do menu mobile
        for (const [category, items] of Object.entries(this.menuStructure)) {
            const categoryLabel = this.getCategoryLabel(category);
            menuHTML += `
                <li class="mobile-menu-category">
                    <button class="mobile-category-toggle" data-category="${category}">
                        <span>${categoryLabel}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <ul class="mobile-submenu" id="mobile-submenu-${category}">
            `;
            
            items.forEach(item => {
                menuHTML += `
                    <li>
                        <a href="${item.page}" class="mobile-menu-link" data-page="${item.page}">
                            <i class="${item.icon}"></i>
                            <span>${item.title}</span>
                        </a>
                    </li>
                `;
            });

            menuHTML += `
                    </ul>
                </li>
            `;
        }

        menuHTML += `
                    </ul>
                </div>
            </nav>
        `;

        navContainer.innerHTML = menuHTML;
    },

    /**
     * Injeta breadcrumb na página
     */
    injetarBreadcrumb() {
        const breadcrumbContainer = document.getElementById('breadcrumb-container');
        if (!breadcrumbContainer) return;

        const paginaAtual = this.getPaginaAtual();
        const pageInfo = this.pages[paginaAtual];
        
        if (!pageInfo) return;

        let breadcrumbHTML = '<nav class="breadcrumb" aria-label="Breadcrumb"><ol>';
        
        pageInfo.breadcrumb.forEach((item, index) => {
            if (index === 0) {
                breadcrumbHTML += `<li><a href="index.html"><i class="fas fa-home"></i> ${item}</a></li>`;
            } else if (index === pageInfo.breadcrumb.length - 1) {
                breadcrumbHTML += `<li class="active"><span>${item}</span></li>`;
            } else {
                breadcrumbHTML += `<li><span>${item}</span></li>`;
            }
        });

        breadcrumbHTML += '</ol></nav>';
        breadcrumbContainer.innerHTML = breadcrumbHTML;
    },

    /**
     * Ativa o item do menu correspondente à página atual
     */
    ativarMenuAtivo() {
        const paginaAtual = this.getPaginaAtual();
        
        // Desktop
        document.querySelectorAll('.mega-submenu-item').forEach(link => {
            if (link.getAttribute('data-page') === paginaAtual) {
                link.classList.add('active');
            }
        });

        // Mobile
        document.querySelectorAll('.mobile-menu-link').forEach(link => {
            if (link.getAttribute('data-page') === paginaAtual) {
                link.classList.add('active');
            }
        });
    },

    /**
     * Configura menu mobile responsivo
     */
    configurarMenuMobile() {
        const toggle = document.getElementById('navbar-toggle');
        const mobile = document.getElementById('navbar-mobile');
        const overlay = document.getElementById('navbar-mobile-overlay');
        const closeBtn = document.getElementById('mobile-menu-close');
        
        if (!toggle || !mobile) return;

        // Abrir menu
        toggle.addEventListener('click', () => {
            mobile.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Fechar menu
        const fecharMenu = () => {
            mobile.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn?.addEventListener('click', fecharMenu);
        overlay?.addEventListener('click', fecharMenu);

        // Fechar ao clicar em um link
        document.querySelectorAll('.mobile-menu-link').forEach(link => {
            link.addEventListener('click', fecharMenu);
        });

        // Toggle de submenus mobile
        document.querySelectorAll('.mobile-category-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = btn.getAttribute('data-category');
                const submenu = document.getElementById(`mobile-submenu-${category}`);
                submenu?.classList.toggle('active');
                btn.classList.toggle('active');
            });
        });

        // Mega-menu desktop hover
        document.querySelectorAll('.navbar-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.querySelector('.mega-submenu')?.classList.add('active');
            });
            item.addEventListener('mouseleave', function() {
                this.querySelector('.mega-submenu')?.classList.remove('active');
            });
        });
    },

    /**
     * Obtém a página atual
     */
    getPaginaAtual() {
        return window.location.pathname.split('/').pop() || 'index.html';
    },

    /**
     * Obtém label da categoria
     */
    getCategoryLabel(category) {
        const labels = {
            principal: 'Principal',
            concursos: 'Concursos',
            simulados: 'Simulados',
            ferramentas: 'Ferramentas',
            recursos: 'Recursos',
            configuracoes: 'Configurações'
        };
        return labels[category] || category;
    },

    /**
     * Adiciona estilos CSS
     */
    adicionarEstilos() {
        if (document.getElementById('nav-styles')) return;

        const style = document.createElement('style');
        style.id = 'nav-styles';
        style.textContent = `
            /* ===== NAVBAR ===== */
            .navbar {
                background: linear-gradient(135deg, #1A3E74 0%, #0d2a52 100%);
                box-shadow: 0 2px 12px rgba(0,0,0,0.1);
                position: sticky;
                top: 0;
                z-index: 999;
            }
            .navbar-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 70px;
            }

            /* ===== BRAND ===== */
            .navbar-brand {
                display: flex;
                align-items: center;
            }
            .brand-link {
                color: white;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 700;
                font-size: 18px;
                transition: all 0.3s ease;
            }
            .brand-link:hover {
                color: #00bcd4;
            }
            .brand-link i {
                font-size: 24px;
            }

            /* ===== DESKTOP MEGA MENU ===== */
            .navbar-desktop {
                display: flex;
                list-style: none;
                margin: 0;
                padding: 0;
                gap: 0;
                align-items: center;
            }
            .navbar-item {
                position: relative;
                height: 100%;
                display: flex;
                align-items: center;
            }
            .navbar-link {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 0 20px;
                height: 100%;
                color: rgba(255,255,255,0.9);
                text-decoration: none;
                transition: all 0.3s ease;
                cursor: pointer;
                font-weight: 500;
            }
            .navbar-link:hover {
                color: #00bcd4;
                background: rgba(0,188,212,0.1);
            }
            .navbar-link i {
                font-size: 12px;
                transition: transform 0.3s ease;
            }

            /* ===== MEGA SUBMENU ===== */
            .mega-submenu {
                position: absolute;
                top: 100%;
                left: 0;
                background: white;
                min-width: 300px;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 1000;
                margin-top: 0;
            }
            .mega-submenu.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            .mega-submenu-content {
                padding: 12px 0;
                display: flex;
                flex-direction: column;
            }
            .mega-submenu-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 20px;
                color: #1f2937;
                text-decoration: none;
                transition: all 0.2s ease;
            }
            .mega-submenu-item:hover {
                background: #f4f6f9;
                color: #1A3E74;
                padding-left: 24px;
            }
            .mega-submenu-item.active {
                background: #e0e7ff;
                color: #1A3E74;
                font-weight: 600;
            }
            .mega-submenu-item i {
                font-size: 18px;
                color: #1A3E74;
                width: 20px;
                text-align: center;
            }
            .submenu-text {
                display: flex;
                flex-direction: column;
            }
            .submenu-title {
                font-weight: 600;
                font-size: 14px;
            }
            .submenu-desc {
                font-size: 12px;
                color: #999;
                margin-top: 2px;
            }

            /* ===== HAMBURGER TOGGLE ===== */
            .navbar-toggle {
                display: none;
                flex-direction: column;
                background: none;
                border: none;
                cursor: pointer;
                gap: 6px;
                padding: 8px;
            }
            .navbar-toggle span {
                width: 25px;
                height: 3px;
                background: white;
                border-radius: 2px;
                transition: all 0.3s ease;
            }
            .navbar-toggle.active span:nth-child(1) {
                transform: rotate(45deg) translate(10px, 10px);
            }
            .navbar-toggle.active span:nth-child(2) {
                opacity: 0;
            }
            .navbar-toggle.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -7px);
            }

            /* ===== MOBILE MENU ===== */
            .navbar-mobile-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 998;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .navbar-mobile-overlay.active {
                opacity: 1;
            }
            .navbar-mobile {
                display: none;
                position: fixed;
                top: 0;
                left: -100%;
                width: 80%;
                max-width: 320px;
                height: 100vh;
                background: white;
                z-index: 999;
                transition: left 0.3s ease;
                overflow-y: auto;
                box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            }
            .navbar-mobile.active {
                left: 0;
            }
            .mobile-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e2e8f0;
                background: linear-gradient(135deg, #1A3E74 0%, #0d2a52 100%);
                color: white;
            }
            .mobile-menu-header h2 {
                margin: 0;
                font-size: 18px;
            }
            .mobile-menu-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }
            .mobile-menu-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            .mobile-menu-category {
                border-bottom: 1px solid #e2e8f0;
            }
            .mobile-category-toggle {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                color: #1A3E74;
                transition: all 0.3s ease;
            }
            .mobile-category-toggle:hover {
                background: #f4f6f9;
            }
            .mobile-category-toggle.active i {
                transform: rotate(180deg);
            }
            .mobile-submenu {
                display: none;
                list-style: none;
                margin: 0;
                padding: 0;
                background: #f9fafb;
            }
            .mobile-submenu.active {
                display: block;
            }
            .mobile-menu-link {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 20px 12px 40px;
                color: #1f2937;
                text-decoration: none;
                transition: all 0.2s ease;
                font-size: 14px;
            }
            .mobile-menu-link:hover {
                background: #e0e7ff;
                color: #1A3E74;
            }
            .mobile-menu-link.active {
                background: #e0e7ff;
                color: #1A3E74;
                font-weight: 600;
            }
            .mobile-menu-link i {
                width: 18px;
                text-align: center;
            }

            /* ===== BREADCRUMB ===== */
            .breadcrumb {
                background: #f4f6f9;
                padding: 12px 20px;
                border-bottom: 1px solid #e2e8f0;
            }
            .breadcrumb ol {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                gap: 8px;
                max-width: 1400px;
                margin: 0 auto;
                flex-wrap: wrap;
            }
            .breadcrumb li {
                display: flex;
                align-items: center;
                font-size: 13px;
            }
            .breadcrumb li:not(:last-child)::after {
                content: '/';
                margin: 0 8px;
                color: #999;
            }
            .breadcrumb a {
                color: #1A3E74;
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .breadcrumb a:hover {
                text-decoration: underline;
            }
            .breadcrumb li.active {
                color: #666;
                font-weight: 600;
            }

            /* ===== RESPONSIVIDADE ===== */
            @media (max-width: 1024px) {
                .navbar-container {
                    height: 60px;
                }
                .navbar-desktop {
                    gap: 0;
                }
                .navbar-link {
                    padding: 0 16px;
                    font-size: 14px;
                }
            }

            @media (max-width: 768px) {
                .navbar-toggle {
                    display: flex;
                }
                .navbar-desktop {
                    display: none;
                }
                .navbar-mobile-overlay {
                    display: block;
                }
                .navbar-mobile {
                    display: block;
                }
                .brand-text {
                    display: none;
                }
                .navbar-container {
                    height: 60px;
                }
            }

            @media (max-width: 480px) {
                .navbar-mobile {
                    width: 100%;
                    max-width: none;
                }
                .breadcrumb ol {
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Inicializar navegação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Navigation.init());
} else {
    Navigation.init();
}
