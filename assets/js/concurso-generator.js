/**
 * ConcursoGenerator.js - Gerador de HTMLs para Concursos Dinâmicos
 * Cria arquivos HTML individuais para cada concurso
 */

const ConcursoGenerator = {
    /**
     * Gera HTML de um concurso individual
     * @param {Object} concurso - Dados do concurso
     * @returns {String} HTML gerado
     */
    gerarConcursoHTML(concurso) {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="theme-color" content="#1A3E74">
    <title>${concurso.nome} - Simulados de Enfermagem</title>

    <!-- Fontes Google -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Nunito+Sans:wght@600;700;800&display=swap" rel="stylesheet">
    
    <!-- Ícones FontAwesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

    <!-- CSS Externos do Projeto Original (Modulares) -->
    <link rel="stylesheet" href="https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/css/variables-v4.css">
    <link rel="stylesheet" href="https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/css/header-v4.css">
    <link rel="stylesheet" href="https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/css/accessibility-v4.css">
    <link rel="stylesheet" href="https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/css/footer-v4.css">

    <style>
        :root {
            --color-primary: #1A3E74;
            --color-accent: #00bcd4;
            --bg-main: #f4f6f9;
            --text-main: #1f2937;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: var(--bg-main); color: var(--text-main); }
        
        .skip-link { position: absolute; top: -40px; left: 0; background: var(--color-primary); color: white; padding: 8px; z-index: 100000; }
        .skip-link:focus { top: 0; }

        main { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }

        .concurso-container { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 2rem; }
        .concurso-header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0; }
        .concurso-title { font-size: 1.8rem; color: var(--color-primary); font-weight: 700; margin-bottom: 0.5rem; }
        
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
        .info-card { background: #f9fafb; padding: 1rem; border-radius: 8px; border-left: 4px solid var(--color-accent); }
        .info-label { font-size: 0.85rem; color: #999; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
        .info-value { font-size: 1.1rem; color: var(--text-main); font-weight: 600; }

        .fases-container { margin-top: 2rem; }
        .fases-title { font-size: 1.3rem; color: var(--color-primary); font-weight: 700; margin-bottom: 1rem; }
        .fase-card { background: #f9fafb; border-left: 4px solid var(--color-primary); padding: 1.5rem; margin-bottom: 1rem; border-radius: 8px; }
        .fase-nome { font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem; }
        .fase-info { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.95rem; }
        .fase-info-item { display: flex; align-items: center; gap: 6px; }

        .materiais-container { margin-top: 2rem; }
        .materiais-title { font-size: 1.3rem; color: var(--color-primary); font-weight: 700; margin-bottom: 1rem; }
        .materiais-list { display: flex; flex-wrap: wrap; gap: 0.8rem; }
        .material-tag { background: var(--color-primary); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; }

        .botoes { display: flex; gap: 1rem; margin-top: 2rem; justify-content: space-between; }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .btn-primary { background: var(--color-primary); color: white; }
        .btn-primary:hover { background: #0d2a52; }
        .btn-secondary { background: #e2e8f0; color: var(--text-main); }
        .btn-secondary:hover { background: #cbd5e1; }

        @media (max-width: 768px) {
            .concurso-container { padding: 1rem; }
            .concurso-title { font-size: 1.3rem; }
            .info-grid { grid-template-columns: 1fr; }
            .botoes { flex-direction: column; }
        }
    </style>
</head>
<body class="light-mode">

    <!-- SKIP LINK -->
    <a href="#main-content" class="skip-link">Pular para o conteúdo principal</a>

    <!-- CONTAINERS MODULARES -->
    <div id="nav-container"></div>
    <div id="breadcrumb-container"></div>
    <div id="accessibility-container"></div>
    <header id="header-container"></header>

    <!-- CONTEÚDO PRINCIPAL -->
    <main id="main-content">
        <div class="concurso-container">
            <div class="concurso-header">
                <h1 class="concurso-title">${concurso.nome}</h1>
            </div>

            <!-- Informações Gerais -->
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-label">Instituição</div>
                    <div class="info-value">${concurso.instituicao || 'N/A'}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Banca</div>
                    <div class="info-value">${concurso.banca || 'N/A'}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Estado</div>
                    <div class="info-value">${concurso.estado || 'N/A'}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Cidade</div>
                    <div class="info-value">${concurso.cidade || 'N/A'}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Vagas</div>
                    <div class="info-value">${concurso.vagas || 'N/A'}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Salário</div>
                    <div class="info-value">${concurso.salario || 'N/A'}</div>
                </div>
            </div>

            <!-- Fases -->
            ${concurso.fases && concurso.fases.length > 0 ? `
                <div class="fases-container">
                    <h2 class="fases-title">Fases do Concurso</h2>
                    ${concurso.fases.map((fase, index) => `
                        <div class="fase-card">
                            <div class="fase-nome">Fase ${index + 1}: ${fase.nome}</div>
                            <div class="fase-info">
                                <div class="fase-info-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>${fase.data || 'Data não informada'}</span>
                                </div>
                                <div class="fase-info-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${fase.local || 'Local não informado'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Materiais -->
            ${concurso.materiais && concurso.materiais.length > 0 ? `
                <div class="materiais-container">
                    <h2 class="materiais-title">Materiais Necessários</h2>
                    <div class="materiais-list">
                        ${concurso.materiais.map(material => `
                            <span class="material-tag">${material}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="botoes">
                <button class="btn btn-secondary" onclick="window.history.back()">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
                <button class="btn btn-primary" onclick="adicionarAosMeusConcursos()">
                    <i class="fas fa-bookmark"></i> Adicionar aos Meus Concursos
                </button>
            </div>
        </div>
    </main>

    <!-- FOOTER MODULAR -->
    <footer id="footer-container"></footer>

    <!-- SCRIPTS -->
    <script src="../navigation.js"><\/script>
    <script>
        /**
         * Carrega componentes modulares (Header, Footer, Accessibility)
         */
        async function carregarComponentes() {
            const BASE_URL = "https://auditeduca.github.io/Calculadoras-de-Enfermagem/";
            
            const componentes = [
                { id: 'accessibility-container', path: 'assets/components/accessibility-v4.html' },
                { id: 'header-container', path: 'assets/components/header-v4.html' },
                { id: 'footer-container', path: 'assets/components/footer-v4.html' }
            ];

            for (const comp of componentes) {
                try {
                    const url = BASE_URL + comp.path;
                    const response = await fetch(url + '?t=' + Date.now());
                    if (response.ok) {
                        const html = await response.text();
                        document.getElementById(comp.id).innerHTML = html;
                    }
                } catch (e) {
                    console.warn(\`Erro ao carregar \${comp.id}:\`, e.message);
                }
            }
        }

        /**
         * Adiciona concurso aos meus concursos
         */
        function adicionarAosMeusConcursos() {
            alert('Concurso adicionado aos seus concursos!');
        }

        // Inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', carregarComponentes);
        } else {
            carregarComponentes();
        }
    </script>
</body>
</html>`;
    },

    /**
     * Salva um concurso como arquivo HTML
     * @param {Object} concurso - Dados do concurso
     * @param {String} nomeArquivo - Nome do arquivo
     */
    salvarConcursoHTML(concurso, nomeArquivo) {
        const html = this.gerarConcursoHTML(concurso);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo || `concurso-${concurso.id}.html`;
        link.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Gera lista de concursos em JSON
     * @returns {Array} Array de concursos com metadados
     */
    gerarListaConcursos() {
        const concursos = JSON.parse(localStorage.getItem('admin_concursos') || '[]');
        return concursos.map(c => ({
            id: c.id,
            nome: c.nome,
            instituicao: c.instituicao,
            banca: c.banca,
            estado: c.estado,
            cidade: c.cidade,
            vagas: c.vagas,
            salario: c.salario,
            arquivo: `concursos/concurso-${c.id}.html`,
            criado: new Date().toISOString()
        }));
    },

    /**
     * Seleciona um concurso aleatório
     * @returns {Object} Concurso aleatório
     */
    selecionarConcursoAleatorio() {
        const concursos = JSON.parse(localStorage.getItem('admin_concursos') || '[]');
        if (concursos.length === 0) return null;
        return concursos[Math.floor(Math.random() * concursos.length)];
    },

    /**
     * Exporta todos os concursos como JSON
     */
    exportarConcursosJSON() {
        const concursos = this.gerarListaConcursos();
        const json = JSON.stringify(concursos, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'concursos.json';
        link.click();
        URL.revokeObjectURL(url);
    }
};

// Exportar para uso global
window.ConcursoGenerator = ConcursoGenerator;
