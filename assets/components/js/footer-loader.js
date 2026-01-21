/**
 * Footer Loader - Gerencia carregamento e funcionalidades do footer
 * Simulados de Enfermagem
 */

class FooterLoader {
    constructor() {
        this.footerContainer = document.getElementById('footer-container');
        this.footerPath = '../../assets/components/html/footer.html';
        this.init();
    }

    async init() {
        try {
            await this.loadFooter();
            this.setupEventListeners();
            this.updateYear();
            this.setupSocialLinks();
            this.setupPoweredByAnimation();
        } catch (error) {
            console.error('Erro ao carregar footer:', error);
            this.showFallback();
        }
    }

    async loadFooter() {
        if (!this.footerContainer) {
            console.warn('Footer container não encontrado');
            return;
        }

        try {
            const response = await fetch(this.footerPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            this.footerContainer.innerHTML = html;
        } catch (error) {
            console.error('Erro ao buscar footer:', error);
            this.showFallback();
        }
    }

    setupEventListeners() {
        // Social links tracking
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Social link clicado:', link.getAttribute('aria-label'));
            });
        });

        // Powered by section hover effect
        const poweredBySection = document.querySelector('.footer-powered-section');
        if (poweredBySection) {
            poweredBySection.addEventListener('mouseenter', () => {
                this.addPulseEffect(poweredBySection);
            });
        }
    }

    updateYear() {
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    setupSocialLinks() {
        const socialLinks = {
            'Facebook': 'https://facebook.com',
            'Twitter': 'https://twitter.com',
            'Instagram': 'https://instagram.com',
            'LinkedIn': 'https://linkedin.com'
        };

        const links = document.querySelectorAll('.social-link');
        links.forEach(link => {
            const label = link.getAttribute('aria-label');
            if (socialLinks[label]) {
                link.href = socialLinks[label];
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        });
    }

    setupPoweredByAnimation() {
        const poweredByLogo = document.querySelector('.powered-by-logo');
        if (poweredByLogo) {
            // Lazy loading
            poweredByLogo.loading = 'lazy';

            // Fallback para imagem
            poweredByLogo.onerror = () => {
                console.warn('Erro ao carregar imagem powered by');
                poweredByLogo.style.display = 'none';
            };

            // Adicionar classe de animação quando carregada
            poweredByLogo.onload = () => {
                poweredByLogo.classList.add('loaded');
            };
        }
    }

    addPulseEffect(element) {
        element.style.animation = 'pulse 0.6s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    showFallback() {
        if (this.footerContainer) {
            this.footerContainer.innerHTML = `
                <footer class="main-footer" role="contentinfo">
                    <div class="footer-wrapper">
                        <div class="footer-copyright">
                            <p>&copy; ${new Date().getFullYear()} Simulados de Enfermagem. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </footer>
            `;
        }
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.footerLoader = new FooterLoader();
    });
} else {
    window.footerLoader = new FooterLoader();
}
