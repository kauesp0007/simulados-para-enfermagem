/**
 * ContestDetails Component
 * Visualização detalhada de um concurso com progresso e tópicos
 */

const ContestDetails = {
    contest: null,
    topics: [],
    onBack: null,

    /**
     * Renderiza detalhes do concurso
     */
    async render(contest, onBackCallback) {
        this.contest = contest;
        this.onBack = onBackCallback;

        // Buscar tópicos
        this.topics = await DatabaseService.getStudyTopics(contest.id);

        const container = document.getElementById('main-content');
        container.innerHTML = this.getHTML();

        this.bindEvents();
        this.animateEntrance();
    },

    /**
     * Retorna HTML dos detalhes
     */
    getHTML() {
        const contest = this.contest;
        const daysUntil = contest.exam_date ? Helpers.daysUntil(contest.exam_date) : null;
        const progress = contest.study_progress || 0;
        const studiedCount = this.topics.filter(t => t.studied).length;

        const totalPhases = contest.phases?.length || 0;
        const completedPhases = contest.phases?.filter(p => p.status === 'concluido').length || 0;

        return `
            <div class="contest-details page-content">
                <!-- Botão Voltar -->
                <button class="btn btn-secondary back-btn" id="back-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"/>
                        <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Voltar
                </button>

                <!-- Cards de Progresso -->
                <div class="stats-grid mb-6">
                    <div class="stat-card">
                        <div class="stat-card-icon cyan">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div class="stat-card-content">
                            <div class="stat-card-value">${progress}%</div>
                            <div class="stat-card-label">Progresso Geral</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-icon green">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                            </svg>
                        </div>
                        <div class="stat-card-content">
                            <div class="stat-card-value">${studiedCount}/${this.topics.length}</div>
                            <div class="stat-card-label">Tópicos Estudados</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-icon orange">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div class="stat-card-content">
                            <div class="stat-card-value">${daysUntil !== null ? daysUntil : '-'}</div>
                            <div class="stat-card-label">Dias até a Prova</div>
                        </div>
                    </div>
                </div>

                <!-- Timeline de Fases -->
                ${totalPhases > 0 ? `
                    <div class="card mb-6">
                        <div class="card-header">
                            <h3 class="card-title" style="display: flex; align-items: center; gap: 0.5rem;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                Fases do Concurso
                            </h3>
                            <span class="badge badge-primary">${completedPhases}/${totalPhases} concluídas</span>
                        </div>
                        <div class="card-body">
                            <div class="phases-timeline">
                                <div class="timeline-line"></div>
                                ${contest.phases.map((phase, index) => this.renderPhaseItem(phase, index, completedPhases, totalPhases)).join('')}
                            </div>
                            <button class="btn btn-outline mt-4" id="add-phase-btn" style="width: 100%;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Adicionar Fase
                            </button>
                        </div>
                    </div>
                ` : ''}

                <!-- Conteúdo Programático -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title">${contest.name}</h3>
                            <p class="card-subtitle">Conteúdo Programático</p>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-outline" id="import-topics-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                Importar do Edital
                            </button>
                            <button class="btn btn-primary" id="add-topic-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Adicionar Tópico
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        ${this.topics.length === 0 ? this.renderEmptyTopics() : this.renderTopics()}
                    </div>
                </div>
            </div>

            <!-- Modal de Adicionar Tópico -->
            <div class="modal" id="topic-modal">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Adicionar Novo Tópico</h3>
                        <button class="modal-close" id="close-topic-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="topic-form">
                            <div class="form-group">
                                <label class="form-label">Nome do Tópico *</label>
                                <input type="text" class="form-input" id="topic-name"
                                       placeholder="Ex: Anatomia do Sistema Cardiovascular" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Importância/Peso (1-5)</label>
                                <select class="form-select" id="topic-weight">
                                    <option value="1">1 - Baixa</option>
                                    <option value="2">2</option>
                                    <option value="3" selected>3 - Média</option>
                                    <option value="4">4</option>
                                    <option value="5">5 - Alta</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Anotações</label>
                                <textarea class="form-textarea" id="topic-notes" rows="3"
                                          placeholder="Observações sobre o tópico..."></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancel-topic-btn">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Adicionar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza item de fase na timeline
     */
    renderPhaseItem(phase, index, completed, total) {
        const isCompleted = phase.status === 'concluido';
        const isInProgress = phase.status === 'em_andamento';

        let statusClass = 'phase-pending';
        if (isCompleted) statusClass = 'phase-completed';
        else if (isInProgress) statusClass = 'phase-in-progress';

        return `
            <div class="timeline-item ${statusClass}">
                <div class="timeline-marker">
                    ${isCompleted ? `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    ` : ''}
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-title">${phase.name || ContestDialog.getPhaseTypeName(phase.type)}</span>
                        <select class="phase-status-select" data-index="${index}" data-status="${phase.status}">
                            <option value="pendente" ${phase.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                            <option value="em_andamento" ${phase.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="concluido" ${phase.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                        </select>
                    </div>
                    <div class="timeline-meta">
                        ${phase.date ? `<span>${Helpers.formatDate(phase.date)}</span>` : ''}
                        ${phase.location ? `<span>📍 ${phase.location}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza tópicos vazios
     */
    renderEmptyTopics() {
        return `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                     style="color: var(--text-tertiary); margin: 0 auto 1rem;">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <h4 class="empty-state-title">Nenhum tópico adicionado ainda</h4>
                <p class="empty-state-description">Adicione os tópicos do conteúdo programático do concurso para acompanhar seu progresso</p>
                <button class="btn btn-primary" id="add-first-topic-btn">
                    Adicionar Primeiro Tópico
                </button>
            </div>
        `;
    },

    /**
     * Renderiza lista de tópicos
     */
    renderTopics() {
        return `
            <div class="topics-list">
                ${this.topics
                    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
                    .map((topic, index) => this.renderTopicItem(topic, index))
                    .join('')}
            </div>
        `;
    },

    /**
     * Renderiza item de tópico
     */
    renderTopicItem(topic, index) {
        const masteryColor = Helpers.getMasteryColor(topic.mastery_level || 'iniciante');

        return `
            <div class="topic-item" data-id="${topic.id}" style="animation-delay: ${index * 0.05}s">
                <div class="topic-header">
                    <div class="topic-info">
                        <button class="topic-toggle ${topic.studied ? 'studied' : ''}" data-id="${topic.id}">
                            ${topic.studied ? `
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                            ` : `
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                </svg>
                            `}
                        </button>
                        <div class="topic-details">
                            <h4 class="topic-name">${topic.topic_name}</h4>
                            <div class="topic-badges">
                                <span class="badge" style="background: ${masteryColor}20; color: ${masteryColor}">
                                    ${topic.mastery_level || 'iniciante'}
                                </span>
                                <span class="badge badge-outline">Peso: ${topic.weight || 3}/5</span>
                            </div>
                        </div>
                    </div>
                    <div class="topic-actions">
                        <button class="btn btn-ghost btn-sm edit-topic-btn" data-id="${topic.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn btn-ghost btn-sm delete-topic-btn" data-id="${topic.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="topic-progress">
                    <div class="progress-header">
                        <span>Progresso</span>
                        <span class="progress-value">${topic.progress_level || 0}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${topic.progress_level || 0}%"></div>
                    </div>
                </div>
                ${topic.notes ? `<p class="topic-notes">📝 ${topic.notes}</p>` : ''}
                ${topic.last_studied ? `<p class="topic-last-study">Último estudo: ${Helpers.formatDate(topic.last_studied)}</p>` : ''}
            </div>
        `;
    },

    /**
     * Bind eventos
     */
    bindEvents() {
        // Voltar
        document.getElementById('back-btn').addEventListener('click', () => {
            if (this.onBack) this.onBack();
        });

        // Adicionar tópico
        const addTopicBtns = [
            document.getElementById('add-topic-btn'),
            document.getElementById('add-first-topic-btn')
        ];

        addTopicBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', () => this.openTopicModal());
        });

        // Fechar modal de tópico
        document.getElementById('close-topic-modal').addEventListener('click', () => this.closeTopicModal());
        document.getElementById('cancel-topic-btn').addEventListener('click', () => this.closeTopicModal());
        document.querySelector('#topic-modal .modal-backdrop').addEventListener('click', () => this.closeTopicModal());

        // Salvar tópico
        document.getElementById('topic-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTopic();
        });

        // Toggle estudado
        document.querySelectorAll('.topic-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggleStudied(btn.dataset.id));
        });

        // Editar tópico
        document.querySelectorAll('.edit-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => this.editTopic(btn.dataset.id));
        });

        // Excluir tópico
        document.querySelectorAll('.delete-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteTopic(btn.dataset.id));
        });

        // Status de fase
        document.querySelectorAll('.phase-status-select').forEach(select => {
            select.addEventListener('change', (e) => this.updatePhaseStatus(e.target));
        });

        // Importar tópicos
        document.getElementById('import-topics-btn').addEventListener('click', () => {
            Toast.info('Funcionalidade de importação de edital em desenvolvimento');
        });

        // Adicionar fase
        document.getElementById('add-phase-btn')?.addEventListener('click', () => {
            Modal.alert({
                title: 'Adicionar Fase',
                message: 'Para adicionar fases, edite o concurso na página de Meus Concursos'
            });
        });
    },

    /**
     * Abre modal de tópico
     */
    openTopicModal(topic = null) {
        const modal = document.getElementById('topic-modal');
        modal.classList.remove('hidden');

        if (topic) {
            document.getElementById('topic-name').value = topic.topic_name;
            document.getElementById('topic-weight').value = topic.weight || 3;
            document.getElementById('topic-notes').value = topic.notes || '';
            modal.dataset.editId = topic.id;
        } else {
            document.getElementById('topic-form').reset();
            delete modal.dataset.editId;
        }
    },

    /**
     * Fecha modal de tópico
     */
    closeTopicModal() {
        document.getElementById('topic-modal').classList.add('hidden');
    },

    /**
     * Salva tópico
     */
    async saveTopic() {
        const modal = document.getElementById('topic-modal');
        const editId = modal.dataset.editId;

        const topicData = {
            contest_id: this.contest.id,
            user_email: AuthService.getCurrentUser().email,
            topic_name: document.getElementById('topic-name').value,
            weight: parseInt(document.getElementById('topic-weight').value),
            notes: document.getElementById('topic-notes').value,
            studied: false,
            progress_level: 0,
            questions_practiced: 0,
            mastery_level: 'iniciante'
        };

        try {
            if (editId) {
                await db.study_topics.update(editId, {
                    ...topicData,
                    updated_at: new Date().toISOString()
                });
                Toast.success('Tópico atualizado!');
            } else {
                await db.study_topics.add({
                    ...topicData,
                    id: Helpers.generateId(),
                    created_at: new Date().toISOString()
                });
                Toast.success('Tópico adicionado!');
            }

            this.closeTopicModal();
            await this.refresh();
        } catch (error) {
            console.error('Error saving topic:', error);
            Toast.error('Erro ao salvar tópico');
        }
    },

    /**
     * Alterna status de estudado
     */
    async toggleStudied(topicId) {
        const topic = this.topics.find(t => t.id === topicId);
        if (!topic) return;

        const newStudied = !topic.studied;
        const lastStudied = newStudied ? new Date().toISOString() : topic.last_studied;

        await db.study_topics.update(topicId, {
            studied: newStudied,
            last_studied
        });

        await this.refresh();
    },

    /**
     * Exclui tópico
     */
    async deleteTopic(topicId) {
        Modal.confirm({
            title: 'Excluir Tópico',
            message: 'Tem certeza que deseja excluir este tópico?',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            type: 'danger',
            onConfirm: async () => {
                await db.study_topics.delete(topicId);
                Toast.success('Tópico excluído!');
                await this.refresh();
            }
        });
    },

    /**
     * Atualiza status de fase
     */
    async updatePhaseStatus(select) {
        const index = parseInt(select.dataset.index);
        const newStatus = select.value;

        const phases = [...(this.contest.phases || [])];
        phases[index].status = newStatus;

        await db.contests.update(this.contest.id, {
            phases,
            updated_at: new Date().toISOString()
        });

        this.contest.phases = phases;
        await this.refresh();

        // Atualizar progresso do concurso
        await this.updateContestProgress();
    },

    /**
     * Atualiza progresso geral do concurso
     */
    async updateContestProgress() {
        const topics = await DatabaseService.getStudyTopics(this.contest.id);

        if (topics.length === 0) return;

        const totalProgress = topics.reduce((sum, t) => sum + (t.progress_level || 0), 0);
        const avgProgress = Math.round(totalProgress / topics.length);

        await db.contests.update(this.contest.id, {
            study_progress: avgProgress
        });

        this.contest.study_progress = avgProgress;
    },

    /**
     * Editar tópico
     */
    editTopic(topicId) {
        const topic = this.topics.find(t => t.id === topicId);
        if (topic) {
            this.openTopicModal(topic);
        }
    },

    /**
     * Recarrega dados
     */
    async refresh() {
        this.topics = await DatabaseService.getStudyTopics(this.contest.id);
        const progress = this.topics.length > 0
            ? Math.round(this.topics.reduce((sum, t) => sum + (t.progress_level || 0), 0) / this.topics.length)
            : 0;

        await db.contests.update(this.contest.id, { study_progress: progress });
        this.contest.study_progress = progress;

        await this.render(this.contest, this.onBack);
    },

    /**
     * Anima entrada
     */
    animateEntrance() {
        const items = document.querySelectorAll('.topic-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';

            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
};

// Exportar para uso global
window.ContestDetails = ContestDetails;
