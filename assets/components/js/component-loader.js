/**
 * Component Loader - Orquestrador central de componentes
 * Simulados de Enfermagem
 */

class ComponentLoader {
    constructor() {
        this.components = [
            {
                name: 'header',
                script: '../../assets/components/js/header-loader.js',
                css: '../../assets/components/css/header.css'
            },
            {
                name: 'footer',
                script: '../../assets/components/js/footer-loader.js',
                css: '../../assets/components/css/footer.css'
            },
            {
                name: 'accessibility',
                script: '../../assets/components/js/accessibility-loader.js',
                css: '../../assets/components/css/accessibility.css'
            }
        ];

        this.loadedComponents = new Set();
        this.init();
    }

    async init() {
        try {
            // Carregar CSS de todos os componentes
            await this.loadAllCSS();

            // Carregar scripts de todos os componentes em paralelo
            await this.loadAllScripts();

            console.log('✅ Todos os componentes carregados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar componentes:', error);
        }
    }

    async loadAllCSS() {
        const cssPromises = this.components.map(component => 
            this.loadCSS(component.css, component.name)
        );
        await Promise.all(cssPromises);
    }

    async loadCSS(cssPath, componentName) {
        return new Promise((resolve, reject) => {
            try {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssPath;
                link.onload = () => {
                    console.log(`✅ CSS carregado: ${componentName}`);
                    resolve();
                };
                link.onerror = () => {
                    console.warn(`⚠️ Erro ao carregar CSS: ${componentName}`);
                    resolve(); // Não rejeitar para permitir continuação
                };
                document.head.appendChild(link);
            } catch (error) {
                console.error(`Erro ao carregar CSS ${componentName}:`, error);
                resolve(); // Não rejeitar
            }
        });
    }

    async loadAllScripts() {
        const scriptPromises = this.components.map(component => 
            this.loadScript(component.script, component.name)
        );
        await Promise.all(scriptPromises);
    }

    async loadScript(scriptPath, componentName) {
        return new Promise((resolve, reject) => {
            try {
                const script = document.createElement('script');
                script.src = scriptPath;
                script.async = true;
                script.onload = () => {
                    console.log(`✅ Script carregado: ${componentName}`);
                    this.loadedComponents.add(componentName);
                    resolve();
                };
                script.onerror = () => {
                    console.warn(`⚠️ Erro ao carregar script: ${componentName}`);
                    resolve(); // Não rejeitar para permitir continuação
                };
                document.body.appendChild(script);
            } catch (error) {
                console.error(`Erro ao carregar script ${componentName}:`, error);
                resolve(); // Não rejeitar
            }
        });
    }

    isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    getLoadedComponents() {
        return Array.from(this.loadedComponents);
    }
}

// Inicializar quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.ComponentLoaderInitialized) {
            window.componentLoader = new ComponentLoader();
            window.ComponentLoaderInitialized = true;
        }
    });
} else {
    if (!window.ComponentLoaderInitialized) {
        window.componentLoader = new ComponentLoader();
        window.ComponentLoaderInitialized = true;
    }
}
