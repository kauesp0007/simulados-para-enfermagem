/**
 * Header Loader - Gerencia o carregamento e funcionalidades do header
 * Integra logo, menu de usuário, notificações e tema
 */

const HeaderLoader = {
    config: {
        headerUrl: 'assets/html/header.html',
        containerId: 'header-container'
    },

    /**
     * Inicializa o carregamento do header
     */
    init() {
        this.load();
    },

    /**
     * Carrega o header do arquivo HTML
     */
    load() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.warn('Container de header não encontrado');
            return;
        }

        fetch(this.config.headerUrl)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao carregar header');
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
                this.initialize();
            })
            .catch(error => {
                console.error('Erro ao carregar header:', error);
                this.loadFallback(container);
            });
    },

    /**
     * Inicializa funcionalidades do header
     */
    initialize() {
        this.setupThemeToggle();
        this.setupUserMenu();
        this.setupNotifications();
        this.loadUserInfo();
    },

    /**
     * Configura o toggle de tema
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        // Carregar tema salvo
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    },

    /**
     * Configura o menu do usuário
     */
    setupUserMenu() {
        const userMenuToggle = document.getElementById('user-menu-toggle');
        const userDropdown = document.getElementById('user-dropdown');

        if (!userMenuToggle || !userDropdown) return;

        // Toggle menu
        userMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });

        // Fechar ao clicar em um link
        const links = userDropdown.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                userDropdown.classList.remove('active');
            });
        });
    },

    /**
     * Configura notificações
     */
    setupNotifications() {
        const notificationsBtn = document.getElementById('notifications-btn');
        const notificationCount = document.getElementById('notification-count');

        if (!notificationsBtn) return;

        // Carregar contagem de notificações
        const count = this.getNotificationCount();
        if (notificationCount && count > 0) {
            notificationCount.textContent = count;
        }

        notificationsBtn.addEventListener('click', () => {
            this.showNotifications();
        });
    },

    /**
     * Carrega informações do usuário
     */
    loadUserInfo() {
        const userId = localStorage.getItem('user_id');
        const userName = localStorage.getItem('user_name');

        if (userId && userName) {
            // Usuário está logado
            this.updateUserDisplay(userName);
        } else {
            // Usuário anônimo
            this.updateUserDisplay('Visitante');
        }
    },

    /**
     * Atualiza a exibição do usuário
     */
    updateUserDisplay(name) {
        const userBtn = document.querySelector('.user-btn');
        if (userBtn) {
            userBtn.title = name;
            // Adicionar tooltip com nome do usuário
            const tooltip = document.createElement('div');
            tooltip.className = 'user-tooltip';
            tooltip.textContent = name;
            tooltip.style.cssText = `
                position: absolute;
                bottom: -30px;
                background: #1A3E74;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                display: none;
                z-index: 10001;
            `;
            userBtn.parentElement.appendChild(tooltip);

            userBtn.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
            });

            userBtn.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        }
    },

    /**
     * Obtém contagem de notificações
     */
    getNotificationCount() {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            return notifications.filter(n => !n.read).length;
        } catch {
            return 0;
        }
    },

    /**
     * Exibe notificações
     */
    showNotifications() {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            
            if (notifications.length === 0) {
                alert('Nenhuma notificação');
                return;
            }

            let message = 'Notificações:\n\n';
            notifications.slice(-5).forEach(n => {
                message += `• ${n.title}\n  ${n.message}\n\n`;
            });

            alert(message);

            // Marcar como lidas
            notifications.forEach(n => n.read = true);
            localStorage.setItem('notifications', JSON.stringify(notifications));
            this.updateNotificationCount();
        } catch (error) {
            console.error('Erro ao exibir notificações:', error);
        }
    },

    /**
     * Atualiza contagem de notificações
     */
    updateNotificationCount() {
        const count = this.getNotificationCount();
        const badge = document.getElementById('notification-count');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },

    /**
     * Adiciona uma notificação
     */
    addNotification(title, message) {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            notifications.push({
                id: Date.now(),
                title: title,
                message: message,
                read: false,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('notifications', JSON.stringify(notifications));
            this.updateNotificationCount();
        } catch (error) {
            console.error('Erro ao adicionar notificação:', error);
        }
    },

    /**
     * Fallback para header
     */
    loadFallback(container) {
        container.innerHTML = `
            <header class="main-header" style="background: linear-gradient(135deg, #1A3E74 0%, #152c4f 100%); box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); position: sticky; top: 0; z-index: 1000;">
                <div class="header-container" style="max-width: 1400px; margin: 0 auto; padding: 12px 20px; display: flex; align-items: center; gap: 20px;">
                    <div class="header-brand" style="flex-shrink: 0;">
                        <a href="index.html" style="display: flex; align-items: center; text-decoration: none;">
                            <img src="https://simulados-para-enfermagem.com.br/assets/images/logotipo-simulados-para-enfermagem.webp" alt="Simulados de Enfermagem" style="height: 50px; width: auto; object-fit: contain;">
                        </a>
                    </div>
                    <div style="flex-grow: 1;"></div>
                    <div style="color: white; font-weight: 600;">Simulados de Enfermagem</div>
                </div>
            </header>
        `;
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HeaderLoader.init());
} else {
    HeaderLoader.init();
}
