 */

(function() {
    'use strict';

    // ============================================
    // 1. CONFIGURAÇÃO GLOBAL
    // ============================================

    var ErrorConfig = {
        // Domínios que devem ser ignorados (não existem)
        invalidDomains: [
            'minimax',
            'alouuiteftvm',
            'agent-storage'
        ],
        
        // Recursos que podem falhar sem quebrar a aplicação
        optionalResources: [
            'analytics',
            'ads',
            'tracking',
            'external-cdn'
        ],
        
        // Erros que devem ser silenciados
        silencedErrors: [
            'TextModel got disposed',
            'Canceled: Canceled',
            'no diff result available'
        ],
        
        // Modo debug
        debug: false
    };

    // ============================================
    // 2. LOGGER CENTRALIZADO
    // ============================================

    var Logger = {
        log: function(level, message, data) {
            var timestamp = new Date().toISOString();
            var prefix = '[' + timestamp + '] [' + level + ']';
            
            if (ErrorConfig.debug || level === 'ERROR' || level === 'WARN') {
                console.log(prefix, message, data || '');
            }
        },
        
        info: function(message, data) {
            this.log('INFO', message, data);
        },
        
        warn: function(message, data) {
            this.log('WARN', message, data);
        },
        
        error: function(message, data) {
            this.log('ERROR', message, data);
        }
    };

    // ============================================
    // 3. VALIDAÇÃO DE DOMÍNIOS
    // ============================================

    var DomainValidator = {
        isInvalid: function(url) {
            if (!url) return false;
            
            return ErrorConfig.invalidDomains.some(function(domain) {
                return url.includes(domain);
            });
        },
        
        isOptional: function(url) {
            if (!url) return false;
            
            return ErrorConfig.optionalResources.some(function(resource) {
                return url.includes(resource);
            });
        },
        
        shouldIgnore: function(error) {
            if (!error) return false;
            
            return ErrorConfig.silencedErrors.some(function(silencedError) {
                return error.includes(silencedError);
            });
        }
    };

    // ============================================
    // 4. TRATAMENTO DE ERROS GLOBAIS
    // ============================================

    window.addEventListener('error', function(event) {
        var filename = event.filename || '';
        var message = event.message || '';
        
        // Ignorar erros de domínios inválidos
        if (DomainValidator.isInvalid(filename)) {
            Logger.warn('Recurso de domínio inválido não encontrado', filename);
            event.preventDefault();
            return;
        }
        
        // Ignorar erros silenciados
        if (DomainValidator.shouldIgnore(message)) {
            Logger.warn('Erro silenciado', message);
            event.preventDefault();
            return;
        }
        
        // Ignorar erros de recursos opcionais
        if (DomainValidator.isOptional(filename)) {
            Logger.warn('Recurso opcional não carregado', filename);
            event.preventDefault();
            return;
        }
        
        // Registrar outros erros
        Logger.error('Erro não tratado', {
            message: message,
            filename: filename,
            lineno: event.lineno,
            colno: event.colno
        });
        
    }, true);

    // ============================================
    // 5. TRATAMENTO DE PROMESSAS REJEITADAS
    // ============================================

    window.addEventListener('unhandledrejection', function(event) {
        var reason = event.reason || {};
        var message = reason.message || String(reason);
        
        // Ignorar erros de domínios inválidos
        if (DomainValidator.isInvalid(message)) {
            Logger.warn('Promise rejeitada: domínio inválido', message);
            event.preventDefault();
            return;
        }
        
        // Ignorar erros silenciados
        if (DomainValidator.shouldIgnore(message)) {
            Logger.warn('Promise rejeitada: erro silenciado', message);
            event.preventDefault();
            return;
        }
        
        // Registrar rejeição de promise
        Logger.error('Promise rejeitada', {
            message: message,
            reason: reason
        });
    });

    // ============================================
    // 6. POLYFILL PARA OBJETOS GLOBAIS
    // ============================================

    // NotificationManager - Fallback
    if (typeof window.NotificationManager === 'undefined') {
        window.NotificationManager = {
            init: function() {
                Logger.warn('NotificationManager não está disponível (usando fallback)');
            },
            
            show: function(message, options) {
                options = options || {};
                Logger.info('Notificação', message);
                
                // Fallback: usar console
                if (options.type === 'error') {
                    console.error('[NOTIFICAÇÃO]', message);
                } else if (options.type === 'warning') {
                    console.warn('[NOTIFICAÇÃO]', message);
                } else {
                    console.log('[NOTIFICAÇÃO]', message);
                }
            },
            
            hide: function() {},
            
            clear: function() {}
        };
    }

    // ExamCountdownManager - Fallback
    if (typeof window.ExamCountdownManager === 'undefined') {
        window.ExamCountdownManager = {
            init: function() {
                Logger.warn('ExamCountdownManager não está disponível (usando fallback)');
            },
            
            loadExamCountdown: function() {}
        };
    }

    // DashboardManager - Fallback
    if (typeof window.DashboardManager === 'undefined') {
        window.DashboardManager = {
            init: function() {
                Logger.warn('DashboardManager não está disponível (usando fallback)');
            }
        };
    }

    // ============================================
    // 7. FUNÇÕES AUXILIARES SEGURAS
    // ============================================

    /**
     * Definir innerHTML com verificação null-safe
     */
    window.safeSetHTML = function(elementId, html) {
        var element = document.getElementById(elementId);
        if (element !== null && element !== undefined) {
            element.innerHTML = html;
            Logger.info('HTML definido com sucesso', elementId);
            return true;
        } else {
            Logger.warn('Elemento não encontrado para definir HTML', elementId);
            return false;
        }
    };

    /**
     * Obter elemento com fallback
     */
    window.safeGetElement = function(elementId, fallbackElement) {
        var element = document.getElementById(elementId);
        if (element !== null && element !== undefined) {
            return element;
        } else {
            Logger.warn('Elemento não encontrado, usando fallback', elementId);
            return fallbackElement || null;
        }
    };

    /**
     * Fetch com retry para HTTP/2 errors
     */
    window.fetchWithRetry = function(url, options, maxRetries) {
        maxRetries = maxRetries || 3;
        options = options || {};
        
        return new Promise(function(resolve, reject) {
            function attemptFetch(retriesLeft) {
                fetch(url, options)
                    .then(function(response) {
                        if (!response.ok) {
                            throw new Error('HTTP ' + response.status);
                        }
                        resolve(response);
                    })
                    .catch(function(error) {
                        if (retriesLeft > 0 && error.message.includes('HTTP/2')) {
                            Logger.warn('HTTP/2 error, tentando novamente...', url);
                            setTimeout(function() {
                                attemptFetch(retriesLeft - 1);
                            }, 1000);
                        } else {
                            reject(error);
                        }
                    });
            }
            
            attemptFetch(maxRetries);
        });
    };

    /**
     * Carregar script com fallback
     */
    window.loadScriptSafe = function(src, onSuccess, onError) {
        var script = document.createElement('script');
        script.src = src;
        
        script.onload = function() {
            Logger.info('Script carregado com sucesso', src);
            if (typeof onSuccess === 'function') {
                onSuccess();
            }
        };
        
        script.onerror = function() {
            Logger.warn('Falha ao carregar script', src);
            if (typeof onError === 'function') {
                onError();
            }
        };
        
        document.head.appendChild(script);
    };

    /**
     * Carregar CSS com fallback
     */
    window.loadCssSafe = function(href, onSuccess, onError) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        
        link.onload = function() {
            Logger.info('CSS carregado com sucesso', href);
            if (typeof onSuccess === 'function') {
                onSuccess();
            }
        };
        
        link.onerror = function() {
            Logger.warn('Falha ao carregar CSS', href);
            if (typeof onError === 'function') {
                onError();
            }
        };
        
        document.head.appendChild(link);
    };

    /**
     * Executar função com try-catch
     */
    window.safeTry = function(fn, context, args) {
        try {
            return fn.apply(context || window, args || []);
        } catch (error) {
            Logger.error('Erro ao executar função', error.message);
            return null;
        }
    };

    // ============================================
    // 8. INICIALIZAÇÃO
    // ============================================

    Logger.info('Sistema global de tratamento de erros inicializado');
    
    // Expor Logger para debug
    window.ErrorLogger = Logger;
    window.ErrorConfig = ErrorConfig;

})();
