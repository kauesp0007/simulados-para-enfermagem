/* ============================================
   MODALS - FUNÇÕES MODULARES
   ============================================ */

/**
 * Abrir modal
 */
window.openModal = function(modalName) {
    const modal = document.getElementById(`modal-${modalName}`);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

/**
 * Fechar modal
 */
window.closeModal = function(modalName) {
    const modal = document.getElementById(`modal-${modalName}`);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
};

/**
 * Trocar aba do modal
 */
window.switchTab = function(modalName, tabName) {
    const modal = document.getElementById(`modal-${modalName}`);
    if (!modal) return;

    // Remover classe active de todas as abas
    modal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    modal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Adicionar classe active à aba clicada
    const activeBtn = modal.querySelector(`[onclick*="'${tabName}'"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const activeContent = modal.querySelector(`#${modalName}-${tabName}`);
    if (activeContent) activeContent.classList.add('active');
};

/**
 * Fechar modal ao clicar fora
 */
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        const overlay = event.target;
        const modalId = overlay.id;
        const modalName = modalId.replace('modal-', '');
        closeModal(modalName);
    }
});

/**
 * Fechar modal com ESC
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            const modalName = modal.id.replace('modal-', '');
            closeModal(modalName);
        });
    }
});

/* ============================================
   PROVA - FUNÇÕES
   ============================================ */

/**
 * Abrir modal de nova prova
 */
window.abrirNovaProva = function() {
    document.getElementById('modal-prova-title').textContent = 'Nova Prova';
    document.getElementById('form-prova').reset();
    openModal('prova');
};

/**
 * Abrir modal de editar prova
 */
window.abrirEditarProva = function(provaId) {
    document.getElementById('modal-prova-title').textContent = 'Editar Prova';
    // TODO: Carregar dados da prova
    openModal('prova');
};

/**
 * Salvar prova
 */
window.salvarProva = async function() {
    const form = document.getElementById('form-prova');

    if (!form.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    const formData = new FormData(form);
    const provaData = Object.fromEntries(formData);

    // Processar tags
    provaData.tags = provaData.tags.split(',').map(t => t.trim()).filter(t => t);
    provaData.palavrasChave = provaData.palavrasChave.split(',').map(t => t.trim()).filter(t => t);

    try {
        const response = await fetch('/api/provas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(provaData)
        });

        if (response.ok) {
            alert('Prova salva com sucesso!');
            closeModal('prova');
            if (window.carregarProvas) window.carregarProvas();
        } else {
            const error = await response.json();
            alert('Erro: ' + (error.message || 'Não foi possível salvar'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro: ' + error.message);
    }
};

/* ============================================
   CONCURSO - FUNÇÕES
   ============================================ */

/**
 * Armazenar fases e materiais em memória
 */
window.fasesCadastradas = [];
window.materiaisCadastrados = [];

/**
 * Abrir modal de novo concurso
 */
window.abrirNovoConcurso = function() {
    document.getElementById('modal-concurso-title').textContent = 'Novo Concurso';
    document.getElementById('form-concurso').reset();
    window.fasesCadastradas = [];
    window.materiaisCadastrados = [];
    renderizarFases();
    renderizarMateriais();
    openModal('concurso');
};

/**
 * Abrir modal de editar concurso
 */
window.abrirEditarConcurso = function(concursoId) {
    document.getElementById('modal-concurso-title').textContent = 'Editar Concurso';
    // TODO: Carregar dados do concurso
    openModal('concurso');
};

/**
 * Adicionar fase
 */
window.adicionarFase = function() {
    const tipo = document.getElementById('fase-tipo').value;
    const nome = document.getElementById('fase-nome').value;
    const data = document.getElementById('fase-data').value;
    const local = document.getElementById('fase-local').value;

    if (!tipo) {
        alert('Selecione um tipo de fase');
        return;
    }

    const fase = {
        id: 'fase-' + Date.now(),
        tipo: tipo,
        nome: nome || tipo,
        data: data,
        local: local
    };

    window.fasesCadastradas.push(fase);
    renderizarFases();

    document.getElementById('fase-tipo').value = 'inscricao';
    document.getElementById('fase-nome').value = '';
    document.getElementById('fase-data').value = '';
    document.getElementById('fase-local').value = '';
};

/**
 * Renderizar fases
 */
window.renderizarFases = function() {
    const lista = document.getElementById('lista-fases');
    const count = document.getElementById('count-fases');
    const badge = document.getElementById('badge-fases');

    if (!window.fasesCadastradas || window.fasesCadastradas.length === 0) {
        lista.innerHTML = '';
        count.textContent = '(0)';
        badge.textContent = '0';
        return;
    }

    lista.innerHTML = window.fasesCadastradas.map(fase => `
        <div class="item-badge">
            <span>${fase.nome}${fase.data ? ` - ${fase.data}` : ''}</span>
            <button type="button" onclick="removerFase('${fase.id}')">×</button>
        </div>
    `).join('');

    count.textContent = `(${window.fasesCadastradas.length})`;
    badge.textContent = window.fasesCadastradas.length;
};

/**
 * Remover fase
 */
window.removerFase = function(faseId) {
    window.fasesCadastradas = window.fasesCadastradas.filter(f => f.id !== faseId);
    renderizarFases();
};

/**
 * Adicionar material personalizado
 */
window.adicionarMaterial = function() {
    const input = document.getElementById('material-custom');
    const material = input.value.trim();

    if (!material) {
        alert('Digite um material');
        return;
    }

    window.materiaisCadastrados.push({
        id: 'material-' + Date.now(),
        nome: material
    });

    input.value = '';
    renderizarMateriais();
};

/**
 * Renderizar materiais
 */
window.renderizarMateriais = function() {
    const lista = document.getElementById('lista-materiais');
    const count = document.getElementById('count-materiais');
    const checked = Array.from(document.querySelectorAll('input[name="materiais"]:checked')).map(cb => cb.value);
    const total = checked.length + (window.materiaisCadastrados ? window.materiaisCadastrados.length : 0);

    let html = '';

    const labels = {
        'rg': 'RG',
        'cpf': 'CPF',
        'cartao': 'Cartão de Inscrição',
        'caneta': 'Caneta Preta/Azul',
        'lapis': 'Lápis e Borracha',
        'calculadora': 'Calculadora',
        'comprovante': 'Comprovante de Residência',
        'agua': 'Garrafa de Água',
        'lanche': 'Lanche'
    };

    checked.forEach(mat => {
        html += `<div class="item-badge"><span>${labels[mat]}</span></div>`;
    });

    if (window.materiaisCadastrados) {
        html += window.materiaisCadastrados.map(mat => `
            <div class="item-badge">
                <span>${mat.nome}</span>
                <button type="button" onclick="removerMaterial('${mat.id}')">×</button>
            </div>
        `).join('');
    }

    lista.innerHTML = html || '';
    count.textContent = `(${total})`;
};

/**
 * Remover material
 */
window.removerMaterial = function(materialId) {
    window.materiaisCadastrados = window.materiaisCadastrados.filter(m => m.id !== materialId);
    renderizarMateriais();
};

/**
 * Monitorar mudanças em checkboxes de materiais
 */
document.addEventListener('change', function(e) {
    if (e.target.name === 'materiais') {
        renderizarMateriais();
    }
});

/**
 * Salvar concurso
 */
window.salvarConcurso = async function() {
    const form = document.getElementById('form-concurso');

    if (!form.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    const formData = new FormData(form);
    const concursoData = Object.fromEntries(formData);

    // Processar tags
    concursoData.tags = concursoData.tags.split(',').map(t => t.trim()).filter(t => t);
    concursoData.palavrasChave = concursoData.palavrasChave.split(',').map(t => t.trim()).filter(t => t);
    concursoData.fases = window.fasesCadastradas || [];
    concursoData.materiais = window.materiaisCadastrados || [];

    try {
        const response = await fetch('/api/concursos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(concursoData)
        });

        if (response.ok) {
            alert('Concurso salvo com sucesso!');
            closeModal('concurso');
            if (window.carregarConcursos) window.carregarConcursos();
        } else {
            const error = await response.json();
            alert('Erro: ' + (error.message || 'Não foi possível salvar'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro: ' + error.message);
    }
};

/* ============================================
   CONTEÚDO - FUNÇÕES
   ============================================ */

/**
 * Armazenar recursos em memória
 */
window.recursosCadastrados = [];

/**
 * Atualizar campos dinâmicos baseado no tipo de conteúdo
 */
window.atualizarCamposDinamicos = function(modalName) {
    const tipo = document.getElementById(`${modalName}-tipo`).value;
    const container = document.getElementById(`${modalName}-campos-dinamicos`);

    if (!container) return;

    let html = '';

    switch(tipo) {
        case 'video':
            html = `
                <label for="${modalName}-url">URL do Vídeo</label>
                <input type="url" id="${modalName}-url" name="url" placeholder="https://youtube.com/watch?v=..." required>
                <small>Suporta YouTube, Vimeo, etc.</small>
            `;
            break;

        case 'audio':
            html = `
                <label for="${modalName}-url">URL do Áudio</label>
                <input type="url" id="${modalName}-url" name="url" placeholder="https://..." required>
                <small>Formatos: MP3, WAV, OGG</small>
            `;
            break;

        case 'imagem':
            html = `
                <label for="${modalName}-url">URL da Imagem</label>
                <input type="url" id="${modalName}-url" name="url" placeholder="https://..." required>
                <small>Formatos: JPG, PNG, WebP</small>
            `;
            break;

        case 'slide':
            html = `
                <label for="${modalName}-url">URL da Apresentação</label>
                <input type="url" id="${modalName}-url" name="url" placeholder="https://..." required>
                <small>Suporta Google Slides, Slideshare, etc.</small>
            `;
            break;

        case 'flashcard':
            html = `
                <label for="${modalName}-flashcards">Flashcards (JSON)</label>
                <textarea id="${modalName}-flashcards" name="flashcards" placeholder='[{"front": "Pergunta", "back": "Resposta"}]' rows="4" required></textarea>
                <small>Formato: Array de objetos com "front" e "back"</small>
            `;
            break;

        case 'guia':
        case 'artigo':
        default:
            html = `
                <label for="${modalName}-conteudo">Conteúdo</label>
                <textarea id="${modalName}-conteudo" name="conteudo" placeholder="Digite o conteúdo..." rows="6" required></textarea>
            `;
            break;

        case 'mapa':
            html = `
                <label for="${modalName}-url">URL do Mapa Mental</label>
                <input type="url" id="${modalName}-url" name="url" placeholder="https://..." required>
                <small>Suporta MindMeister, Coggle, etc.</small>
            `;
            break;
    }

    container.innerHTML = html;
};

/**
 * Abrir modal de novo conteúdo
 */
window.abrirNovoConteudo = function() {
    document.getElementById('modal-conteudo-title').textContent = 'Novo Conteúdo';
    document.getElementById('form-conteudo').reset();
    window.recursosCadastrados = [];
    renderizarRecursos();
    atualizarCamposDinamicos('conteudo');
    openModal('conteudo');
};

/**
 * Abrir modal de editar conteúdo
 */
window.abrirEditarConteudo = function(conteudoId) {
    document.getElementById('modal-conteudo-title').textContent = 'Editar Conteúdo';
    // TODO: Carregar dados do conteúdo
    openModal('conteudo');
};

/**
 * Abrir modal de adicionar recurso
 */
window.abrirModalRecurso = function() {
    document.getElementById('form-recurso').reset();
    openModal('recurso');
};

/**
 * Salvar recurso
 */
window.salvarRecurso = function() {
    const form = document.getElementById('form-recurso');

    if (!form.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    const recurso = {
        id: 'recurso-' + Date.now(),
        tipo: document.getElementById('recurso-tipo').value,
        titulo: document.getElementById('recurso-titulo').value,
        descricao: document.getElementById('recurso-descricao').value,
        url: document.getElementById('recurso-url').value,
        duracao: document.getElementById('recurso-duracao').value || null
    };

    window.recursosCadastrados.push(recurso);
    renderizarRecursos();
    closeModal('recurso');
};

/**
 * Renderizar recursos
 */
window.renderizarRecursos = function() {
    const lista = document.getElementById('lista-recursos');

    if (!window.recursosCadastrados || window.recursosCadastrados.length === 0) {
        lista.innerHTML = '';
        return;
    }

    lista.innerHTML = window.recursosCadastrados.map(recurso => `
        <div class="item-badge">
            <i class="fas fa-${getIconForType(recurso.tipo)}"></i>
            <span>${recurso.titulo}${recurso.duracao ? ` (${recurso.duracao}min)` : ''}</span>
            <button type="button" onclick="removerRecurso('${recurso.id}')">×</button>
        </div>
    `).join('');
};

/**
 * Remover recurso
 */
window.removerRecurso = function(recursoId) {
    window.recursosCadastrados = window.recursosCadastrados.filter(r => r.id !== recursoId);
    renderizarRecursos();
};

/**
 * Obter ícone baseado no tipo
 */
window.getIconForType = function(type) {
    const icons = {
        'video': 'video',
        'audio': 'music',
        'imagem': 'image',
        'slide': 'presentation',
        'flashcard': 'layer-group',
        'pdf': 'file-pdf',
        'documento': 'file-text',
        'link': 'link'
    };
    return icons[type] || 'file';
};

/**
 * Salvar conteúdo
 */
window.salvarConteudo = async function() {
    const form = document.getElementById('form-conteudo');

    if (!form.checkValidity()) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    const tipo = document.getElementById('conteudo-tipo').value;
    const formData = new FormData(form);
    const conteudoData = Object.fromEntries(formData);

    // Processar tags
    conteudoData.tags = conteudoData.tags.split(',').map(t => t.trim()).filter(t => t);
    conteudoData.palavrasChave = conteudoData.palavrasChave.split(',').map(t => t.trim()).filter(t => t);
    conteudoData.recursos = window.recursosCadastrados || [];

    // Processar campos específicos do tipo
    const urlField = document.getElementById('conteudo-url');
    const conteudoField = document.getElementById('conteudo-conteudo');
    const flashcardsField = document.getElementById('conteudo-flashcards');

    if (urlField) conteudoData.url = urlField.value;
    if (conteudoField) conteudoData.conteudo = conteudoField.value;
    if (flashcardsField) {
        try {
            conteudoData.flashcards = JSON.parse(flashcardsField.value);
        } catch (e) {
            alert('Erro ao parsear flashcards. Verifique o formato JSON');
            return;
        }
    }

    try {
        const response = await fetch('/api/conteudos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(conteudoData)
        });

        if (response.ok) {
            alert('Conteúdo salvo com sucesso!');
            closeModal('conteudo');
            if (window.carregarConteudos) window.carregarConteudos();
        } else {
            const error = await response.json();
            alert('Erro: ' + (error.message || 'Não foi possível salvar'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro: ' + error.message);
    }
};
