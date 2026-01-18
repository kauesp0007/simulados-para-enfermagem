/**
 * Seed Data Script - Popula o banco de dados com dados mock
 * Simula o conteúdo criado pelo Administrador do sistema
 * Executado automaticamente na primeira inicialização
 */

const SeedData = {
    /**
     * Executa toda a população de dados
     */
    async populateAll() {
        try {
            console.log('Iniciando população de dados mock...');

            // Verifica se já existem dados
            const isFirstRun = await DatabaseService.isFirstRun();
            if (!isFirstRun) {
                console.log('Dados já existem. Pulando população.');
                return { success: true, message: 'Dados já populados anteriormente' };
            }

            // Popula cada tipo de dados
            await this.populateQuestions();
            await this.populatePublicContests();
            await this.populateQuizzes();
            await this.populateFlashcardDecks();
            await this.populateLibraryResources();

            console.log('População de dados concluída com sucesso!');
            return { success: true, message: 'Dados mock populados com sucesso' };
        } catch (error) {
            console.error('Erro ao.popular dados:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Popula questões do banco de questões (conteúdo do Administrador)
     */
    async populateQuestions() {
        const questions = [
            //Assistência de Enfermagem em Saúde do Adulto
            {
                id: 'Q001',
                topic: 'Enfermagem em Clínica Médica',
                category: 'Assistência de Enfermagem',
                subcategory: 'Saúde do Adulto',
                exam_type: 'OBJETIVA',
                institution: 'Hospital',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'Qual é a intervenção de enfermagem prioritária para um paciente com infarto agudo do miocárdio nos primeiros minutos de atendimento?',
                options: {
                    A: 'Administrar oxigênio suplementar por cateter nasal',
                    B: 'Realizar acesso venoso periférico com Jelco 18',
                    C: 'Administrar aspirina 300mg por via oral',
                    D: 'Obter ECG de 12 derivações',
                    E: 'Coletar amostra de sangue para marcadores cardíacos'
                },
                correct_answer: 'D',
                explanation: 'A obtenção do ECG de 12 derivações nos primeiros 10 minutos é a intervenção prioritária, pois confirma o diagnóstico de IAM e orienta a conduta terapêutica imediata, incluindo a possibilidade de trombólise ou intervencionismo.',
                tags: ['IAM', 'Emergência', 'Cardiologia', 'Prioridade'],
                points: 10,
                source: 'Manual de Orientações do SAMU',
                created_by: 'ADMIN',
                created_at: '2024-01-15T10:00:00Z'
            },
            {
                id: 'Q002',
                topic: 'Enfermagem em Clínica Médica',
                category: 'Assistência de Enfermagem',
                subcategory: 'Saúde do Adulto',
                exam_type: 'OBJETIVA',
                institution: 'UBS',
                year: 2024,
                difficulty: 'FÁCIL',
                question: 'A hipertensão arterial sistêmica é considerada um fator de risco para quais complicações cardiovasculares?',
                options: {
                    A: 'Apenas insuficiência cardíaca',
                    B: 'Apenas acidente vascular cerebral',
                    C: 'Insuficiência cardíaca, AVC e doença arterial coronariana',
                    D: 'Apenas doença arterial periférica',
                    E: 'Nenhuma das anteriores'
                },
                correct_answer: 'C',
                explanation: 'A hipertensão arterial é fator de risco para múltiplas complicações cardiovasculares, incluindo insuficiência cardíaca, acidente vascular cerebral, doença arterial coronariana, aneurisma dissecante da aorta e insuficiência renal crônica.',
                tags: ['HAS', 'Fatores de Risco', 'Cardiologia'],
                points: 5,
                source: 'VIII Diretrizes Brasileiras de Hipertensão',
                created_by: 'ADMIN',
                created_at: '2024-01-15T10:30:00Z'
            },
            {
                id: 'Q003',
                topic: 'Enfermagem em Clínica Médica',
                category: 'Assistência de Enfermagem',
                subcategory: 'Saúde do Adulto',
                exam_type: 'DISSERTATIVA',
                institution: 'Hospital',
                year: 2023,
                difficulty: 'DIFÍCIL',
                question: 'Descreva os cuidados de enfermagem no preparo e administração de insulina regular, considerando os princípios do Seis Certos da Medicação.',
                model_answer: 'Os cuidados incluem: 1) Certa droga - verificar prescrição médica e identificar o tipo de insulina; 2) Certa dose - utilizar seringa calibrada em UI, verificar dosagem na prescrição; 3) Certa via - subcutânea (ou IV para insulina regular); 4) Certo paciente - identificar pelo bracelete e perguntar nome; 5) Certa hora - 30 minutos antes das refeições (para insulina regular); 6) Certa documentação - registrar horário, local, dose evia. Observar técnica asséptica, rodízio de locais de aplicação e verificar glicemia capilar antes da administração.',
                tags: ['Insulina', 'Diabetes', 'Administração de Medicamentos', 'Seis Certos'],
                points: 20,
                source: 'Sociedade Brasileira de Diabetes',
                created_by: 'ADMIN',
                created_at: '2024-01-16T09:00:00Z'
            },
            {
                id: 'Q004',
                topic: 'Enfermagem em Doenças Transmissíveis',
                category: 'Assistência de Enfermagem',
                subcategory: 'Saúde Coletiva',
                exam_type: 'OBJETIVA',
                institution: 'Secretaria de Saúde',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'Qual é o período de incubação típico da COVID-19 e quais são os sintomas mais comuns apresentados pelos pacientes?',
                options: {
                    A: '2 a 14 dias; febre, tosse seca e dispneia',
                    B: '1 a 3 dias; apenas diarréia e vômito',
                    C: '21 a 30 dias; erupções cutâneas e alopecia',
                    D: '5 a 7 dias; apenas cefaleia',
                    E: '1 a 2 dias; sintomas assintomáticos'
                },
                correct_answer: 'A',
                explanation: 'O período de incubação da COVID-19 varia de 2 a 14 dias, com mediana de 5-6 dias. Os sintomas mais comuns incluem febre, tosse seca, dispneia, ageusia, anosmia e fadiga. Sintomas gastrointestinais podem ocorrer em alguns casos.',
                tags: ['COVID-19', 'Período de Incubação', 'Sintomas', 'Doenças Transmissíveis'],
                points: 10,
                source: 'Protocolo MS COVID-19',
                created_by: 'ADMIN',
                created_at: '2024-01-17T14:00:00Z'
            },
            {
                id: 'Q005',
                topic: 'Enfermagem em Saúde Mental',
                category: 'Assistência de Enfermagem',
                subcategory: 'Saúde Mental',
                exam_type: 'OBJETIVA',
                institution: 'CAPS',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'A esquizofrenia é caracterizada por alterações do pensamento, percepção e comportamento. Qual dos seguintes NÃO é um sintoma positivo típico dessa doença?',
                options: {
                    A: 'Alucinações',
                    B: 'Delírios',
                    C: 'Discurso desorganizado',
                    D: 'Aplainamento afetivo',
                    E: 'Comportamento catatônico'
                },
                correct_answer: 'D',
                explanation: 'O aplainamento afetivo (diminuição da expressão emocional) é um sintoma NEGATIVO da esquizofrenia. Sintomas positivos incluem alucinações, delírios, discurso desorganizado e comportamentos bizarros ou catatônicos.',
                tags: ['Esquizofrenia', 'Sintomas Positivos', 'Sintomas Negativos', 'Saúde Mental'],
                points: 10,
                source: 'CID-10',
                created_by: 'ADMIN',
                created_at: '2024-01-18T11:00:00Z'
            },
            {
                id: 'Q006',
                topic: 'Enfermagem em Saúde da Mulher',
                category: 'Assistência de Enfermagem',
                subcategory: 'Saúde da Mulher',
                exam_type: 'OBJETIVA',
                institution: 'Maternidade',
                year: 2024,
                difficulty: 'FÁCIL',
                question: 'Durante o trabalho de parto, a parturiente apresenta contrações uterinas com frequência de 2 em 2 minutos e duração de 60 segundos. Esse padrão caracteriza qual fase do trabalho de parto?',
                options: {
                    A: 'Período de dilatação latente',
                    B: 'Período de dilatação ativa',
                    C: 'Período expulsivo',
                    D: 'Secondamento',
                    E: 'Período de dilatação inicial'
                },
                correct_answer: 'B',
                explanation: 'Contrações com frequência de 2 em 2 minutos e duração de 60 segundos caracterizam a fase ativa do trabalho de parto (a partir de 6cm de dilatação). Nesta fase, a dilatação cervical ocorre mais rapidamente.',
                tags: ['Trabalho de Parto', 'Fases do Parto', 'Contrações Uterinas', 'Obstetrícia'],
                points: 5,
                source: 'Partograma OMS',
                created_by: 'ADMIN',
                created_at: '2024-01-19T08:00:00Z'
            },
            {
                id: 'Q007',
                topic: 'Enfermagem em Saúde da Criança',
                category: 'Assistência de Enfermagem',
                subcategory: 'Saúde da Criança',
                exam_type: 'OBJETIVA',
                institution: 'UBS',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'A Estratégia Saúde da Família recomenda a realização da primeira consulta de puericultura idealmente até quantos dias após o nascimento?',
                options: {
                    A: '7 dias',
                    B: '15 dias',
                    C: '30 dias',
                    D: '45 dias',
                    E: '60 dias'
                },
                correct_answer: 'A',
                explanation: 'A primeira consulta de puericultura deve ser realizada até 7 dias após o nascimento (primeira semana de vida), preferencialmente entre o 3º e 5º dia de vida, para identificação precoce de problemas e orientação à família.',
                tags: ['Puericultura', 'Recém-nascido', 'ESF', 'Atenção Primária'],
                points: 5,
                source: 'Cadernos de Atenção Básica - Saúde da Criança',
                created_by: 'ADMIN',
                created_at: '2024-01-20T09:30:00Z'
            },
            {
                id: 'Q008',
                topic: 'Enfermagem em Urgência e Emergência',
                category: 'Assistência de Enfermagem',
                subcategory: 'Emergência',
                exam_type: 'OBJETIVA',
                institution: 'SAMU',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'No atendimento pré-hospitalar a uma vítima de parada cardiorrespiratória, qual é a sequência correta de ações do socorrista?',
                options: {
                    A: 'Verificar responsividade, chamar ajuda, iniciar compressões torácicas, abrir vias aéreas, ventilar',
                    B: 'Verificar responsividade, abrir vias aéreas, ventilar, iniciar compressões, chamar ajuda',
                    C: 'Chamar ajuda, verificar responsividade, abrir vias aéreas, ventilar, iniciar compressões',
                    D: 'Abrir vias aéreas, verificar responsividade, iniciar compressões, ventilar, chamar ajuda',
                    E: 'Ventilar primeiro, depois verificar responsividade, então iniciar compressões'
                },
                correct_answer: 'A',
                explanation: 'A sequência BLS (Basic Life Support) é: 1) Verificar responsividade; 2) Se não responsivo, chamar ajuda/solicitar DEA; 3) Iniciar compressões torácicas (30 compressões); 4) Abrir vias aéreas; 5) Ventilar (2 ventilações).',
                tags: ['PCR', 'Suporte Básico de Vida', 'APH', 'RCP'],
                points: 10,
                source: 'American Heart Association 2020',
                created_by: 'ADMIN',
                created_at: '2024-01-21T15:00:00Z'
            },
            {
                id: 'Q009',
                topic: 'Farmacologia Aplicada à Enfermagem',
                category: 'Farmacologia',
                subcategory: 'Medicamentos',
                exam_type: 'OBJETIVA',
                institution: 'Hospital',
                year: 2024,
                difficulty: 'DIFÍCIL',
                question: 'A digoxina é um glicosídeo cardíaco utilizado no tratamento da insuficiência cardíaca e fibrilação atrial. Qual é o principal efeito colateral que requer monitoramento laborial frequente?',
                options: {
                    A: 'Hipocalemia',
                    B: 'Hiperglicemia',
                    C: 'Hipouricemia',
                    D: 'Hipercalemia',
                    E: 'Elevação de transaminases'
                },
                correct_answer: 'A',
                explanation: 'A hipocalemia aumenta a susceptibilidade à toxicidade digitálica. A digoxina compete com o potássio pelos mesmos sítios de ligação no miocárdio. A hipocalemia potencializa os efeitos da digoxina, aumentando o risco de arritmias.',
                tags: ['Digoxina', 'Glicosídeos Cardíacos', 'Efeitos Colaterais', 'Eletrólitos'],
                points: 15,
                source: 'Formulário Terapêutico Nacional',
                created_by: 'ADMIN',
                created_at: '2024-01-22T10:00:00Z'
            },
            {
                id: 'Q010',
                topic: 'Legislação do Exercício Profissional',
                category: 'Legislação',
                subcategory: 'Ética e Legislação',
                exam_type: 'OBJETIVA',
                institution: 'Conselho Federal de Enfermagem',
                year: 2024,
                difficulty: 'FÁCIL',
                question: 'De acordo com a Lei do Exercício Profissional de Enfermagem (Lei nº 7.498/86), qual é a atribuição exclusiva do enfermeiro?',
                options: {
                    A: 'Administrar medicamentos por via oral',
                    B: 'Coletar material para exames laboratoriais',
                    C: 'Prescrever medicamentos estabelecidos em protocolos',
                    D: 'Realizar curativos simples',
                    E: 'Auxiliar em procedimentos de maior complexidade'
                },
                correct_answer: 'C',
                explanation: 'A prescrição de medicamentos estabelecidos em programas de saúde pública e em protocolos institucionais é atribuição EXCLUSIVA do enfermeiro, conforme art. 11 da Lei 7.498/86, desde que ratificada pelo médico.',
                tags: ['Legislação', 'Atribuições do Enfermeiro', 'Cofen', 'Exercício Profissional'],
                points: 10,
                source: 'Lei 7.498/86 e Decreto 94.406/87',
                created_by: 'ADMIN',
                created_at: '2024-01-23T08:00:00Z'
            },
            {
                id: 'Q011',
                topic: 'Controle de Infecção Hospitalar',
                category: 'Segurança do Paciente',
                subcategory: 'Infecção Hospitalar',
                exam_type: 'OBJETIVA',
                institution: 'Hospital',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'A higienização das mãos é a principal medida de prevenção de infecções relacionadas à assistência à saúde. Qual é o tempo mínimo recomendado para a fricção antisséptica com preparações à base de álcool?',
                options: {
                    A: '5 a 10 segundos',
                    B: '15 a 20 segundos',
                    C: '20 a 30 segundos',
                    D: '40 a 60 segundos',
                    E: '1 a 2 minutos'
                },
                correct_answer: 'C',
                explanation: 'O tempo mínimo recomendado para higienização das mãos com preparações à base de álcool é de 20 a 30 segundos, cobrindo toda a superfície das mãos e punhos. Para higienização com água e sabonete, o tempo é de 40 a 60 segundos.',
                tags: ['Higienização das Mãos', 'Infecção Hospitalar', 'Segurança do Paciente', 'CCIH'],
                points: 5,
                source: 'OMS - Clean Care is Safer Care',
                created_by: 'ADMIN',
                created_at: '2024-01-24T11:00:00Z'
            },
            {
                id: 'Q012',
                topic: 'Enfermagem em Terapia Intensiva',
                category: 'Assistência de Enfermagem',
                subcategory: 'UTI',
                exam_type: 'OBJETIVA',
                institution: 'Hospital',
                year: 2024,
                difficulty: 'DIFÍCIL',
                question: 'O protocolo de sedação e analgesia na UTI recomenda a utilização da escala de Ramsey para avaliação do nível de sedação. Um paciente que está acordado, orientado e calmo corresponde a qual nível da escala?',
                options: {
                    A: 'Nível 1',
                    B: 'Nível 2',
                    C: 'Nível 3',
                    D: 'Nível 4',
                    E: 'Nível 5'
                },
                correct_answer: 'B',
                explanation: 'A Escala de Ramsey: Nível 1 = paciente acordado, ansioso, agitado; Nível 2 = paciente acordado, orientado, calmo; Nível 3 = sonolento, responde a comandos; Nível 4 = sono profundo, responde a estímulos táteis leves; Níveis 5 e 6 = sem resposta ou resposta apenas a estímulos dolorosos.',
                tags: ['UTI', 'Sedação', 'Escala de Ramsey', 'Ventilação Mecânica'],
                points: 10,
                source: 'Protocolo de Sedação SBCCI',
                created_by: 'ADMIN',
                created_at: '2024-01-25T14:00:00Z'
            },
            {
                id: 'Q013',
                topic: 'Enfermagem em Nefrologia',
                category: 'Assistência de Enfermagem',
                subcategory: 'Especialidades',
                exam_type: 'OBJETIVA',
                institution: 'Clínica de Hemodiálise',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'Qual é o principal acesso vascular utilizado para hemodiálise de longa permanência e quais são suas complicações mais frequentes?',
                options: {
                    A: 'Fístula arteriovenosa; infecção e trombose',
                    B: 'Cateter venoso central; sangramento e hematoma',
                    C: 'Shunt arteriovenoso; aneurisma e insuficiência cardíaca',
                    D: 'Fístula arteriovenosa; estenose e infecção',
                    E: 'Cateter de longa permanência; apenas obstrução'
                },
                correct_answer: 'D',
                explanation: 'A fístula arteriovenosa é o acesso vascular preferencial para hemodiálise crônica. Suas complicações mais frequentes incluem estenose, trombose, infecção,seudoaneurisma e insuficiência cardíaca de alto débito.',
                tags: ['Hemodiálise', 'Acesso Vascular', 'Fístula AV', 'Nefrologia'],
                points: 10,
                source: 'Diretrizes SBN - Acesso Vascular',
                created_by: 'ADMIN',
                created_at: '2024-01-26T09:00:00Z'
            },
            {
                id: 'Q014',
                topic: 'Enfermagem em Oncologia',
                category: 'Assistência de Enfermagem',
                subcategory: 'Oncologia',
                exam_type: 'DISSERTATIVA',
                institution: 'Hospital Oncológico',
                year: 2023,
                difficulty: 'DIFÍCIL',
                question: 'Cite pelo menos cinco efeitos adversos comuns dos quimioterapia e as respectivas intervenções de enfermagem para cada um.',
                model_answer: '1) Náuseas e vômitos: antieméticos profiláticos, dieta fracionada, evitar odores fortes; 2) Mielossupressão: monitorar hemograma, evitar locais aglomerados, sinais de infeção; 3) Alopecia: orientação psicológica, uso de lenços/perucas, cuidado com couro cabeludo; 4) Mucosite: higiene oral rigorosa, dieta pastosa e fria, anestésicos tópicos; 5) Fadiga: planejar atividades, períodos de repouso, exercício físico leve; 6) Neuropatia periférica: avaliação sensitiva/motora, prevenção de quedas, cuidados com mãos e pés.',
                tags: ['Quimioterapia', 'Efeitos Adversos', 'Oncologia', 'Cuidados de Enfermagem'],
                points: 25,
                source: 'INCA - Controle do Câncer',
                created_by: 'ADMIN',
                created_at: '2024-01-27T10:30:00Z'
            },
            {
                id: 'Q015',
                topic: 'Saúde do Trabalhador',
                category: 'Saúde Coletiva',
                subcategory: 'Saúde do Trabalhador',
                exam_type: 'OBJETIVA',
                institution: 'UBS',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'A NR-32 estabelece diretrizes básicas para a implementação de medidas de proteção à saúde dos trabalhadores da saúde. Qual é o objetivo principal desta norma?',
                options: {
                    A: 'Regulamentar horários de trabalho',
                    B: 'Prevenir acidentes e doenças relacionadas ao trabalho em saúde',
                    C: 'Estabelecer piso salarial',
                    D: 'Normatizar procedimentos administrativos',
                    E: 'Regular a formação profissional'
                },
                correct_answer: 'B',
                explanation: 'A NR-32 tem como objetivo estabelecer diretrizes básicas para a implementação de medidas de proteção à segurança e saúde dos trabalhadores de saúde, com ênfase na prevenção de acidentes e doenças ocupacionais, incluindo exposição a agentes biológicos, químicos e físicos.',
                tags: ['NR-32', 'Saúde do Trabalhador', 'Legislação Trabalhista', 'Enfermagem do Trabalho'],
                points: 10,
                source: 'Ministério do Trabalho - NR-32',
                created_by: 'ADMIN',
                created_at: '2024-01-28T15:00:00Z'
            },
            {
                id: 'Q016',
                topic: 'Enfermagem em Gastroenterologia',
                category: 'Assistência de Enfermagem',
                subcategory: 'Gastroenterologia',
                exam_type: 'OBJETIVA',
                institution: 'Hospital',
                year: 2024,
                difficulty: 'FÁCIL',
                question: 'A cirrose hepática é uma doença crônica que evolui com fibrose do parênquima hepático. Qual é a complicação mais frequente e grave da hipertensão portal em pacientes cirróticos?',
                options: {
                    A: 'Hepatite',
                    B: 'Esteatose',
                    C: 'Ascite',
                    D: 'Encefalopatia hepática',
                    E: 'Varizes esofágicas sangrantes'
                },
                correct_answer: 'E',
                explanation: 'As varizes esofágicas sangrantes são a complicação mais grave da hipertensão portal e representam uma das principais causas de óbito em pacientes cirróticos. A ascite é a manifestação mais frequente, mas não a mais grave em termos de mortalidade imediata.',
                tags: ['Cirrose', 'Hipertensão Portal', 'Varizes Esofágicas', 'Gastroenterologia'],
                points: 10,
                source: 'PNAUM - Gastroenterologia',
                created_by: 'ADMIN',
                created_at: '2024-01-29T11:00:00Z'
            },
            {
                id: 'Q017',
                topic: 'Enfermagem em Neurologia',
                category: 'Assistência de Enfermagem',
                subcategory: 'Neurologia',
                exam_type: 'OBJETIVA',
                institution: 'Hospital',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'A escala de Glasgow é utilizada para avaliar o nível de consciência. Uma pontuação de 8 pontos ou menos indica qual condição clínica?',
                options: {
                    A: 'Confusão mental leve',
                    B: 'Estupor',
                    C: 'Coma',
                    D: 'Delírio',
                    E: 'Sedação leve'
                },
                correct_answer: 'C',
                explanation: 'A Escala de Glasgow varia de 3 a 15 pontos. Escores de 13-15 indicam alteração leve, 9-12 alteração moderada, e 8 ou menos indica COMA. Pontuação menor ou igual a 8 geralmente indica necessidade de proteção de vias aéreas.',
                tags: ['Escala de Glasgow', 'Nível de Consciência', 'Neurologia', 'Trauma'],
                points: 10,
                source: 'ATLS Guidelines',
                created_by: 'ADMIN',
                created_at: '2024-01-30T09:00:00Z'
            },
            {
                id: 'Q018',
                topic: 'Enfermagem em Pneumologia',
                category: 'Assistência de Enfermagem',
                subcategory: 'Pneumologia',
                exam_type: 'OBJETIVA',
                institution: 'UBS',
                year: 2024,
                difficulty: 'MÉDIA',
                question: 'A DPOC (Doença Pulmonar Obstrutiva Crônica) engloba duas condições principais. Quais são elas e qual é a principal característica fisiopatológica comum?',
                options: {
                    A: 'Asma e bronquiectasia; hiper-responsividade brônquica',
                    B: 'Enfisema e bronquite crônica; obstrução do fluxo aéreo',
                    C: 'Bronquite crônica e pneumonia; consolidação alveolar',
                    D: 'Enfisema e pneumonia; destruição parenquimatosa',
                    E: 'Asma e enfisema; inflamação crônica das vias aéreas'
                },
                correct_answer: 'B',
                explanation: 'A DPOC compreende fundamentalmente a bronquite crônica e o enfisema pulmonar. A característica fisiopatológica comum é a obstrução crônica e irreversível do fluxo aéreo, geralmente associada a exposição prolongada a fumaça de cigarro ou outros poluentes.',
                tags: ['DPOC', 'Enfisema', 'Bronquite Crônica', 'Pneumologia'],
                points: 10,
                source: 'GOLD 2024',
                created_by: 'ADMIN',
                created_at: '2024-01-31T14:00:00Z'
            },
            {
                id: 'Q019',
                topic: 'Enfermagem em Hematologia',
                category: 'Assistência de Enfermagem',
                subcategory: 'Hematologia',
                exam_type: 'OBJETIVA',
                institution: 'Hospital',
                year: 2024,
                difficulty: 'DIFÍCIL',
                question: 'A anemia falciforme é uma hemoglobinopatia genética caracterizada pela presença de hemoglobina S. Qual é a principal manifestação clínica aguda que requer intervenção de emergência?',
                options: {
                    A: 'Crise aplástica',
                    B: 'Sequestro esplênico',
                    C: 'Crise vaso-oclusiva (drepânica)',
                    D: 'Crise hemolítica',
                    E: 'Sínrome torácica aguda'
                },
                correct_answer: 'C',
                explanation: 'A crise vaso-oclusiva ou drepânica é a manifestação mais comum e dolorosa da anemia falciforme, caracterizada pela obstrução microvascular por hemácias falciformes. Pode afetar qualquer órgão e requer analgesia adequada e hidratação.',
                tags: ['Anemia Falciforme', 'Crise Vaso-Oclusiva', 'Hemoglobinopatia', 'Hematologia'],
                points: 15,
                source: 'Ministerio da Saúde - Hemoglobinopatias',
                created_by: 'ADMIN',
                created_at: '2024-02-01T10:00:00Z'
            },
            {
                id: 'Q020',
                topic: 'Ética e Bioética',
                category: 'Legislação',
                subcategory: 'Ética e Bioética',
                exam_type: 'OBJETIVA',
                institution: 'Conselho Regional de Enfermagem',
                year: 2024,
                difficulty: 'DIFÍCIL',
                question: 'O Código de Ética dos Profissionais de Enfermagem estabelece direitos e deveres. Sobre o sigilo profissional, é CORRETO afirmar que:',
                options: {
                    A: 'O sigilo pode ser quebrado a qualquer momento mediante solicitação familiar',
                    B: 'O enfermeiro é obrigado a manter sigilo sobre informações do paciente, exceto quando houver risco de vida a terceiros',
                    C: 'O sigilo é absoluto e nunca pode ser quebrado, mesmo judicialmente',
                    D: 'O enfermeiro pode compartilhar informações com outros profissionais sem consentimento',
                    E: 'O sigilo não se aplica a informações sobre doenças infectocontagiosas'
                },
                correct_answer: 'B',
                explanation: 'O sigilo profissional é um dever do enfermeiro, porém possui exceções legais, como a comunicação a autoridades competentes em casos de doenças de notificação obrigatória e quando há risco de vida ou dano a terceiros (ex: intenção de suicídio ou homicídio).',
                tags: ['Ética', 'Sigilo Profissional', 'Bioética', 'Código de Ética'],
                points: 15,
                source: 'Resolução COFEN 564/2017',
                created_by: 'ADMIN',
                created_at: '2024-02-02T08:00:00Z'
            }
        ];

        return await DatabaseService.importData('questions', questions);
    },

    /**
     * Popula concursos públicos (conteúdo do Administrador)
     */
    async populatePublicContests() {
        const publicContests = [
            {
                id: 'PC001',
                name: 'Prefeitura Municipal - Enfermeiro',
                institution: 'Prefeitura',
                state: 'SP',
                city: 'São Paulo',
                exam_date: '2024-03-15',
                status: 'INSCRIÇÕES ABERTAS',
                vagas: '50',
                formação: 'Superior Completo em Enfermagem + COREN ativo',
                salary: 'R$ 6.500,00',
                source: 'Edital 001/2024',
                inscription_url: 'https://www.vunesp.com.br',
                created_at: '2024-01-01T10:00:00Z'
            },
            {
                id: 'PC002',
                name: 'Hospital das Clínicas - Técnico de Enfermagem',
                institution: 'HC-FMUSP',
                state: 'SP',
                city: 'São Paulo',
                exam_date: '2024-04-20',
                status: 'EM BREVE',
                vagas: '200',
                formação: 'Técnico em Enfermagem + COREN ativo',
                salary: 'R$ 3.200,00',
                source: 'Concurso Público 002/2024',
                inscription_url: 'https://www.concursosfcc.com.br',
                created_at: '2024-01-05T10:00:00Z'
            },
            {
                id: 'PC003',
                name: 'Secretaria de Estado da Saúde - Enfermeiro',
                institution: 'SES',
                state: 'RJ',
                city: 'Rio de Janeiro',
                exam_date: '2024-05-10',
                status: 'INSCRIÇÕES ABERTAS',
                vagas: '100',
                formação: 'Superior Completo em Enfermagem + COREN ativo',
                salary: 'R$ 7.800,00',
                source: 'Edital SES-2024',
                inscription_url: 'https://www.cesgranrio.org.br',
                created_at: '2024-01-10T10:00:00Z'
            },
            {
                id: 'PC004',
                name: 'Universidade Federal - Enfermeiro do Trabalho',
                institution: 'HU-UFG',
                state: 'GO',
                city: 'Goiânia',
                exam_date: '2024-06-05',
                status: 'EM BREVE',
                vagas: '5',
                formação: 'Superior em Enfermagem + Especialização em Enfermagem do Trabalho',
                salary: 'R$ 9.500,00',
                source: 'Concurso Público 003/2024',
                inscription_url: 'https://www.ufg.br/concursos',
                created_at: '2024-01-15T10:00:00Z'
            },
            {
                id: 'PC005',
                name: 'Prefeitura Municipal - Técnico de Enfermagem',
                institution: 'Prefeitura',
                state: 'MG',
                city: 'Belo Horizonte',
                exam_date: '2024-03-30',
                status: 'INSCRIÇÕES ABERTAS',
                vagas: '150',
                formação: 'Técnico em Enfermagem + COREN ativo',
                salary: 'R$ 2.800,00',
                source: 'Edital 015/2024',
                inscription_url: 'https://www.ibfc.org.br',
                created_at: '2024-01-20T10:00:00Z'
            },
            {
                id: 'PC006',
                name: 'Rede Sarah de Hospitais - Enfermeiro',
                institution: 'Associação das Pioneiras Sociais',
                state: 'DF',
                city: 'Brasília',
                exam_date: '2024-07-15',
                status: 'AGUARDANDO PUBLICAÇÃO',
                vagas: '30',
                formação: 'Superior Completo em Enfermagem + COREN ativo',
                salary: 'R$ 8.200,00',
                source: 'Processo Seletivo 2024',
                inscription_url: 'https://www.hospitalsarah.com.br',
                created_at: '2024-01-25T10:00:00Z'
            },
            {
                id: 'PC007',
                name: 'Prefeitura Municipal - Enfermeiro PSF',
                institution: 'Prefeitura',
                state: 'RS',
                city: 'Porto Alegre',
                exam_date: '2024-08-20',
                status: 'EM BREVE',
                vagas: '80',
                formação: 'Superior Completo em Enfermagem + COREN ativo',
                salary: 'R$ 7.000,00',
                source: 'Edital 2024',
                inscription_url: 'https://www.fundacaoprofisionato.org.br',
                created_at: '2024-02-01T10:00:00Z'
            },
            {
                id: 'PC008',
                name: 'Força Aérea Brasileira - Oficial de Saúde',
                institution: 'FAB',
                state: 'DF',
                city: 'Brasília',
                exam_date: '2024-09-10',
                status: 'AGUARDANDO PUBLICAÇÃO',
                vagas: '20',
                formação: 'Superior Completo em Enfermagem + COREN ativo',
                salary: 'R$ 12.000,00',
                source: 'EA OE 2024',
                inscription_url: 'https://www.fab.mil.br/concursos',
                created_at: '2024-02-05T10:00:00Z'
            }
        ];

        return await DatabaseService.importData('public_contests', publicContests);
    },

    /**
     * Popula quizzes e provas (conteúdo do Administrador)
     */
    async populateQuizzes() {
        const quizzes = [
            {
                id: 'QUIZ001',
                title: 'Simulado Enem',
                category: 'Concursos',
                type: 'MOCK',
                exam_type: 'ENEM',
                institution: 'INEP',
                year: 2023,
                question_count: 10,
                time_limit: 120,
                passing_score: 60,
                topics: ['Saúde', 'Biologia', 'Ciências'],
                created_by: 'ADMIN',
                created_at: '2024-01-01T10:00:00Z'
            },
            {
                id: 'QUIZ002',
                title: 'Prova de Títulos - concurso Enfermeiro',
                category: 'Concursos',
                type: 'EXAM',
                exam_type: 'CONCURSO PÚBLICO',
                institution: 'Diversos',
                year: 2024,
                question_count: 40,
                time_limit: 240,
                passing_score: 50,
                topics: ['Legislação', 'Saúde Pública', 'Clínica Médica'],
                created_by: 'ADMIN',
                created_at: '2024-01-05T10:00:00Z'
            },
            {
                id: 'QUIZ003',
                title: 'Quiz - Técnicas de Enfermagem',
                category: 'Treinamento',
                type: 'TRAINING',
                exam_type: 'FORMACAO',
                institution: 'Instituição',
                year: 2024,
                question_count: 20,
                time_limit: null,
                passing_score: 70,
                topics: ['Técnicas Fundamentais', 'Administração de Medicamentos', 'Curativos'],
                created_by: 'ADMIN',
                created_at: '2024-01-10T10:00:00Z'
            },
            {
                id: 'QUIZ004',
                title: 'Revisão - Saúde da Mulher',
                category: 'Revisão',
                type: 'REVIEW',
                exam_type: 'CONCURSO PÚBLICO',
                institution: 'Diversos',
                year: 2024,
                question_count: 15,
                time_limit: 30,
                passing_score: 60,
                topics: ['Obstetrícia', 'Ginecologia', 'Pré-natal'],
                created_by: 'ADMIN',
                created_at: '2024-01-15T10:00:00Z'
            },
            {
                id: 'QUIZ005',
                title: 'Rotina em UTI',
                category: 'Especialização',
                type: 'TRAINING',
                exam_type: 'FORMACAO',
                institution: 'Hospital',
                year: 2024,
                question_count: 25,
                time_limit: null,
                passing_score: 70,
                topics: ['Ventilação Mecânica', 'Sepsis', 'Cuidados Críticos'],
                created_by: 'ADMIN',
                created_at: '2024-01-20T10:00:00Z'
            },
            {
                id: 'QUIZ006',
                title: 'Conhecimentos Específicos - enfermagem',
                category: 'Concursos',
                type: 'EXAM',
                exam_type: 'CONCURSO PÚBLICO',
                institution: 'IBFC',
                year: 2023,
                question_count: 30,
                time_limit: 180,
                passing_score: 50,
                topics: ['Enfermagem', 'Saúde Pública', 'Legislação'],
                created_by: 'ADMIN',
                created_at: '2024-01-25T10:00:00Z'
            },
            {
                id: 'QUIZ007',
                title: 'Boas Práticas em enfermagem',
                category: 'Qualidade',
                type: 'TRAINING',
                exam_type: 'FORMACAO',
                institution: 'Instituição',
                year: 2024,
                question_count: 10,
                time_limit: null,
                passing_score: 80,
                topics: ['Higienização', 'Segurança do Paciente', 'CCI'],
                created_by: 'ADMIN',
                created_at: '2024-02-01T10:00:00Z'
            },
            {
                id: 'QUIZ008',
                title: 'Emergências Cardiovasculares',
                category: 'Emergência',
                type: 'EXAM',
                exam_type: 'CONCURSO PÚBLICO',
                institution: 'Diversos',
                year: 2024,
                question_count: 20,
                time_limit: 60,
                passing_score: 60,
                topics: ['PCR', 'IAM', 'ICC', 'Arritmias'],
                created_by: 'ADMIN',
                created_at: '2024-02-05T10:00:00Z'
            }
        ];

        return await DatabaseService.importData('quizzes', quizzes);
    },

    /**
     * Popula decks de flashcards (conteúdo do Administrador)
     */
    async populateFlashcardDecks() {
        // Criar decks
        const decks = [
            {
                id: 'DECK001',
                user_email: 'ADMIN',  // Marcação de conteúdo admin
                title: 'Anatomia Cardiovascular',
                description: 'Principais estruturas anatômicas do sistema cardiovascular',
                category: 'Anatomia',
                card_count: 25,
                is_public: true,
                created_by: 'ADMIN',
                created_at: '2024-01-01T10:00:00Z'
            },
            {
                id: 'DECK002',
                user_email: 'ADMIN',
                title: 'Fármacos Cardiovasculares',
                description: 'Medicamentos mais utilizados em cardiologia e seus mecanismos de ação',
                category: 'Farmacologia',
                card_count: 30,
                is_public: true,
                created_by: 'ADMIN',
                created_at: '2024-01-05T10:00:00Z'
            },
            {
                id: 'DECK003',
                user_email: 'ADMIN',
                title: 'Legislação do SUS',
                description: 'Principais leis e diretrizes do Sistema Único de Saúde',
                category: 'Legislação',
                card_count: 40,
                is_public: true,
                created_by: 'ADMIN',
                created_at: '2024-01-10T10:00:00Z'
            },
            {
                id: 'DECK004',
                user_email: 'ADMIN',
                title: 'Classificação de Intoxicações',
                description: 'Principais substâncias e sinais clínicos de intoxicação',
                category: 'Toxicologia',
                card_count: 20,
                is_public: true,
                created_by: 'ADMIN',
                created_at: '2024-01-15T10:00:00Z'
            },
            {
                id: 'DECK005',
                user_email: 'ADMIN',
                title: 'Sinais Vitais - Valores de Referência',
                description: 'Valores normais e alterados dos sinais vitais por faixa etária',
                category: 'Semiologia',
                card_count: 15,
                is_public: true,
                created_by: 'ADMIN',
                created_at: '2024-01-20T10:00:00Z'
            }
        ];

        await DatabaseService.importData('flashcard_decks', decks);

        // Criar flashcards para cada deck
        const flashcards = [
            // Deck 001 - Anatomia Cardiovascular
            { id: 'FC001', deck_id: 'DECK001', user_email: 'ADMIN', front: 'Qual é a camada mais interna do coração?', back: 'Endocárdio - é uma camada de células endoteliais que reveste internamente o coração e as válvulas.', topic: 'Anatomia', mastery_level: 0, review_count: 0, created_at: '2024-01-01T10:00:00Z' },
            { id: 'FC002', deck_id: 'DECK001', user_email: 'ADMIN', front: 'O que é o nó sinoatrial?', back: 'É o marca-passo natural do coração, localizado no átrio direito, responsável por iniciar os impulsos elétricos que causam as contrações cardíacas.', topic: 'Anatomia', mastery_level: 0, review_count: 0, created_at: '2024-01-01T10:00:00Z' },
            { id: 'FC003', deck_id: 'DECK001', user_email: 'ADMIN', front: 'Qual é a função da válvula mitral?', back: 'Permitir o fluxo sanguíneo do átrio esquerdo para o ventrículo esquerdo e impedir o refluxo durante a sístole ventricular.', topic: 'Anatomia', mastery_level: 0, review_count: 0, created_at: '2024-01-01T10:00:00Z' },
            { id: 'FC004', deck_id: 'DECK001', user_email: 'ADMIN', front: 'Qual artéria é responsável por irrigar a parede anterior do ventrículo esquerdo?', back: 'Artéria coronária descendente anterior esquerda (DAE).', topic: 'Anatomia', mastery_level: 0, review_count: 0, created_at: '2024-01-01T10:00:00Z' },
            { id: 'FC005', deck_id: 'DECK001', user_email: 'ADMIN', front: 'O que é o pericárdio?', back: 'É a membrana dupla que envolve o coração, composta por pericárdio fibroso (externo) e seroso (interno), responsável pela proteção e fixação do coração.', topic: 'Anatomia', mastery_level: 0, review_count: 0, created_at: '2024-01-01T10:00:00Z' },

            // Deck 002 - Fármacos Cardiovasculares
            { id: 'FC006', deck_id: 'DECK002', user_email: 'ADMIN', front: 'Qual é o mecanismo de ação da aspirina em baixas doses?', back: 'Inibição irreversível da ciclooxigenase-1 (COX-1) plaquetária, reduzindo a síntese de tromboxano A2 e prevenindo a agregação plaquetária.', topic: 'Farmacologia', mastery_level: 0, review_count: 0, created_at: '2024-01-05T10:00:00Z' },
            { id: 'FC007', deck_id: 'DECK002', user_email: 'ADMIN', front: 'Qual é a classe de diuréticos mais utilizada no tratamento da insuficiência cardíaca?', back: 'Diuréticos de alça (ex: furosemida) - inibem a reabsorção de Na+ e Cl- na alça de Henle, promovendo intensa diurese.', topic: 'Farmacologia', mastery_level: 0, review_count: 0, created_at: '2024-01-05T10:00:00Z' },
            { id: 'FC008', deck_id: 'DECK002', user_email: 'ADMIN', front: 'Qual é o principal efeito adverso a ser monitorado com o uso de digoxina?', back: 'Toxicidade digitálica, manifestada por arritmias, bradicardia, náuseas, vômitos e alterações visuais (halos amarelos/vermelhos).', topic: 'Farmacologia', mastery_level: 0, review_count: 0, created_at: '2024-01-05T10:00:00Z' },
            { id: 'FC009', deck_id: 'DECK002', user_email: 'ADMIN', front: 'Qual é o mecanismo de ação dos inibidores da ECA?', back: 'Bloqueio da conversão de angiotensina I em angiotensina II, promovendo vasodilatação e redução da pós-carga.', topic: 'Farmacologia', mastery_level: 0, review_count: 0, created_at: '2024-01-05T10:00:00Z' },
            { id: 'FC010', deck_id: 'DECK002', user_email: 'ADMIN', front: 'Qual é o objetivo principal dos betabloqueadores na insuficiência cardíaca?', back: 'Redução da frequência cardíaca e da contratilidade miocárdica, diminuindo o consumo de oxigênio e melhorando a função ventricular a longo prazo.', topic: 'Farmacologia', mastery_level: 0, review_count: 0, created_at: '2024-01-05T10:00:00Z' },

            // Deck 003 - Legislação do SUS
            { id: 'FC011', deck_id: 'DECK003', user_email: 'ADMIN', front: 'Qual é a Lei Orgânica que regulamenta o SUS?', back: 'Lei nº 8.080/90 (Lei Orgânica da Saúde) e Lei nº 8.142/90 (Participação da Comunidade).', topic: 'Legislação', mastery_level: 0, review_count: 0, created_at: '2024-01-10T10:00:00Z' },
            { id: 'FC012', deck_id: 'DECK003', user_email: 'ADMIN', front: 'Quais são os princípios doutrinários do SUS?', back: 'Universalidade, Integralidade e Equidade.', topic: 'Legislação', mastery_level: 0, review_count: 0, created_at: '2024-01-10T10:00:00Z' },
            { id: 'FC013', deck_id: 'DECK003', user_email: 'ADMIN', front: 'O que é a Carta dos Direitos dos Usuários da Saúde?', back: 'Documento que estabelece os direitos fundamentais dos cidadãos na rede de atenção à saúde, garantindo acesso, informação e tratamento digno.', topic: 'Legislação', mastery_level: 0, review_count: 0, created_at: '2024-01-10T10:00:00Z' },
            { id: 'FC014', deck_id: 'DECK003', user_email: 'ADMIN', front: 'O que são as CIS (Comunidades Interfederativas de Saúde)?', back: 'Consórcios públicos de saúde constituídos por entes federados para organizar a rede regional de atenção à saúde.', topic: 'Legislação', mastery_level: 0, review_count: 0, created_at: '2024-01-10T10:00:00Z' },
            { id: 'FC015', deck_id: 'DECK003', user_email: 'ADMIN', front: 'Qual é a competência da ANS (Agência Nacional de Saúde Suplementar)?', back: 'Regular e fiscalizar o setor de saúde suplementar, protegendo o consumidor e promovendo a competitividade.', topic: 'Legislação', mastery_level: 0, review_count: 0, created_at: '2024-01-10T10:00:00Z' },

            // Deck 004 - Classificação de Intoxicações
            { id: 'FC016', deck_id: 'DECK004', user_email: 'ADMIN', front: 'Qual é o antídoto específico para intoxicacao por benzodiazepínicos?', back: 'Flumazenil - antagonista competitivo dos receptores GABA.', topic: 'Toxicologia', mastery_level: 0, review_count: 0, created_at: '2024-01-15T10:00:00Z' },
            { id: 'FC017', deck_id: 'DECK004', user_email: 'ADMIN', front: 'Qual é o antídoto para intoxicacao por organofosforados?', back: 'Atropina (para muscarínicos) e Oxima - pralidoxima (para reativar colinesterase).', topic: 'Toxicologia', mastery_level: 0, review_count: 0, created_at: '2024-01-15T10:00:00Z' },
            { id: 'FC018', deck_id: 'DECK004', user_email: 'ADMIN', front: 'Cite três sinais de intoxicacao por organofosforados.', back: 'SLUDGE: Salivação, Lacrimejamento, Urinação, Defecação, Gastrointestinal, Emese. Também miose e bradicardia.', topic: 'Toxicologia', mastery_level: 0, review_count: 0, created_at: '2024-01-15T10:00:00Z' },
            { id: 'FC019', deck_id: 'DECK004', user_email: 'ADMIN', front: 'Qual é o antídoto para intoxicacao por metanol ou etilenoglicol?', back: 'Fomepizol ou Etanol - inibem a álcool desidrogenase, impedindo a formação de metabólitos tóxicos.', topic: 'Toxicologia', mastery_level: 0, review_count: 0, created_at: '2024-01-15T10:00:00Z' },
            { id: 'FC020', deck_id: 'DECK004', user_email: 'ADMIN', front: 'Qual é a conduta inicial em qualquer intoxicacao aguda?', back: 'ABCDE, avaliar via aérea, ventilação e circulação; descontaminação conforme via de exposição; avaliar nível de consciência; coletar informações sobre o tóxico.', topic: 'Toxicologia', mastery_level: 0, review_count: 0, created_at: '2024-01-15T10:00:00Z' },

            // Deck 005 - Sinais Vitais
            { id: 'FC021', deck_id: 'DECK005', user_email: 'ADMIN', front: 'Qual é a frequência cardíaca normal em adulto?', back: '60 a 100 batimentos por minuto em repouso.', topic: 'Semiologia', mastery_level: 0, review_count: 0, created_at: '2024-01-20T10:00:00Z' },
            { id: 'FC022', deck_id: 'DECK005', user_email: 'ADMIN', front: 'Qual é a frequência respiratória normal em adulto?', back: '12 a 20 respirações por minuto.', topic: 'Semiologia', mastery_level: 0, review_count: 0, created_at: '2024-01-20T10:00:00Z' },
            { id: 'FC023', deck_id: 'DECK005', user_email: 'ADMIN', front: 'Qual é a pressão arterial sistêmica normal em adulto?', back: 'Sistólica menor que 120 mmHg e diastólica menor que 80 mmHg (ideal).', topic: 'Semiologia', mastery_level: 0, review_count: 0, created_at: '2024-01-20T10:00:00Z' },
            { id: 'FC024', deck_id: 'DECK005', user_email: 'ADMIN', front: 'Qual é a temperatura corporal normal?', back: '36,5°C a 37,5°C (axilar).', topic: 'Semiologia', mastery_level: 0, review_count: 0, created_at: '2024-01-20T10:00:00Z' },
            { id: 'FC025', deck_id: 'DECK005', user_email: 'ADMIN', front: 'Qual é a saturação periférica de oxigênio normal?', back: '95% a 100% em indivíduo saudável ao nível do mar.', topic: 'Semiologia', mastery_level: 0, review_count: 0, created_at: '2024-01-20T10:00:00Z' }
        ];

        return await DatabaseService.importData('flashcards', flashcards);
    },

    /**
     * Popula recursos da biblioteca (conteúdo do Administrador)
     */
    async populateLibraryResources() {
        const resources = [
            {
                id: 'LIBR001',
                title: 'Manual de Rotinas de Enfermagem em Adultos',
                category: 'Protocolos',
                type: 'PDF',
                description: 'Manual completo com rotinas e procedimentos de enfermagem em clínica médica',
                author: 'Associação Brasileira de Enfermagem',
                year: 2023,
                tags: ['Protocolos', 'Clínica Médica', 'Rotinas'],
                url: '#',
                created_at: '2024-01-01T10:00:00Z'
            },
            {
                id: 'LIBR002',
                title: 'Código de Ética dos Profissionais de Enfermagem',
                category: 'Legislação',
                type: 'PDF',
                description: 'Resolução COFEN 564/2017 - Texto atualizado com comentários',
                author: 'COFEN',
                year: 2022,
                tags: ['Ética', 'Legislação', 'Cofen'],
                url: '#',
                created_at: '2024-01-05T10:00:00Z'
            },
            {
                id: 'LIBR003',
                title: 'Guia de Bolso de Drugs - Edição 2024',
                category: 'Farmacologia',
                type: 'EBOOK',
                description: 'Guia prático de medicamentos com dosages, vias e efeitos adversos',
                author: 'Grupo Master',
                year: 2024,
                tags: ['Farmacologia', 'Medicamentos', 'Dosagem'],
                url: '#',
                created_at: '2024-01-10T10:00:00Z'
            },
            {
                id: 'LIBR004',
                title: 'Anatomia Humana - Atlas Interativo',
                category: 'Anatomia',
                type: 'APLICATIVO',
                description: 'Atlas anatômico completo com visualização 3D e informações detalhadas',
                author: 'Visible Body',
                year: 2024,
                tags: ['Anatomia', 'Atlas', '3D'],
                url: '#',
                created_at: '2024-01-15T10:00:00Z'
            },
            {
                id: 'LIBR005',
                title: 'Fundamentos de Enfermagem - Brunnstrom',
                category: 'Técnicas',
                type: 'PDF',
                description: 'Obra clássica com fundamentos e técnicas de enfermagem',
                author: 'Sharon L. Brunnstrom',
                year: 2021,
                tags: ['Técnicas', 'Fundamentos', 'Clássico'],
                url: '#',
                created_at: '2024-01-20T10:00:00Z'
            },
            {
                id: 'LIBR006',
                title: 'Protocolos de Higienização das Mãos - OMS',
                category: 'Segurança',
                type: 'PDF',
                description: 'Diretrizes da OMS para higienização das mãos em serviços de saúde',
                author: 'OMS',
                year: 2023,
                tags: ['Higienização', 'Segurança do Paciente', 'OMS'],
                url: '#',
                created_at: '2024-01-25T10:00:00Z'
            },
            {
                id: 'LIBR007',
                title: 'Legislação do SUS - Cartilha Popular',
                category: 'Legislação',
                type: 'PDF',
                description: 'Explicação acessível dos princípios e diretrizes do SUS',
                author: 'Ministério da Saúde',
                year: 2023,
                tags: ['SUS', 'Legislação', 'Educação Popular'],
                url: '#',
                created_at: '2024-02-01T10:00:00Z'
            },
            {
                id: 'LIBR008',
                title: 'Exame Físico Sistemático',
                category: 'Semiologia',
                type: 'VIDEO',
                description: 'Série de vídeos demonstrando técnicas de exame físico sistemático',
                author: 'Universidade de São Paulo',
                year: 2022,
                tags: ['Semiologia', 'Exame Físico', 'Vídeo'],
                url: '#',
                created_at: '2024-02-05T10:00:00Z'
            },
            {
                id: 'LIBR009',
                title: 'Calculadora de Doses Pediátricas',
                category: 'Ferramentas',
                type: 'APLICATIVO',
                description: 'Aplicativo para cálculo seguro de doses pediátricas',
                author: 'SafeDose',
                year: 2024,
                tags: ['Pediatria', 'Cálculo de Doses', 'Segurança'],
                url: '#',
                created_at: '2024-02-10T10:00:00Z'
            },
            {
                id: 'LIBR010',
                title: 'Doenças de Notificação Compulsória',
                category: 'Saúde Pública',
                type: 'PDF',
                description: 'Lista completa das doenças de notificação compulsória e suas características',
                author: 'Ministério da Saúde',
                year: 2023,
                tags: ['Notificação', 'Doenças Transmissíveis', 'Vigilância'],
                url: '#',
                created_at: '2024-02-15T10:00:00Z'
            }
        ];

        return await DatabaseService.importData('library_resources', resources);
    },

    /**
     * Limpa todos os dados e repopula (para testes)
     */
    async resetAndRepopulate() {
        await DatabaseService.clearAll();
        return await this.populateAll();
    }
};

// Exportar para uso global
window.SeedData = SeedData;
