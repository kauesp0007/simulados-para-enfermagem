/**
 * ContestDialog Component
 * Modal para criar e editar concursos
 */

const ContestDialog = {
    isOpen: false,

    /**
     * Abre o modal de concurso
     */
    async open(contest = null) {
        this.isOpen = true;
        const isEditing = !!contest;

        const phases = contest?.phases || [];
        const materials = contest?.materials_to_bring || [];

        const content = `
            <form id="contest-form" class="contest-form">
                <div class="tabs">
                    <button type="button" class="tab active" data-tab="basic">Básico</button>
                    <button type="button" class="tab" data-tab="phases">Fases (${phases.length})</button>
                    <button type="button" class="tab" data-tab="materials">Materiais</button>
                    <button type="button" class="tab" data-tab="additional">Adicional</button>
                </div>

                <!-- Tab: Básico -->
                <div class="tab-content active" id="tab-basic">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Nome do Concurso *</label>
                            <input type="text" class="form-input" id="contest-name"
                                   value="${contest?.name || ''}" required
                                   placeholder="Ex: Concurso Prefeitura SP">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Instituição *</label>
                            <input type="text" class="form-input" id="contest-institution"
                                   value="${contest?.institution || ''}" required
                                   placeholder="Ex: Prefeitura de São Paulo">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Banca Examinadora</label>
                            <input type="text" class="form-input" id="contest-exam_board"
                                   value="${contest?.exam_board || ''}"
                                   placeholder="Ex: CESPE, FCC, VUNESP">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Estado *</label>
                            <select class="form-select" id="contest-state" required>
                                <option value="">Selecione</option>
                                ${this.getBrazilianStates(contest?.state)}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Cidade</label>
                            <input type="text" class="form-input" id="contest-city"
                                   value="${contest?.city || ''}"
                                   placeholder="Ex: São Paulo">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Data da Prova *</label>
                            <input type="date" class="form-input" id="contest-exam_date"
                                   value="${contest?.exam_date ? contest.exam_date.split('T')[0] : ''}"
                                   required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Horário de Entrada</label>
                            <input type="time" class="form-input" id="contest-entry_time"
                                   value="${contest?.entry_time || ''}">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Local da Prova</label>
                            <input type="text" class="form-input" id="contest-location"
                                   value="${contest?.location || ''}"
                                   placeholder="Ex: Av. Paulista, 1000">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Número de Vagas</label>
                            <input type="number" class="form-input" id="contest-positions"
                                   value="${contest?.positions || ''}"
                                   placeholder="Ex: 10">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Salário</label>
                            <input type="text" class="form-input" id="contest-salary"
                                   value="${contest?.salary || ''}"
                                   placeholder="Ex: R$ 5.000,00">
                        </div>
                    </div>
                </div>

                <!-- Tab: Fases -->
                <div class="tab-content" id="tab-phases">
                    <div class="phases-manager">
                        <div class="phase-add-form">
                            <h4>Adicionar Nova Fase</h4>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Tipo de Fase</label>
                                    <select class="form-select" id="phase-type">
                                        ${this.getPhaseTypes()}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Nome Personalizado</label>
                                    <input type="text" class="form-input" id="phase-name"
                                           placeholder="Deixe em branco para usar o nome padrão">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Data</label>
                                    <input type="date" class="form-input" id="phase-date">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Local</label>
                                    <input type="text" class="form-input" id="phase-location"
                                           placeholder="Ex: Campus Central">
                                </div>
                            </div>
                            <button type="button" class="btn btn-primary" id="add-phase-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Adicionar Fase
                            </button>
                        </div>

                        <div class="phases-list" id="phases-list">
                            ${phases.map((phase, index) => this.renderPhaseItem(phase, index)).join('')}
                            ${phases.length === 0 ? '<p class="empty-text">Nenhuma fase adicionada ainda</p>' : ''}
                        </div>
                    </div>
                </div>

                <!-- Tab: Materiais -->
                <div class="tab-content" id="tab-materials">
                    <div class="materials-manager">
                        <div class="form-group">
                            <label class="form-label">Materiais Sugeridos</label>
                            <div class="materials-tags">
                                ${this.getCommonMaterials().map(material => `
                                    <span class="badge ${materials.includes(material) ? 'badge-primary' : 'badge-outline'} material-tag"
                                          data-material="${material}">${material}</span>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Adicionar Material Personalizado</label>
                            <div class="input-with-btn">
                                <input type="text" class="form-input" id="new-material"
                                       placeholder="Ex: Certificado de vacinação">
                                <button type="button" class="btn btn-secondary" id="add-material-btn">Adicionar</button>
                            </div>
                        </div>

                        <div class="materials-selected">
                            <label class="form-label">Materiais Selecionados (<span id="materials-count">${materials.length}</span>)</label>
                            <div class="selected-tags" id="selected-materials">
                                ${materials.map(material => `
                                    <span class="badge badge-secondary selected-tag" data-material="${material}">
                                        ${material}
                                        <button type="button" class="remove-tag" data-material="${material}">&times;</button>
                                    </span>
                                `).join('')}
                                ${materials.length === 0 ? '<p class="empty-text">Nenhum material selecionado</p>' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Adicional -->
                <div class="tab-content" id="tab-additional">
                    <div class="form-group">
                        <label class="form-label">Observações</label>
                        <textarea class="form-textarea" id="contest-notes" rows="5"
                                  placeholder="Anotações adicionais sobre o concurso...">${contest?.notes || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">URL do Site</label>
                        <input type="url" class="form-input" id="contest-website"
                               value="${contest?.website || ''}"
                               placeholder="https://...">
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" id="cancel-btn">Cancelar</button>
                    <button type="submit" class="btn btn-primary">
                        ${isEditing ? 'Atualizar' : 'Criar'} Concurso
                    </button>
                </div>
            </form>
        `;

        Modal.open({
            title: isEditing ? 'Editar Concurso' : 'Novo Concurso',
            content,
            size: 'large',
            showFooter: false
        });

        // Bind eventos
        this.bindEvents(contest);
    },

    /**
     * Bind eventos do formulário
     */
    bindEvents(contest) {
        const form = document.getElementById('contest-form');
        if (!form) return;

        // Tabs
        form.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                form.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                form.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
            });
        });

        // Materiais sugeridos
        form.querySelectorAll('.material-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('badge-primary');
                tag.classList.toggle('badge-outline');
                this.updateSelectedMaterials();
            });
        });

        // Adicionar material personalizado
        document.getElementById('add-material-btn').addEventListener('click', () => {
            const input = document.getElementById('new-material');
            const material = input.value.trim();
            if (material) {
                this.addCustomMaterial(material);
                input.value = '';
            }
        });

        // Remover material selecionado
        form.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeMaterial(btn.dataset.material);
            });
        });

        // Adicionar fase
        document.getElementById('add-phase-btn').addEventListener('click', () => {
            this.addPhase();
        });

        // Remover fase
        form.querySelectorAll('.remove-phase-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removePhase(btn.dataset.index);
            });
        });

        // Cancelar
        document.getElementById('cancel-btn').addEventListener('click', () => {
            Modal.close();
        });

        // Submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveContest(contest);
        });
    },

    /**
     * Adiciona material personalizado
     */
    addCustomMaterial(material) {
        const selectedDiv = document.getElementById('selected-materials');
        const emptyText = selectedDiv.querySelector('.empty-text');
        if (emptyText) emptyText.remove();

        // Verificar se já existe
        if (selectedDiv.querySelector(`[data-material="${material}"]`)) return;

        const tag = document.createElement('span');
        tag.className = 'badge badge-secondary selected-tag';
        tag.dataset.material = material;
        tag.innerHTML = `${material}<button type="button" class="remove-tag" data-material="${material}">&times;</button>`;
        selectedDiv.appendChild(tag);

        // Adicionar ao form
        const formData = this.getFormData();
        formData.materials.push(material);

        // Bind evento de remover
        tag.querySelector('.remove-tag').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeMaterial(material);
        });

        this.updateMaterialsCount();
    },

    /**
     * Remove material
     */
    removeMaterial(material) {
        // Remover da lista de selecionados
        const selectedDiv = document.getElementById('selected-materials');
        const tag = selectedDiv.querySelector(`[data-material="${material}"]`);
        if (tag) tag.remove();

        // Desmarcar na lista de sugeridos
        const suggestedTag = document.querySelector(`.material-tag[data-material="${material}"]`);
        if (suggestedTag) {
            suggestedTag.classList.add('badge-outline');
            suggestedTag.classList.remove('badge-primary');
        }

        // Verificar se está vazio
        if (selectedDiv.children.length === 0) {
            selectedDiv.innerHTML = '<p class="empty-text">Nenhum material selecionado</p>';
        }

        this.updateMaterialsCount();
    },

    /**
     * Atualiza materiais selecionados
     */
    updateSelectedMaterials() {
        const selected = [];
        document.querySelectorAll('.material-tag.badge-primary').forEach(tag => {
            selected.push(tag.dataset.material);
        });
        this.currentMaterials = selected;
        this.updateMaterialsCount();
    },

    /**
     * Atualiza contador de materiais
     */
    updateMaterialsCount() {
        const count = document.querySelectorAll('#selected-materials .selected-tag').length;
        document.getElementById('materials-count').textContent = count;
    },

    /**
     * Adiciona fase
     */
    addPhase() {
        const type = document.getElementById('phase-type').value;
        const name = document.getElementById('phase-name').value;
        const date = document.getElementById('phase-date').value;
        const location = document.getElementById('phase-location').value;

        if (!type || !date) {
            Toast.warning('Por favor, preencha o tipo e a data da fase');
            return;
        }

        const phasesList = document.getElementById('phases-list');
        const emptyText = phasesList.querySelector('.empty-text');
        if (emptyText) emptyText.remove();

        const phaseName = name || this.getPhaseTypeName(type);
        const index = phasesList.querySelectorAll('.phase-item').length;

        const phaseItem = document.createElement('div');
        phaseItem.className = 'phase-item';
        phaseItem.dataset.index = index;
        phaseItem.innerHTML = `
            <div class="phase-item-content">
                <div class="phase-info">
                    <span class="phase-name">${phaseName}</span>
                    <span class="phase-date">${Helpers.formatDate(date)}</span>
                    ${location ? `<span class="phase-location">${location}</span>` : ''}
                </div>
                <button type="button" class="btn btn-ghost btn-sm remove-phase-btn" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
            <input type="hidden" name="phase-type[]" value="${type}">
            <input type="hidden" name="phase-name[]" value="${phaseName}">
            <input type="hidden" name="phase-date[]" value="${date}">
            <input type="hidden" name="phase-location[]" value="${location}">
        `;

        phasesList.appendChild(phaseItem);

        // Limpar form
        document.getElementById('phase-name').value = '';
        document.getElementById('phase-date').value = '';
        document.getElementById('phase-location').value = '';

        // Bind evento de remover
        phaseItem.querySelector('.remove-phase-btn').addEventListener('click', () => {
            phaseItem.remove();
        });

        // Atualizar tabs
        this.updatePhasesCount();
    },

    /**
     * Remove fase
     */
    removePhase(index) {
        const phaseItem = document.querySelector(`.phase-item[data-index="${index}"]`);
        if (phaseItem) phaseItem.remove();

        const phasesList = document.getElementById('phases-list');
        if (phasesList.querySelectorAll('.phase-item').length === 0) {
            phasesList.innerHTML = '<p class="empty-text">Nenhuma fase adicionada ainda</p>';
        }

        this.updatePhasesCount();
    },

    /**
     * Atualiza contador de fases
     */
    updatePhasesCount() {
        const count = document.querySelectorAll('#phases-list .phase-item').length;
        document.querySelector('[data-tab="phases"]').textContent = `Fases (${count})`;
    },

    /**
     * Renderiza item de fase
     */
    renderPhaseItem(phase, index) {
        return `
            <div class="phase-item" data-index="${index}">
                <div class="phase-item-content">
                    <div class="phase-info">
                        <span class="phase-name">${phase.name || this.getPhaseTypeName(phase.type)}</span>
                        <span class="phase-date">${Helpers.formatDate(phase.date)}</span>
                        ${phase.location ? `<span class="phase-location">${phase.location}</span>` : ''}
                    </div>
                    <button type="button" class="btn btn-ghost btn-sm remove-phase-btn" data-index="${index}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Salva concurso
     */
    async saveContest(existingContest) {
        const form = document.getElementById('contest-form');

        // Coletar fases
        const phases = [];
        form.querySelectorAll('#phases-list .phase-item').forEach(item => {
            const typeInput = item.querySelector('[name^="phase-type"]');
            const nameInput = item.querySelector('[name^="phase-name"]');
            const dateInput = item.querySelector('[name^="phase-date"]');
            const locationInput = item.querySelector('[name^="phase-location"]');

            if (typeInput && dateInput) {
                phases.push({
                    type: typeInput.value,
                    name: nameInput?.value || this.getPhaseTypeName(typeInput.value),
                    date: dateInput.value,
                    location: locationInput?.value || '',
                    status: 'pendente'
                });
            }
        });

        // Coletar materiais
        const materials = [];
        form.querySelectorAll('#selected-materials .selected-tag').forEach(tag => {
            materials.push(tag.dataset.material);
        });

        const contestData = {
            name: form.querySelector('#contest-name').value,
            institution: form.querySelector('#contest-institution').value,
            exam_board: form.querySelector('#contest-exam_board').value,
            state: form.querySelector('#contest-state').value,
            city: form.querySelector('#contest-city').value,
            exam_date: form.querySelector('#contest-exam_date').value,
            entry_time: form.querySelector('#contest-entry_time').value,
            location: form.querySelector('#contest-location').value,
            positions: form.querySelector('#contest-positions').value ? parseInt(form.querySelector('#contest-positions').value) : null,
            salary: form.querySelector('#contest-salary').value,
            notes: form.querySelector('#contest-notes').value,
            website: form.querySelector('#contest-website').value,
            phases,
            materials_to_bring: materials
        };

        try {
            const user = AuthService.getCurrentUser();
            if (!user) throw new Error('Usuário não autenticado');

            contestData.user_email = user.email;
            contestData.status = 'ativo';
            contestData.study_progress = 0;
            contestData.current_phase = phases.length > 0 ? phases[0].type : '';

            if (existingContest) {
                await db.contests.update(existingContest.id, {
                    ...contestData,
                    updated_at: new Date().toISOString()
                });
                Toast.success('Concurso atualizado com sucesso!');
            } else {
                const id = await DatabaseService.saveContest(contestData);
                contestData.id = id;
                Toast.success('Concurso criado com sucesso!');
            }

            Modal.close();
            this.isOpen = false;

            // Recarregar página atual
            App.refreshCurrentPage();
        } catch (error) {
            console.error('Error saving contest:', error);
            Toast.error('Erro ao salvar concurso. Tente novamente.');
        }
    },

    /**
     * Retorna dados do formulário
     */
    getFormData() {
        return {
            materials: [],
            phases: []
        };
    },

    /**
     * Retorna estados brasileiros
     */
    getBrazilianStates(selected = null) {
        const states = [
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
            'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
            'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        ];

        return states.map(state =>
            `<option value="${state}" ${state === selected ? 'selected' : ''}>${state}</option>`
        ).join('');
    },

    /**
     * Retorna tipos de fase
     */
    getPhaseTypes() {
        const types = [
            { value: 'inscricao', label: 'Inscrição' },
            { value: 'prova_objetiva', label: 'Prova Objetiva' },
            { value: 'prova_discursiva', label: 'Prova Discursiva' },
            { value: 'avaliacao_titulos', label: 'Avaliação de Títulos' },
            { value: 'exame_fisico', label: 'Exame Físico (TAF)' },
            { value: 'avaliacao_psicologica', label: 'Avaliação Psicológica' },
            { value: 'prova_pratica', label: 'Prova Prática' },
            { value: 'investigacao_social', label: 'Investigação Social' },
            { value: 'curso_formacao', label: 'Curso de Formação' },
            { value: 'nomeacao', label: 'Nomeação' },
            { value: 'posse', label: 'Posse' }
        ];

        return types.map(t => `<option value="${t.value}">${t.label}</option>`).join('');
    },

    /**
     * Retorna nome do tipo de fase
     */
    getPhaseTypeName(type) {
        const types = {
            'inscricao': 'Inscrição',
            'prova_objetiva': 'Prova Objetiva',
            'prova_discursiva': 'Prova Discursiva',
            'avaliacao_titulos': 'Avaliação de Títulos',
            'exame_fisico': 'Exame Físico (TAF)',
            'avaliacao_psicologica': 'Avaliação Psicológica',
            'prova_pratica': 'Prova Prática',
            'investigacao_social': 'Investigação Social',
            'curso_formacao': 'Curso de Formação',
            'nomeacao': 'Nomeação',
            'posse': 'Posse'
        };
        return types[type] || type;
    },

    /**
     * Retorna materiais comuns
     */
    getCommonMaterials() {
        return [
            'RG', 'CPF', 'Cartão de Inscrição', 'Caneta Preta/Azul',
            'Lápis e Borracha', 'Calculadora', 'Comprovante de Residência',
            'Garrafa de Água', 'Lanche'
        ];
    }
};

// Exportar para uso global
window.ContestDialog = ContestDialog;
