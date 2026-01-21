/**
 * Component Loader - Carrega componentes modulares
 */
if (typeof window.ComponentLoaderInitialized === 'undefined') {
    window.ComponentLoaderInitialized = true;
    
    const ComponentLoader = {
        loadAll() {
            this.loadHeader();
            this.loadFooter();
            this.loadAccessibility();
        },
        
        loadHeader() {
            fetch('../../assets/components/html/header.html')
                .then(r => r.text())
                .then(html => {
                    const container = document.getElementById('header-container');
                    if (container) container.innerHTML = html;
                });
        },
        
        loadFooter() {
            fetch('../../assets/components/html/footer.html')
                .then(r => r.text())
                .then(html => {
                    const container = document.getElementById('footer-container');
                    if (container) container.innerHTML = html;
                });
        },
        
        loadAccessibility() {
            fetch('../../assets/components/html/accessibility.html')
                .then(r => r.text())
                .then(html => {
                    const container = document.getElementById('accessibility-container');
                    if (container) container.innerHTML = html;
                });
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ComponentLoader.loadAll());
    } else {
        ComponentLoader.loadAll();
    }
}
