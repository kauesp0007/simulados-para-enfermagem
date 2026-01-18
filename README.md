# 🏥 Enfermagem Concurseira

> Portal Integrado de Estudos para Concursos de Enfermagem

O **Enfermagem Concurseira** é uma aplicação web SPA (Single Page Application) desenvolvida para auxiliar estudantes e profissionais de enfermagem na preparação para concursos públicos. A plataforma oferece um ambiente completo de estudos com questões comentadas, mapas mentais, simulados cronometrados e ferramentas de produtividade, tudo em uma interface moderna, acessível e responsiva.

---

## ✨ Funcionalidades Principais

O sistema é composto por dez módulos integrados que cobrem todas as necessidades de estudo para concursos da área de enfermagem.

### 1. Banco de Questões
O módulo de questões permite aos usuários acessar um banco extenso de perguntas de concursos anteriores, filtradas por área temática, banca organizadora e nível de dificuldade. Cada questão apresenta explicação detalhada e referência bibliográfica, facilitando o entendimento do conteúdo cobrado nas provas.

### 2. Simulados e Quizzes
O sistema de simulados oferece a experiência real de prova com cronômetro. Os usuários podem criar simulados personalizados escolhendo o número de questões e o tempo disponível para cada pergunta. Ao final, é gerado um relatório detalhado com análise de desempenho por tema.

### 3. Gestão de Concursos
Este módulo mantém um calendário atualizado de editais e datas de provas de concursos de enfermagem em todo o Brasil. Os usuários podem favoritar concursos, acompanhar contagens regressivas e receber lembretes sobre prazos importantes.

### 4. Biblioteca e Mapas Mentais
A biblioteca contém materiais de estudo como resumos, infográficos e mapas mentais que organizam visualmente conteúdos complexos. Os mapas mentais abordam temas como SUS, Ética Profissional, Farmacologia e urgência e emergência.

### 5. Timer Pomodoro
A ferramenta Pomodoro integrada ajuda na gestão do tempo de estudo com sessões de foco de 25 minutos seguidas de pausas curtas. O sistema registra o tempo total de estudo e mantém um histórico diário para acompanhamento da evolução.

### 6. Sistema de Performance
O dashboard de desempenho apresenta estatísticas completas dos estudos, incluindo taxa de acerto geral, evolução por tema, sequência de dias estudando e conquistas desbloqueadas. Gráficos interativos permitem visualizar o progresso ao longo do tempo.

### 7. Flashcards
O sistema de flashcards utiliza técnicas de repetição espaçada para fixação de conteúdo. Os usuários podem criar seus próprios cartões de estudo ou utilizar decks pré-definidos pelo Administrador.

### 8. Gerenciamento de Dados
A seção de dados permite sincronização de conteúdo via GitHub, importação e exportação de arquivos JSON, visualização de estatísticas do banco de dados e limpeza de dados locais.

### 9. Configurações
O módulo de configurações permite personalizar a experiência de uso, incluindo alternância entre tema claro e escuro, ajustes de tamanho de fonte, configuração de notificações e preferências de estudo.

### 10. Painel Admin
A área administrativa oferece recursos para gerenciamento do conteúdo da plataforma, incluindo cadastro de novas questões, atualização de editais e gerenciamento de usuários.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias web modernas com foco em performance, acessibilidade e manutenção simplificada.

### Frontend
A interface é desenvolvida em **HTML5 semântico**, garantindo estrutura adequada para leitores de tela e indexação por mecanismos de busca. Os estilos utilizam **CSS3 com Custom Properties** para gerenciamento eficiente de temas e cores, além de Flexbox e Grid Layout para layouts responsivos que se adaptam a diferentes tamanhos de tela.

### Backend Local
A lógica da aplicação é implementada em **JavaScript ES6+ Vanilla**, sem dependência de frameworks pesados, o que resulta em carregamento rápido e experiência fluida para o usuário. A arquitetura SPA é gerenciada pelo arquivo principal `app.js`, que controla a renderização dinâmica das páginas e a navegação entre os módulos.

### Comunicação e Eventos
Para comunicação entre componentes, o projeto utiliza o padrão **Pub/Sub (Event Bus)** através do módulo `event-bus.js`, permitindo baixo acoplamento entre as partes da aplicação.

### Armazenamento
O armazenamento de dados local é feito com **Dexie.js**, um wrapper amigável do IndexedDB que permite persistir dados do usuário no navegador, incluindo questões favoritadas, histórico de simulados, progresso de estudos e preferências, funcionando mesmo sem conexão com a internet.

---

## 📂 Estrutura do Projeto

A organização de pastas segue uma arquitetura modular que separa responsabilidades e facilita a manutenção e a escalabilidade do código.

```
enfermagem-concurseira/
│
├── index.html                    # Ponto de entrada da aplicação (SPA Shell)
│
├── assets/
│   ├── css/
│   │   ├── variables.css         # Tokens de design e variáveis globais (cores, fontes)
│   │   ├── main.css              # Estilos de reset e configurações base
│   │   ├── components.css        # Estilos de botões, cards, formulários e modais
│   │   ├── pages.css             # Estilos específicos de cada página/recurso
│   │   ├── header.css            # Estilos do cabeçalho e navegação principal
│   │   ├── footer.css            # Estilos do rodapé
│   │   ├── accessibility.css     # Configurações de alto contraste e acessibilidade
│   │   └── responsive.css        # Media queries e ajustes para dispositivos móveis
│   │
│   ├── js/                       # Scripts de interface e núcleo da aplicação
│   │   ├── event-bus.js          # Sistema de eventos Pub/Sub para comunicação entre módulos
│   │   ├── header.js             # Lógica do cabeçalho e navegação
│   │   ├── accessibility.js      # Controles de acessibilidade e atalhos de teclado
│   │   └── app-orchestrator.js   # Orquestrador principal da aplicação SPA
│   │
│   ├── components/               # Componentes HTML modulares
│   │   ├── header.html           # Template do cabeçalho
│   │   ├── footer.html           # Template do rodapé
│   │   └── accessibility.html    # Template de configurações de acessibilidade
│   │
│   └── app/                      # Código da aplicação principal
│       ├── services/
│       │   ├── db.js             # Camada de dados (IndexedDB via Dexie.js)
│       │   ├── auth.js           # Controle de autenticação e sessão do usuário
│       │   ├── content-sync.js   # Sincronização de conteúdo via GitHub
│       │   ├── seed-data.js      # Script de população de dados iniciais
│       │   ├── api.js            # Comunicação com APIs externas
│       │   └── sm2.js            # Algoritmo de repetição espaçada
│       │
│       ├── utils/
│       │   ├── helpers.js        # Funções utilitárias e formatação de dados
│       │   └── Helpers.js        # Classe auxiliar de utilitários
│       │
│       ├── components/
│       │   ├── Modal.js          # Componente de janelas modais
│       │   ├── Toast.js          # Sistema de notificações toast
│       │   ├── DataApp.js        # Gerenciamento de dados e sincronização
│       │   ├── Sidebar.js        # Componente de barra lateral
│       │   ├── ContestDialog.js  # Diálogo de detalhes do concurso
│       │   └── ContestDetails.js # Visualização de detalhes do concurso
│       │
│       ├── pages/
│       │   ├── app.js            # Controlador principal da aplicação (Router)
│       │   ├── BasePage.js       # Classe base para páginas
│       │   ├── Dashboard.js      # Página inicial/dashboard
│       │   ├── MyQuestions.js    # Banco de questões do usuário
│       │   ├── Quiz.js           # Sistema de simulados e quizzes
│       │   ├── PublicContests.js # Concursos públicos
│       │   ├── MyContests.js     # Concursos do usuário
│       │   ├── Library.js        # Biblioteca e mapas mentais
│       │   ├── Pomodoro.js       # Timer Pomodoro
│       │   ├── Settings.js       # Configurações do usuário
│       │   ├── AdminPanel.js     # Painel administrativo
│       │   └── Performance.js    # Estatísticas de desempenho
│       │
│       └── data/                 # Arquivos de dados para sincronização via GitHub
│           ├── metadata.json     # Metadados e versão do conteúdo
│           ├── questions.json    # Banco de questões do administrador
│           ├── contests.json     # Concursos públicos disponíveis
│           ├── quizzes.json      # Provas e simulados
│           ├── flashcards.json   # Decks de flashcards
│           └── library.json      # Recursos da biblioteca
```

### Descrição dos Arquivos Principais

O arquivo `index.html` funciona como o shell da aplicação SPA, contendo a estrutura base com header, main-wrapper para conteúdo dinâmico e footer. Todos os templates de páginas são declarados como elementos `<template>` e renderizados conforme a navegação do usuário.

O arquivo `assets/css/variables.css` define as cores principais do projeto, incluindo a paleta institucional (#1A3E74 para tons de azul e #f59e0b para acentos dourados), variáveis de tipografia e espaçamentos que garantem consistência visual em toda a aplicação.

O arquivo `assets/app/app.js` é o coração da aplicação, responsável por inicializar os serviços, configurar as rotas, gerenciar o estado global e coordenar a comunicação entre os diferentes módulos. Ele também controla a inicialização do banco de dados e o carregamento do tema salvo nas preferências do usuário.

O arquivo `assets/app/services/db.js` configura o banco de dados IndexedDB através do Dexie.js, definindo todas as tabelas necessárias para armazenamento de questões, quizzes, flashcards, concursos, sessões Pomodoro, estatísticas e preferências do usuário.

O arquivo `assets/app/services/content-sync.js` implementa o sistema de sincronização de conteúdo via GitHub, permitindo que o Administrador distribua atualizações de questões, concursos e outros conteúdos através do repositório GitHub.

---

## 🧩 Arquitetura Modular

A aplicação **Enfermagem Concurseira** utiliza uma arquitetura modular que separa a estrutura de interface em componentes HTML independentes, carregados dinamicamente pelo orquestrador da aplicação. Este padrão de desenvolvimento permite manutenção simplificada, reutilização de código e atualizações isoladas de cada seção da interface.

### Componentes HTML

O sistema de modularização utiliza elementos `<template>` declarados no arquivo `index.html`, que funcionam como blueprints para os diferentes blocos de interface da aplicação. Cada componente é carregado sob demanda conforme a navegação do usuário, otimizando o desempenho e o consumo de recursos do navegador.

O componente de **Header** é implementado através do arquivo `header.html` e inclui a barra de navegação principal com links para todas as páginas da aplicação, logo e identificação visual, menu responsivo para dispositivos móveis e indicadores de estado como conexão e sincronização. Este componente é renderizado dinamicamente e seus eventos de clique são interceptados pelo `header.js` para controlar a navegação sem recarregamento da página.

O componente de **Footer** é implementado através do arquivo `footer.html` e contém informações institucionais, links para políticas e termos de uso, indicadores de versão da aplicação e informações de direitos autorais. Assim como o Header, o Footer é injetado automaticamente em todas as páginas mantendo consistência visual em toda a navegação.

O componente de **Sidebar** é responsável pela barra lateral de navegação que oferece acesso rápido aos principais módulos da aplicação. Este componente pode ser colapsado para maximizar a área de conteúdo principal e é especialmente útil em dispositivos desktop onde o espaço horizontal permite sua exibição permanente ao lado do conteúdo.

### Orquestrador da Aplicação

O arquivo `js/app-orchestrator.js` atua como o núcleo central da arquitetura modular, coordenando a carga e integração de todos os componentes da interface. Este módulo implementa o padrão de orquestração que permite que diferentes partes da aplicação trabalhem de forma coordenada sem dependências diretas entre si.

O orquestrador é responsável por inicializar os serviços essenciais da aplicação, incluindo a configuração do banco de dados Dexie.js, o sistema de eventos Event Bus e os serviços de sincronização de conteúdo. Após a inicialização dos serviços, o orquestrador coordena o carregamento dos componentes de interface, injetando os templates HTML no DOM e inicializando os listeners de eventos necessários para cada seção.

O padrão de orquestração implementado segue os princípios de inversão de controle, onde o fluxo de execução é determinado pelo estado da aplicação e pelas interações do usuário, não por chamadas diretas entre módulos. Isso resulta em um código mais testável, onde cada componente pode ser desenvolvido e testado de forma isolada, e mais mantenível, onde alterações em um componente não afetam diretamente o funcionamento de outros.

### Sistema de Carregamento Dinâmico

O carregamento dos componentes segue um padrão assíncrono que evita o bloqueio da interface durante a inicialização. O orquestrador identifica quais componentes precisam ser carregados baseados na rota atual e na configuração do usuário, carregando apenas os recursos necessários para a visualização imediata.

Este sistema de carregamento dinâmico oferece benefícios significativos para a experiência do usuário, incluindo tempo de carregamento inicial reduzido, menor consumo de memória por carregar componentes sob demanda, carregamento paralelo de recursos não bloqueantes e atualizações incrementais sem necessidade de recarregamento completo.

A injeção de componentes no DOM é realizada através de métodos que garantem a integridade da estrutura HTML e a aplicação correta de estilos CSS. Cada componente mantém seu próprio escopo de estilos e scripts, evitando conflitos de nomenclatura e garantindo o isolamento necessário para funcionamento correto em diferentes contextos de navegação.

### Integração com o Sistema de Navegação

A navegação entre páginas é gerenciada pelo orquestrador em conjunto com os componentes de interface. Quando o usuário clica em um link de navegação, o evento é interceptado pelo `header.js`, que comunica o orquestrador sobre a mudança de rota solicitada. O orquestrador então executa a lógica necessária para a transição, incluindo a remoção do componente atual, a carga do novo componente, a atualização do histórico de navegação e a aplicação de animações de transição quando configuradas.

Este modelo de navegação permite que a aplicação mantenha múltiplas views em memória, possibilitando transições instantâneas entre páginas já visitadas e preservando o estado de formulários e interações do usuário. O histórico de navegação é gerenciado de forma que os botões de avançar e retrocesso do navegador funcionem corretamente, proporcionando uma experiência nativa ao usuário.

---

## 🚀 Como Executar

Como o projeto utiliza JavaScript moderno e módulos ES6, é necessário servi-lo através de um servidor HTTP local para evitar erros de CORS com arquivos estáticos.

### Opção 1: Servidor Python (Recomendado para Testes Rápidos)

Se você tem Python instalado, pode iniciar um servidor local com apenas um comando no terminal. Navegue até a pasta do projeto e execute o comando abaixo, depois acesse o endereço indicado no navegador.

```bash
cd enfermagem-concurseira
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Opção 2: Node.js com http-server

Para quem prefere utilizar Node.js, o pacote http-server oferece uma alternativa simples e eficiente para servir a aplicação durante o desenvolvimento.

```bash
cd enfermagem-concurseira
npx http-server -p 8000
# Acesse: http://localhost:8000
```

### Opção 3: Extensão Live Server (VS Code)

Para desenvolvedores que utilizam o Visual Studio Code, a extensão Live Server oferece a maneira mais prática de visualizar o projeto com recarregamento automático a cada alteração no código.

1. Instale a extensão **Live Server** no VS Code
2. Abra o arquivo `index.html` com botão direito
3. Selecione **"Open with Live Server"**

### Opção 4: Servidor PHP

Para quem possui PHP instalado, pode utilizar o servidor embutido para servir a aplicação.

```bash
cd enfermagem-concurseira
php -S localhost:8000
# Acesse: http://localhost:8000
```

---

## 📚 Funcionalidades Técnicas

### Arquitetura SPA (Single Page Application)

A aplicação utiliza uma arquitetura de página única onde todo o conteúdo é carregado inicialmente e as trocas de página acontecem dinamicamente sem recarregamento do navegador. Isso resulta em transições suaves entre os módulos e uma experiência de uso mais fluida para o usuário.

O sistema de roteamento é implementado no arquivo `app.js`, que monitora mudanças na URL e renderiza o conteúdo apropriado para cada rota. Cada módulo da aplicação é carregado sob demanda, otimizando o tempo de carregamento inicial.

### Sistema de Banco de Dados Local

O projeto utiliza IndexedDB através da biblioteca Dexie.js para armazenamento local de dados. Essa abordagem permite que os dados do usuário, como questões favoritadas, histórico de simulados e progresso de estudos, sejam persistidos no próprio navegador, funcionando mesmo sem conexão com a internet.

O banco de dados local é estruturado em múltiplas tabelas que armazenam diferentes tipos de informações, incluindo questões do banco oficial, questões criadas pelo usuário, tentativas de quizzes, flashcards e decks, mapas mentais, sessões Pomodoro, concursos do usuário, tópicos de estudo, dados de repetição espaçada, métricas de desempenho, conquistas, metas de estudo, recursos da biblioteca, notas de estudo e notificações.

### Comunicação por Eventos (Pub/Sub)

O módulo `event-bus.js` implementa o padrão Publicação/Inscrição, permitindo que diferentes partes da aplicação se comuniquem de forma desacoplada. Por exemplo, quando o usuário conclui um simulado, um evento é publicado e qualquer módulo interessado pode reagir a esse evento atualizando estatísticas ou mostrando notificações.

Os principais eventos incluem `quiz:completed` emitido quando um simulado é concluído, `contest:added` emitido quando um novo concurso é adicionado, `flashcard:reviewed` emitido quando um flashcard é revisado, `pomodoro:completed` emitido quando uma sessão Pomodoro é concluída e `achievement:unlocked` emitido quando uma conquista é desbloqueada.

### Sistema de Acessibilidade

O projeto inclui configurações de acessibilidade que permitem ao usuário ajustar o tamanho da fonte e alternar para um modo de alto contraste. Esses ajustes são salvos nas preferências e aplicados automaticamente a cada acesso.

Os recursos de acessibilidade incluem navegação por teclado completa, suporte a leitores de tela com ARIA labels, cores com contraste adequado para leitura, textos redimensionáveis sem perda de funcionalidade, modo de alto contraste para usuários com baixa visão e animações opcionais para usuários sensíveis a movimento.

---

## 🔄 Sincronização de Conteúdo via GitHub

O sistema implementa duas estratégias complementares de atualização de conteúdo utilizando o GitHub como plataforma de distribuição, permitindo que o Administrador mantenha o conteúdo atualizado sem precisar de um servidor backend.

### Estratégia 1: GitHub Pages com Arquivos JSON

Os arquivos de dados são mantidos na pasta `data/` do repositório e ficam disponíveis através do GitHub Pages. Esta abordagem é ideal para atualizações frequentes de conteúdo individual, como adição de novas questões ou atualização de editais. O Administrador edita os arquivos JSON diretamente no repositório e as alterações ficam disponíveis imediatamente após o commit.

A aplicação verifica automaticamente se há atualizações a cada hora e notifica o usuário quando novo conteúdo está disponível. O usuário pode então sincronizar com um clique, preservando seus dados de progresso e preferências.

Esta estratégia oferece as seguintes vantagens: simplicidade de implementação, atualizações em tempo real após commit, não requer geração de pacotes, ideal para adição/modificação pontual de conteúdo e fácil edição pelo Administrador através do editor web do GitHub.

### Estratégia 2: GitHub Releases para Pacotes Mensais

Para atualizações completas e versionadas, o sistema utiliza o recurso de Releases do GitHub. O Administrador prepara um pacote de dados completo, cria uma release com versionamento semântico e a aplicação pode baixar e aplicar automaticamente as atualizações.

Esta abordagem oferece as seguintes vantagens: versionamento formal com changelog, possibilidade de rollback para versões anteriores, ideal para publicações mensais de grande volume, validação de integridade dos dados e distribuição organizada de pacotes compactados.

### Como o Administrador Atualiza o Conteúdo

Para atualizações frequentes através do GitHub Pages, o Administrador acessa o repositório no GitHub, navega até a pasta `data/`, edita o arquivo JSON desejado adicionando ou modificando questões, faz commit das alterações com mensagem descritiva e as mudanças ficam disponíveis automaticamente através do GitHub Pages.

Para atualizações mensais através de Releases, o Administrador prepara o arquivo de dados completo com todas as alterações, acessa a seção Releases do repositório, clica em "Draft a new release", define a tag de versão no formato v1.0.0, adiciona título e notas de release detalhando as alterações, publica a release e a aplicação oferece aos usuários a opção de baixar e aplicar a atualização.

### Configuração do Repositório

Para configurar seu próprio repositório de conteúdo, siga os passos abaixo.

O primeiro passo é criar um fork do repositório ou criar um novo repositório GitHub. O segundo passo é habilitar o GitHub Pages nas configurações do repositório, selecionando a branch main e a pasta root como fonte. O terceiro passo é manter a estrutura de arquivos na pasta `data/` com os arquivos JSON de conteúdo. O quarto passo é, na aplicação, acessar a seção "Dados" no menu, localizar a opção de configuração do repositório e informar a URL no formato `https://github.com/usuario/repositorio`.

### Formato dos Arquivos de Dados

Os arquivos JSON seguem um formato padronizado que permite a sincronização eficiente e manutenção simplificada.

O arquivo `metadata.json` contém informações sobre a versão atual do conteúdo no formato semântico, data da última atualização em formato ISO 8601, estatísticas do conteúdo incluindo contagem de itens por tipo, histórico de alterações com descrição de cada versão e URLs do repositório e área de releases.

O arquivo `questions.json` contém um array de objetos questão, onde cada questão possui identificador único, tópico e categoria, tipo de exame e instituição, ano e nível de dificuldade, enunciado e opções de resposta, resposta correta e explicação detalhada, tags para filtragem, fonte bibliográfica e metadados de criação.

O arquivo `contests.json` contém um array de objetos concurso, onde cada concurso possui identificador único, nome e órgão promoter, estado e cidade, data da prova e status atual, vagas oferecidas e formação exigida, salário e link de inscrição, fonte do edital e metadados de criação.

O arquivo `flashcards.json` contém um objeto com dois arrays: decks e flashcards. Os decks possuem identificador único, título, descrição, categoria e contagem de cartões. Os flashcards possuem identificador único, referência ao deck, frente e verso, tópico e metadados de criação.

---

## 🔧 Personalização e Extensão

### Adicionando Novas Questões

Para expandir o banco de questões, basta utilizar o Painel Admin disponível na aplicação. As questões são salvas localmente e podem ser filtradas por área temática, banca e nível de dificuldade. Para contribuir com o conteúdo oficial, edite os arquivos JSON na pasta `data/` e faça um pull request no repositório.

### Modificando o Tema Visual

As cores e estilos do projeto são controlados pelo arquivo `assets/css/variables.css`. Para alterar a paleta de cores principal, modifique as variáveis CSS neste arquivo, incluindo a cor primária #1A3E74, a cor secundária #102a52, a cor de destaque #f59e0b e as variáveis de tipografia e espaçamento.

### Extendendo com Novos Módulos

Para adicionar novos recursos à aplicação, siga os passos abaixo.

O primeiro passo é criar um novo arquivo JavaScript no diretório apropriado, seja services para serviços de dados, utils para funções utilitárias ou components para componentes de interface. O segundo passo é implementar a lógica do módulo seguindo os padrões estabelecidos no projeto. O terceiro passo é inicializar o módulo no arquivo `app.js` adicionando-o à lista de inicializadores. O quarto passo é adicionar a página correspondente no arquivo `index.html` usando a estrutura de templates existente com o ID apropriado. O quinto passo é adicionar estilos específicos no arquivo `pages.css` se necessário.

### Configurando Notificações Push

Para configurar notificações push, integre um serviço como Firebase Cloud Messaging ou OneSignal. Adicione o código de inicialização no arquivo `app.js` e implemente os handlers para os eventos que devem gerar notificações, como lembrete de estudo diário, prazo de inscrição em concurso próximo e nova atualização de conteúdo disponível.

---

## 🤝 Como Contribuir

Contribuições são bem-vindas! Para contribuir com o projeto, você pode reportar problemas encontrados através da seção de issues do GitHub, sugerir novas funcionalidades através de pull requests, melhorar a documentação existente, traduzir a interface para outros idiomas e criar novos decks de flashcards e mapas mentais.

Para enviar pull requests, siga o fluxo padrão do GitHub: faça um fork do repositório, crie uma branch para sua funcionalidade, faça as alterações necessárias, envie a branch para seu fork e abra um pull request para revisão.

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e está disponível para uso livre. A aplicação utiliza bibliotecas de código aberto com as seguintes licenças: Dexie.js sob licença MIT, Font Awesome sob licença CC BY 4.0, Material Icons sob licença Apache 2.0 e Google Fonts sob licença OFL.

---

## 📞 Contato

Para dúvidas, sugestões ou parcerias, entre em contato através do repositório GitHub ou pelos canais de comunicação disponíveis no projeto.

---

**Desenvolvido com 💙 para a Enfermagem.**
