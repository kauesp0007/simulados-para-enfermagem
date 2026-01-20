/**
 * Footer Loader - Gerencia o carregamento e funcionalidades do footer
 * Integra links, redes sociais e powered by
 */

const FooterLoader = {
    config: {
        footerUrl: 'assets/html/footer.html',
        containerId: 'footer-container'
    },

    /**
     * Inicializa o carregamento do footer
     */
    init() {
        this.load();
    },

    /**
     * Carrega o footer do arquivo HTML
     */
    load() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.warn('Container de footer não encontrado');
            return;
        }

        fetch(this.config.footerUrl)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao carregar footer');
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
                this.initialize();
            })
            .catch(error => {
                console.error('Erro ao carregar footer:', error);
                this.loadFallback(container);
            });
    },

    /**
     * Inicializa funcionalidades do footer
     */
    initialize() {
        this.setupSocialLinks();
        this.setupFooterLinks();
        this.updateYear();
    },

    /**
     * Configura links de redes sociais
     */
    setupSocialLinks() {
        const socialLinks = document.querySelectorAll('.social-btn');
        
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const title = link.getAttribute('title');
                console.log(`Redirecionando para ${title}`);
                // Aqui você pode adicionar URLs reais das redes sociais
            });

            // Adicionar animação ao passar o mouse
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateY(-4px)';
            });

            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateY(0)';
            });
        });
    },

    /**
     * Configura links do footer
     */
    setupFooterLinks() {
        const footerLinks = document.querySelectorAll('.footer-section a');
        
        footerLinks.forEach(link => {
            // Adicionar classe ativa se for a página atual
            const href = link.getAttribute('href');
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            if (href === currentPage || (href === 'index.html' && currentPage === '')) {
                link.style.color = '#1A3E74';
                link.style.fontWeight = '600';
            }

            // Adicionar animação ao passar o mouse
            link.addEventListener('mouseenter', () => {
                link.style.color = '#1A3E74';
            });

            link.addEventListener('mouseleave', () => {
                if (link.getAttribute('href') !== window.location.pathname.split('/').pop()) {
                    link.style.color = '#64748b';
                }
            });
        });
    },

    /**
     * Atualiza o ano no copyright
     */
    updateYear() {
        const yearElements = document.querySelectorAll('.footer-info p');
        const currentYear = new Date().getFullYear();
        
        yearElements.forEach(el => {
            if (el.textContent.includes('©')) {
                el.textContent = el.textContent.replace(/\d{4}/, currentYear.toString());
            }
        });
    },

    /**
     * Adiciona link social
     */
    addSocialLink(platform, url) {
        const socialLinks = document.querySelector('.social-links');
        if (!socialLinks) return;

        const iconMap = {
            'facebook': 'fab fa-facebook-f',
            'twitter': 'fab fa-twitter',
            'instagram': 'fab fa-instagram',
            'linkedin': 'fab fa-linkedin-in',
            'youtube': 'fab fa-youtube',
            'github': 'fab fa-github'
        };

        const link = document.createElement('a');
        link.href = url;
        link.title = platform.charAt(0).toUpperCase() + platform.slice(1);
        link.className = 'social-btn';
        link.innerHTML = `<i class="${iconMap[platform] || 'fas fa-link'}"></i>`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        socialLinks.appendChild(link);
    },

    /**
     * Adiciona link no footer
     */
    addFooterLink(section, text, href) {
        const sections = document.querySelectorAll('.footer-section');
        let targetSection = null;

        sections.forEach(s => {
            if (s.querySelector('h3').textContent === section) {
                targetSection = s;
            }
        });

        if (!targetSection) return;

        const ul = targetSection.querySelector('ul');
        if (!ul) return;

        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        li.appendChild(link);
        ul.appendChild(li);
    },

    /**
     * Fallback para footer
     */
    loadFallback(container) {
        container.innerHTML = `
            <footer class="main-footer" style="background: linear-gradient(135deg, #f8fafb 0%, #f0f4f8 100%); border-top: 1px solid #e2e8f0; margin-top: 60px; padding: 40px 20px;">
                <div style="max-width: 1400px; margin: 0 auto;">
                    <div style="text-align: center; color: #64748b; font-size: 14px;">
                        <p>&copy; ${new Date().getFullYear()} Simulados de Enfermagem. Todos os direitos reservados.</p>
                        <p style="font-size: 12px; margin-top: 12px;">
                            <a href="#" style="color: #64748b; text-decoration: none; margin: 0 8px;">Política de Privacidade</a> •
                            <a href="#" style="color: #64748b; text-decoration: none; margin: 0 8px;">Termos de Uso</a> •
                            <a href="#" style="color: #64748b; text-decoration: none; margin: 0 8px;">Contato</a>
                        </p>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <img src="https://simulados-para-enfermagem.com.br/assets/images/poweredby-integration.webp" alt="Powered by Integration" style="height: 32px; width: auto; object-fit: contain;">
                    </div>
                </div>
            </footer>
        `;
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FooterLoader.init());
} else {
    FooterLoader.init();
}
