/**
 * Helpers Utility Functions
 * Funções utilitárias para formatação, validação e manipulação de dados
 */

const Helpers = {
    /**
     * Formata data para o formato brasileiro
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        return new Date(date).toLocaleDateString('pt-BR', { ...defaultOptions, ...options });
    },

    /**
     * Formata data e hora para o formato brasileiro
     */
    formatDateTime(date) {
        return new Date(date).toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Formata tempo em segundos para HH:MM:SS
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Formata tempo restante para exibição
     */
    formatTimeRemaining(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        const diff = target - now;

        if (diff <= 0) return 'Encerrado';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    },

    /**
     * Gera um ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Capitaliza a primeira letra de cada palavra
     */
    titleCase(text) {
        return text.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    /**
     * Limita o texto com reticências
     */
    truncate(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    },

    /**
     * Valida email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Calcula dias restantes até uma data
     */
    daysUntil(date) {
        const now = new Date();
        const target = new Date(date);
        const diff = target - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    /**
     * Verifica se uma data é hoje
     */
    isToday(date) {
        const today = new Date();
        const target = new Date(date);
        return today.toDateString() === target.toDateString();
    },

    /**
     * Formata preço em reais
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    /**
     * Embaralha um array (Fisher-Yates)
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Clona um objeto profundamente
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Mescla objetos profundamente
     */
    deepMerge(target, source) {
        const output = { ...target };
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    },

    /**
     * Verifica se é um objeto
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Armazena no localStorage
     */
    localSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },

    /**
     * Recupera do localStorage
     */
    localGet(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    /**
     * Remove do localStorage
     */
    localRemove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },

    /**
     * Formata nome do usuário para avatar
     */
    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },

    /**
     * Retorna cor baseada no tipo de concurso
     */
    getExamTypeColor(type) {
        const colors = {
            'enfermeiro': '#0891b2',
            'técnico': '#7c3aed',
            'auxiliar': '#059669',
            'geral': '#6366f1'
        };
        return colors[type] || '#6366f1';
    },

    /**
     * Retorna cor baseada no nível de domínio
     */
    getMasteryColor(level) {
        const colors = {
            'iniciante': '#94a3b8',
            'básico': '#3b82f6',
            'intermediário': '#f59e0b',
            'avançado': '#f97316',
            'expert': '#22c55e'
        };
        return colors[level] || '#94a3b8';
    },

    /**
     * Retorna cor baseada no status da fase
     */
    getPhaseStatusColor(status) {
        const colors = {
            'pendente': '#94a3b8',
            'em_andamento': '#3b82f6',
            'concluído': '#22c55e'
        };
        return colors[status] || '#94a3b8';
    },

    /**
     * Calcula a porcentagem de acertos
     */
    calculatePercentage(correct, total) {
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
    },

    /**
     * Formata número grande para formato legível
     */
    formatLargeNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    /**
     * Delay/Espera
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Verifica se está no mobile
     */
    isMobile() {
        return window.innerWidth < 1024;
    },

    /**
     * Copia texto para clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    },

    /**
     * Verifica se objeto está vazio
     */
    isEmpty(item) {
        if (item === null || item === undefined) return true;
        if (Array.isArray(item)) return item.length === 0;
        if (typeof item === 'object') return Object.keys(item).length === 0;
        return false;
    },

    /**
     * Gera cor aleatória para gráficos
     */
    getRandomColor() {
        const colors = [
            '#0891b2', '#22c55e', '#f59e0b', '#ef4444',
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Formata número para locale pt-BR
     */
    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('pt-BR');
    }
};

// Export para uso global
window.Helpers = Helpers;
