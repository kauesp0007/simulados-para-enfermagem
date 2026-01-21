/**
 * Script de Importação de Dados CSV
 * Processa arquivos da pasta Data e importa para IndexedDB
 * Versão: Non-Module (Global Scope)
 */

// A classe agora será anexada ao window
window.DataImport = (function() {
    'use strict';

    var ImportedCount = {
        questions: 0,
        contests: 0,
        quizzes: 0,
        topics: 0,
        attempts: 0
    };

    var errors = [];

    var dataPath = 'data/';

    /**
     * Iniciar importação completa de todos os arquivos
     */
    async function importAll() {
        try {
            console.log('Iniciando importação de dados...');
            
            // Limpar dados existentes
            await clearAllData();
            
            // Importar em sequência
            await importQuestions();
            await importContests();
            await importPublicContests();
            await importQuizzes();
            await importTopics();
            await importQuizAttempts();
            
            console.log('Importação concluída:', ImportedCount);
            return {
                success: true,
                imported: ImportedCount,
                errors: errors
            };
            
        } catch (error) {
            console.error('Erro durante importação:', error);
            return {
                success: false,
                error: error.message,
                imported: ImportedCount,
                errors: errors
            };
        }
    }

    /**
     * Limpar todos os dados do banco
     */
    async function clearAllData() {
        await db.transaction('rw', 
            db.questions, db.contests, db.publicContests, 
            db.quizzes, db.topics, db.quizAttempts,
            db.spacedRepetition, db.studySessions,
            async function() {
                await db.questions.clear();
                await db.contests.clear();
                await db.publicContests.clear();
                await db.quizzes.clear();
                await db.topics.clear();
                await db.quizAttempts.clear();
                await db.spacedRepetition.clear();
                await db.studySessions.clear();
            }
        );
        console.log('Dados anteriores removidos');
    }

    /**
     * Importar questões do arquivo CSV
     */
    async function importQuestions() {
        try {
            var response = await fetch(dataPath + 'questions.csv');
            if (!response.ok) {
                console.warn('Arquivo questions.csv não encontrado');
                return;
            }

            var csvText = await response.text();
            var questions = parseCSV(csvText);
            
            // Filtrar apenas linhas válidas com ID
            var validQuestions = questions.filter(function(q) { return q.id; });
            
            await db.transaction('rw', db.questions, async function() {
                for (var i = 0; i < validQuestions.length; i++) {
                    var q = validQuestions[i];
                    await db.questions.put({
                        id: parseInt(q.id) || 0,
                        content: q.content || q.pergunta || '',
                        type: q.type || q.tipo || 'multiple-choice',
                        options: parseOptions(q.options || q.alternativas),
                        correctAnswer: q.correct_answer || q.resposta_correta || '',
                        explanation: q.explanation || q.explicacao || '',
                        difficulty: parseInt(q.difficulty || q.dificuldade) || 1,
                        topicId: parseInt(q.topic_id || q.assunto_id) || null,
                        contestId: parseInt(q.contest_id || q.concurso_id) || null,
                        createdAt: new Date(q.created_at || Date.now()),
                        updatedAt: new Date(q.updated_at || Date.now()),
                        timesAnswered: parseInt(q.times_answered || 0),
                        timesCorrect: parseInt(q.times_correct || 0)
                    });
                }
            });
            
            ImportedCount.questions = validQuestions.length;
            console.log(validQuestions.length + ' questões importadas');
            
        } catch (error) {
            errors.push({ type: 'questions', error: error.message });
            console.error('Erro ao importar questões:', error);
        }
    }

    /**
     * Importar concursos do arquivo CSV
     */
    async function importContests() {
        try {
            var response = await fetch(dataPath + 'contests.csv');
            if (!response.ok) {
                console.warn('Arquivo contests.csv não encontrado');
                return;
            }

            var csvText = await response.text();
            var contests = parseCSV(csvText);
            
            await db.transaction('rw', db.contests, async function() {
                for (var i = 0; i < contests.length; i++) {
                    var c = contests[i];
                    if (!c.id) continue;
                    
                    await db.contests.put({
                        id: parseInt(c.id),
                        name: c.name || c.nome || '',
                        institution: c.institution || c.instituicao || '',
                        year: parseInt(c.year || c.ano) || new Date().getFullYear(),
                        level: c.level || c.nivel || 'medium',
                        status: c.status || 'planned',
                        phases: parsePhases(c.phases || c.fases),
                        totalQuestions: parseInt(c.total_questions || 0),
                        studyProgress: parseFloat(c.study_progress || 0),
                        lastStudyDate: c.last_study_date ? new Date(c.last_study_date) : null,
                        createdAt: new Date(c.created_at || Date.now()),
                        updatedAt: new Date(c.updated_at || Date.now())
                    });
                }
            });
            
            ImportedCount.contests = contests.filter(function(c) { return c.id; }).length;
            console.log(ImportedCount.contests + ' concursos importados');
            
        } catch (error) {
            errors.push({ type: 'contests', error: error.message });
            console.error('Erro ao importar concursos:', error);
        }
    }

    /**
     * Importar concursos públicos do arquivo CSV
     */
    async function importPublicContests() {
        try {
            var response = await fetch(dataPath + 'public_contests.csv');
            if (!response.ok) {
                console.warn('Arquivo public_contests.csv não encontrado');
                return;
            }

            var csvText = await response.text();
            var contests = parseCSV(csvText);
            
            await db.transaction('rw', db.publicContests, async function() {
                for (var i = 0; i < contests.length; i++) {
                    var c = contests[i];
                    if (!c.id) continue;
                    
                    await db.publicContests.put({
                        id: parseInt(c.id),
                        name: c.name || c.nome || '',
                        institution: c.institution || c.instituicao || '',
                        year: parseInt(c.year || c.ano) || new Date().getFullYear(),
                        level: c.level || c.nivel || 'medium',
                        questionCount: parseInt(c.question_count || c.qtd_questoes || 0),
                        description: c.description || c.descricao || '',
                        isPremium: c.is_premium === 'true' || c.is_premium === '1' || false,
                        createdAt: new Date(c.created_at || Date.now()),
                        updatedAt: new Date(c.updated_at || Date.now())
                    });
                }
            });
            
            ImportedCount.contests = contests.filter(function(c) { return c.id; }).length;
            console.log(ImportedCount.contests + ' concursos públicos importados');
            
        } catch (error) {
            errors.push({ type: 'publicContests', error: error.message });
            console.error('Erro ao importar concursos públicos:', error);
        }
    }

    /**
     * Importar quizzes do arquivo CSV
     */
    async function importQuizzes() {
        try {
            var response = await fetch(dataPath + 'quizzes.csv');
            if (!response.ok) {
                console.warn('Arquivo quizzes.csv não encontrado');
                return;
            }

            var csvText = await response.text();
            var quizzes = parseCSV(csvText);
            
            await db.transaction('rw', db.quizzes, async function() {
                for (var i = 0; i < quizzes.length; i++) {
                    var q = quizzes[i];
                    if (!q.id) continue;
                    
                    await db.quizzes.put({
                        id: parseInt(q.id),
                        title: q.title || q.titulo || '',
                        description: q.description || q.descricao || '',
                        type: q.type || q.tipo || 'practice',
                        contestId: parseInt(q.contest_id || q.concurso_id) || null,
                        topicId: parseInt(q.topic_id || q.assunto_id) || null,
                        questionCount: parseInt(q.question_count || 0),
                        timeLimit: parseInt(q.time_limit || q.tempo_limite) || null,
                        isRandom: q.is_random === 'true' || false,
                        createdAt: new Date(q.created_at || Date.now()),
                        updatedAt: new Date(q.updated_at || Date.now())
                    });
                }
            });
            
            ImportedCount.quizzes = quizzes.filter(function(q) { return q.id; }).length;
            console.log(ImportedCount.quizzes + ' quizzes importados');
            
        } catch (error) {
            errors.push({ type: 'quizzes', error: error.message });
            console.error('Erro ao importar quizzes:', error);
        }
    }

    /**
     * Importar tópicos/assuntos do arquivo CSV
     */
    async function importTopics() {
        try {
            var response = await fetch(dataPath + 'topics.csv');
            if (!response.ok) {
                console.warn('Arquivo topics.csv não encontrado');
                return;
            }

            var csvText = await response.text();
            var topics = parseCSV(csvText);
            
            await db.transaction('rw', db.topics, async function() {
                for (var i = 0; i < topics.length; i++) {
                    var t = topics[i];
                    if (!t.id) continue;
                    
                    await db.topics.put({
                        id: parseInt(t.id),
                        name: t.name || t.nome || '',
                        description: t.description || t.descricao || '',
                        parentId: parseInt(t.parent_id || t.id_pai) || null,
                        questionCount: parseInt(t.question_count || 0),
                        icon: t.icon || null,
                        color: t.color || null,
                        order: parseInt(t.order || t.ordem) || 0,
                        createdAt: new Date(t.created_at || Date.now()),
                        updatedAt: new Date(t.updated_at || Date.now())
                    });
                }
            });
            
            ImportedCount.topics = topics.filter(function(t) { return t.id; }).length;
            console.log(ImportedCount.topics + ' tópicos importados');
            
        } catch (error) {
            errors.push({ type: 'topics', error: error.message });
            console.error('Erro ao importar tópicos:', error);
        }
    }

    /**
     * Importar tentativas de quiz do arquivo CSV
     */
    async function importQuizAttempts() {
        try {
            var response = await fetch(dataPath + 'quiz_attempts.csv');
            if (!response.ok) {
                console.warn('Arquivo quiz_attempts.csv não encontrado');
                return;
            }

            var csvText = await response.text();
            var attempts = parseCSV(csvText);
            
            await db.transaction('rw', db.quizAttempts, async function() {
                for (var i = 0; i < attempts.length; i++) {
                    var a = attempts[i];
                    if (!a.id) continue;
                    
                    await db.quizAttempts.put({
                        id: parseInt(a.id),
                        quizId: parseInt(a.quiz_id || a.quiz_id),
                        userId: parseInt(a.user_id || a.usuario_id) || 1,
                        score: parseFloat(a.score || a.pontuacao) || 0,
                        totalQuestions: parseInt(a.total_questions || a.total_questoes) || 0,
                        correctAnswers: parseInt(a.correct_answers || a.respostas_corretas) || 0,
                        timeSpent: parseInt(a.time_spent || a.tempo_gasto) || 0,
                        answers: parseJSON(a.answers || a.respostas),
                        startedAt: a.started_at ? new Date(a.started_at) : new Date(),
                        completedAt: a.completed_at ? new Date(a.completed_at) : null
                    });
                }
            });
            
            ImportedCount.attempts = attempts.filter(function(a) { return a.id; }).length;
            console.log(ImportedCount.attempts + ' tentativas de quiz importadas');
            
        } catch (error) {
            errors.push({ type: 'quizAttempts', error: error.message });
            console.error('Erro ao importar tentativas:', error);
        }
    }

    /**
     * Parse de CSV simples
     */
    function parseCSV(text) {
        var lines = text.trim().split('\n');
        if (lines.length < 2) return [];
        
        // Extrair cabeçalhos
        var headers = parseCSVLine(lines[0]);
        var result = [];
        
        for (var i = 1; i < lines.length; i++) {
            var values = parseCSVLine(lines[i]);
            if (values.length === 0) continue;
            
            var obj = {};
            headers.forEach(function(header, index) {
                obj[header.trim()] = values[index] ? values[index].trim() : '';
            });
            
            result.push(obj);
        }
        
        return result;
    }

    /**
     * Parse de uma linha CSV (lida com aspas)
     */
    function parseCSVLine(line) {
        var result = [];
        var current = '';
        var inQuotes = false;
        
        for (var i = 0; i < line.length; i++) {
            var char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    /**
     * Parse de opções de questão
     */
    function parseOptions(optionsStr) {
        if (!optionsStr) return [];
        
        try {
            // Tentar parse como JSON
            return JSON.parse(optionsStr);
        } catch (e) {
            // Tentar parse como texto separado por |
            return optionsStr.split('|').map(function(opt) { return opt.trim(); });
        }
    }

    /**
     * Parse de fases de concurso
     */
    function parsePhases(phasesStr) {
        if (!phasesStr) return [];
        
        try {
            return JSON.parse(phasesStr);
        } catch (e) {
            return [];
        }
    }

    /**
     * Parse de JSON em string
     */
    function parseJSON(jsonStr) {
        if (!jsonStr) return null;
        
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            return null;
        }
    }

    /**
     * Obter progresso da importação
     */
    function getProgress() {
        var total = 0;
        for (var key in ImportedCount) {
            if (ImportedCount.hasOwnProperty(key)) {
                total += ImportedCount[key];
            }
        }
        return {
            questions: ImportedCount.questions,
            contests: ImportedCount.contests,
            quizzes: ImportedCount.quizzes,
            topics: ImportedCount.topics,
            attempts: ImportedCount.attempts,
            total: total,
            errors: errors.length
        };
    }

    // Expor funções públicas
    return {
        importAll: importAll,
        getProgress: getProgress,
        importQuestions: importQuestions,
        importContests: importContests,
        importPublicContests: importPublicContests,
        importQuizzes: importQuizzes,
        importTopics: importTopics,
        importQuizAttempts: importQuizAttempts
    };

})();

// Instância única para uso imediato
window.dataImport = window.DataImport;

console.log('DataImport.js carregado com sucesso');
