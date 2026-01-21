/**
 * ProvaGenerator.js - Gerador de HTMLs para Provas Dinâmicas
 * Cria arquivos HTML individuais para cada prova/concurso
 */

const ProvaGenerator = {
    /**
     * Gera HTML de uma prova individual
     * @param {Object} prova - Dados da prova
     * @returns {String} HTML gerado
     */
    gerarProvaHTML(prova) {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="theme-color" content="#1A3E74">
    <title>${prova.titulo} - Simulados de Enfermagem</title>

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

        .prova-container { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 2rem; }
        .prova-header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0; }
        .prova-title { font-size: 1.8rem; color: var(--color-primary); font-weight: 700; margin-bottom: 0.5rem; }
        .prova-info { display: flex; gap: 2rem; flex-wrap: wrap; margin-top: 1rem; }
        .info-item { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: #666; }
        .info-item i { color: var(--color-primary); }

        .questoes-container { margin-top: 2rem; }
        .questao-card { background: #f9fafb; border-left: 4px solid var(--color-primary); padding: 1.5rem; margin-bottom: 1.5rem; border-radius: 8px; }
        .questao-numero { font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem; }
        .questao-texto { font-size: 1.05rem; font-weight: 500; margin-bottom: 1rem; line-height: 1.6; }
        
        .opcoes { display: flex; flex-direction: column; gap: 0.8rem; }
        .opcao { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .opcao:hover { border-color: var(--color-accent); background: #f0f9ff; }
        .opcao input[type="radio"] { margin-top: 4px; cursor: pointer; }
        .opcao label { cursor: pointer; flex: 1; }

        .explicacao { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 1rem; margin-top: 1rem; border-radius: 4px; font-size: 0.95rem; color: #0c4a6e; }

        .botoes { display: flex; gap: 1rem; margin-top: 2rem; justify-content: space-between; }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .btn-primary { background: var(--color-primary); color: white; }
        .btn-primary:hover { background: #0d2a52; }
        .btn-secondary { background: #e2e8f0; color: var(--text-main); }
        .btn-secondary:hover { background: #cbd5e1; }

        @media (max-width: 768px) {
            .prova-container { padding: 1rem; }
            .prova-title { font-size: 1.3rem; }
            .prova-info { flex-direction: column; gap: 0.5rem; }
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
        <div class="prova-container">
            <div class="prova-header">
                <h1 class="prova-title">${prova.titulo}</h1>
                <div class="prova-info">
                    <div class="info-item">
                        <i class="fas fa-building"></i>
                        <span>${prova.instituicao || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>${prova.banca || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${prova.ano || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-list"></i>
                        <span>${prova.questoes?.length || 0} questões</span>
                    </div>
                </div>
            </div>

            <div class="questoes-container">
                ${(prova.questoes || []).map((q, index) => `
                    <div class="questao-card">
                        <div class="questao-numero">Questão ${index + 1}</div>
                        <div class="questao-texto">${q.pergunta}</div>
                        <div class="opcoes">
                            ${q.respostas.map((r, i) => `
                                <label class="opcao">
                                    <input type="radio" name="questao-${index}" value="${i}">
                                    <span>${String.fromCharCode(65 + i)}) ${r}</span>
                                </label>
                            `).join('')}
                        </div>
                        ${q.explicacao ? `<div class="explicacao"><strong>Explicação:</strong> ${q.explicacao}</div>` : ''}
                    </div>
                `).join('')}
            </div>

            <div class="botoes">
                <button class="btn btn-secondary" onclick="window.history.back()">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
                <button class="btn btn-primary" onclick="finalizarProva()">
                    <i class="fas fa-check"></i> Finalizar
                </button>
            </div>
        </div>
    </main>

    <!-- FOOTER MODULAR -->
    <footer id="footer-container"></footer>

    <!-- SCRIPTS -->
    <script src="../navigation.js"><\/script>
    <script src="../quiz-engine.js"><\/script>
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
         * Finaliza a prova
         */
        function finalizarProva() {
            alert('Prova finalizada! Resultado será exibido em breve.');
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
     * Salva uma prova como arquivo HTML
     * @param {Object} prova - Dados da prova
     * @param {String} nomeArquivo - Nome do arquivo
     */
    salvarProvaHTML(prova, nomeArquivo) {
        const html = this.gerarProvaHTML(prova);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo || `prova-${prova.id}.html`;
        link.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Gera lista de provas em JSON
     * @returns {Array} Array de provas com metadados
     */
    gerarListaProvas() {
        const provas = JSON.parse(localStorage.getItem('admin_provas') || '[]');
        return provas.map(p => ({
            id: p.id,
            titulo: p.titulo,
            instituicao: p.instituicao,
            banca: p.banca,
            ano: p.ano,
            questoes: p.questoes?.length || 0,
            arquivo: `provas/prova-${p.id}.html`,
            criada: new Date().toISOString()
        }));
    },

    /**
     * Seleciona uma prova aleatória
     * @returns {Object} Prova aleatória
     */
    selecionarProvaAleatoria() {
        const provas = JSON.parse(localStorage.getItem('admin_provas') || '[]');
        if (provas.length === 0) return null;
        return provas[Math.floor(Math.random() * provas.length)];
    },

    /**
     * Exporta todas as provas como JSON
     */
    exportarProvasJSON() {
        const provas = this.gerarListaProvas();
        const json = JSON.stringify(provas, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'provas.json';
        link.click();
        URL.revokeObjectURL(url);
    }
};

// Exportar para uso global
window.ProvaGenerator = ProvaGenerator;
