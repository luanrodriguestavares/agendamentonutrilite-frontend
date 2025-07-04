# Sistema de Agendamento de Refeições - Frontend

## Sobre o Projeto

Sistema web moderno e responsivo para gerenciamento de agendamentos de refeições da Nutrilite. Permite que colaboradores agendem refeições, home office, visitas, coffee breaks e transportes, com interface intuitiva e validações em tempo real.

## Tecnologias Utilizadas

### Core

- **[React 18](https://reactjs.org/)** - Biblioteca JavaScript para construção de interfaces
- **[Vite](https://vitejs.dev/)** - Build tool e dev server ultra-rápido
- **[React Router DOM](https://reactrouter.com/)** - Roteamento declarativo

### UI & Estilização

- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Radix UI](https://www.radix-ui.com/)** - Componentes React primitivos e acessíveis
- **[Class Variance Authority (CVA)](https://cva.style/)** - Utilitário para estilos condicionais
- **[Tailwind Merge](https://www.npmjs.com/package/tailwind-merge)** - Merge inteligente de classes Tailwind
- **[Tailwind Scrollbar](https://www.npmjs.com/package/tailwind-scrollbar)** - Estilização de scrollbars
- **[Tailwind CSS Animate](https://www.npmjs.com/package/tailwindcss-animate)** - Animações CSS

### Componentes UI

- **[@radix-ui/react-dialog](https://www.radix-ui.com/docs/primitives/components/dialog)** - Modais e diálogos
- **[@radix-ui/react-select](https://www.radix-ui.com/docs/primitives/components/select)** - Componentes de seleção
- **[@radix-ui/react-tabs](https://www.radix-ui.com/docs/primitives/components/tabs)** - Abas e navegação
- **[@radix-ui/react-toast](https://www.radix-ui.com/docs/primitives/components/toast)** - Notificações toast
- **[@radix-ui/react-popover](https://www.radix-ui.com/docs/primitives/components/popover)** - Popovers
- **[@radix-ui/react-checkbox](https://www.radix-ui.com/docs/primitives/components/checkbox)** - Checkboxes
- **[@radix-ui/react-switch](https://www.radix-ui.com/docs/primitives/components/switch)** - Switches
- **[@radix-ui/react-collapsible](https://www.radix-ui.com/docs/primitives/components/collapsible)** - Conteúdo colapsável
- **[@radix-ui/react-separator](https://www.radix-ui.com/docs/primitives/components/separator)** - Separadores

### Manipulação de Dados

- **[Axios](https://axios-http.com/)** - Cliente HTTP para requisições à API
- **[Date-fns](https://date-fns.org/)** - Manipulação avançada de datas
- **[React Day Picker](https://react-day-picker.js.org/)** - Componente de seleção de datas
- **[XLSX](https://www.npmjs.com/package/xlsx)** - Geração de relatórios Excel

### Ícones & UX

- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones modernos
- **[CLSX](https://www.npmjs.com/package/clsx)** - Utilitário para classes CSS condicionais

### Desenvolvimento

- **[ESLint](https://eslint.org/)** - Linter para JavaScript/React
- **[PostCSS](https://postcss.org/)** - Processador CSS
- **[Autoprefixer](https://autoprefixer.github.io/)** - Prefixos CSS automáticos

## Arquitetura do Projeto

```
frontend/
├── public/
│   ├── icon.png              # Ícone da aplicação
│   ├── logo-nutrilite.png    # Logo da Nutrilite
│   └── placeholder.svg       # Placeholder SVG
├── src/
│   ├── components/
│   │   ├── ui/               # Componentes base (Radix UI)
│   │   │   ├── button.jsx    # Botões
│   │   │   ├── input.jsx     # Campos de entrada
│   │   │   ├── select.jsx    # Seletores
│   │   │   ├── dialog.jsx    # Modais
│   │   │   ├── table.jsx     # Tabelas
│   │   │   ├── calendar.jsx  # Calendário
│   │   │   ├── date-picker.jsx # Seletor de datas
│   │   │   ├── tabs.jsx      # Abas
│   │   │   ├── toast.jsx     # Notificações
│   │   │   ├── badge.jsx     # Badges
│   │   │   ├── card.jsx      # Cards
│   │   │   ├── checkbox.jsx  # Checkboxes
│   │   │   ├── switch.jsx    # Switches
│   │   │   ├── textarea.jsx  # Áreas de texto
│   │   │   ├── separator.jsx # Separadores
│   │   │   ├── popover.jsx   # Popovers
│   │   │   ├── collapsible.jsx # Conteúdo colapsável
│   │   │   ├── time-input.jsx # Input de horário
│   │   │   ├── date-range-picker.jsx # Seletor de período
│   │   │   └── use-toast.js  # Hook para toasts
│   │   ├── forms/            # Formulários específicos
│   │   │   ├── AgendamentoTimeForm.jsx      # Form para times
│   │   │   ├── HomeOfficeForm.jsx           # Form home office
│   │   │   ├── SolicitacaoLancheForm.jsx    # Form lanches
│   │   │   ├── AgendamentoVisitanteForm.jsx # Form visitantes
│   │   │   ├── CoffeeBreakForm.jsx          # Form coffee break
│   │   │   └── RotaExtraForm.jsx            # Form rotas extras
│   │   ├── FormularioAgendamento.jsx        # Formulário principal
│   │   ├── Navbar.jsx                       # Barra de navegação
│   │   ├── Footer.jsx                       # Rodapé
│   │   ├── ErrorModal.jsx                   # Modal de erro
│   │   ├── Alertas.jsx                      # Componente de alertas
│   │   ├── AgendamentoDetailModal.jsx       # Modal de detalhes
│   │   ├── AdvancedFiltersModal.jsx         # Modal de filtros avançados
│   │   ├── PrivateRoute.jsx                 # Rota privada
│   │   └── theme-provider.jsx               # Provedor de tema
│   ├── contexts/
│   │   └── AuthContext.jsx                  # Contexto de autenticação
│   ├── pages/
│   │   ├── Login.jsx                        # Página de login
│   │   ├── Admin.jsx                        # Painel administrativo
│   │   └── CancelarAgendamento.jsx          # Página de cancelamento
│   ├── services/
│   │   └── api.js                           # Serviços de API
│   ├── utils/
│   │   ├── validacoes-formulario.js         # Validações de formulário
│   │   └── validacoes-agendamento.js        # Validações de agendamento
│   ├── lib/
│   │   └── utils.js                         # Utilitários gerais
│   ├── App.jsx                              # Componente principal
│   ├── main.jsx                             # Ponto de entrada
│   ├── index.css                            # Estilos globais
│   └── vite-env.d.ts                        # Tipos do Vite
├── index.html                               # HTML base
├── package.json                             # Dependências e scripts
├── vite.config.js                           # Configuração do Vite
├── tailwind.config.js                       # Configuração do Tailwind
├── postcss.config.js                        # Configuração do PostCSS
└── README.md                                # Documentação
```

## Configuração e Instalação

### Pré-requisitos

- Node.js (versão 16 ou superior)
- Yarn ou npm
- Backend da API rodando (porta 3001)

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd AgendamentoRefeicao/frontend
```

### 2. Instale as Dependências

```bash
yarn install
# ou
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# URL da API Backend
VITE_API_URL=http://localhost:3001

# Configurações do Frontend
VITE_APP_TITLE=Sistema de Agendamento Nutrilite
VITE_APP_VERSION=1.0.0
```

### 4. Configure o Backend

Certifique-se de que o backend está rodando na porta 3001:

```bash
cd ../api
yarn dev
```

### 5. Execute o Projeto

```bash
yarn dev
```

O frontend estará disponível em `http://localhost:5173`

## Executando o Projeto

### Desenvolvimento

```bash
yarn dev
```

- Hot-reload automático
- Compilação rápida com Vite
- Acesso em `http://localhost:5173`

### Build de Produção

```bash
yarn build
```

- Otimização automática
- Minificação de código
- Assets otimizados

### Preview do Build

```bash
yarn preview
```

- Servidor local para testar build
- Acesso em `http://localhost:4173`

### Linting

```bash
yarn lint
```

- Verificação de código com ESLint
- Regras específicas para React

## Funcionalidades

### 1. Formulário de Agendamento Principal

- **Interface responsiva** com design moderno
- **Validação em tempo real** de todos os campos
- **Seleção dinâmica** de campos baseada no tipo de agendamento
- **Feedback visual** imediato para o usuário

### 2. Tipos de Agendamento Suportados

#### Agendamento para Time

- Seleção de time/setor
- Centro de custo obrigatório
- Período (data início e fim)
- Turno (A, B, ADM)
- Quantidades por tipo de refeição
- Opção para feriados
- Refeitório (Fazenda/Indústria)

#### Home Office

- Período de home office
- Seleção de refeições por turno
- Validação de refeições por turno
- Refeitório de entrega
- Turno específico

#### Administrativo - Lanche

- Data específica
- Quantidade de lanches
- Tipo de lanche
- Turno (A, ADM)
- Refeitório

#### Agendamento para Visitante

- Dados do visitante
- Quantidade de visitantes
- Acompanhante responsável
- Data da visita
- Refeitório
- Centro de custo

#### Coffee Break

- Data e horário específico
- Cardápio personalizado (5 tipos)
- Quantidade de pessoas
- Local de entrega
- Rateio (Sim/Não)
- Centro de custo

#### Rota Extra

- Período (data início e fim)
- Quantidade por cidade (Tianguá/Ubajara)
- Centro de custo
- Categoria do dia (Feriado/Sábado/Domingo)

### 3. Sistema de Autenticação

- **Login seguro** com JWT
- **Contexto de autenticação** global
- **Rotas protegidas** para administradores
- **Persistência** de sessão no localStorage

### 4. Painel Administrativo

- **Dashboard** com estatísticas em tempo real
- **Tabela dinâmica** com paginação
- **Filtros avançados** por múltiplos critérios
- **Exportação Excel** com formatação
- **Ações em lote** (confirmar/cancelar)
- **Visualização detalhada** de agendamentos

### 5. Sistema de Cancelamento

- **Cancelamento via email** com link único
- **Validação de horários** de cancelamento
- **Feedback visual** do resultado
- **Redirecionamento** automático

## 🔧 Componentes Principais

### Formulário Principal (FormularioAgendamento.jsx)

- **Gerenciamento de estado** complexo
- **Validação em tempo real** com feedback
- **Renderização condicional** de campos
- **Integração** com todos os tipos de agendamento

### Painel Admin (Admin.jsx)

- **Dashboard responsivo** com cards de estatísticas
- **Tabela com paginação** e ordenação
- **Filtros avançados** com múltiplos critérios
- **Exportação Excel** com formatação personalizada
- **Modais** para detalhes e ações

### Sistema de Validação

- **Validações específicas** por tipo de agendamento
- **Regras de negócio** implementadas
- **Horários limite** para agendamentos
- **Feedback contextual** para o usuário

## Design System

### Cores Principais

- **Primary**: Emerald (#059669) - Cor principal da marca
- **Secondary**: Verde claro (#dcfce7) - Acentos
- **Success**: Verde (#22c55e) - Confirmações
- **Warning**: Amarelo (#eab308) - Avisos
- **Error**: Vermelho (#ef4444) - Erros
- **Neutral**: Cinza (#6b7280) - Textos secundários

### Componentes Base

- **Botões** com variantes (default, outline, ghost)
- **Inputs** com estados (focus, error, disabled)
- **Cards** com sombras e bordas arredondadas
- **Modais** com backdrop e animações
- **Tabelas** responsivas com hover states

### Responsividade

- **Mobile-first** design
- **Breakpoints** otimizados
- **Grid system** flexível
- **Componentes adaptativos**

## Sistema de Validação

### Validações de Formulário

- **Campos obrigatórios** por tipo de agendamento
- **Formato de email** válido
- **Datas futuras** para agendamentos
- **Quantidades** maiores que zero
- **Períodos válidos** (início <= fim)

### Validações de Horário

- **Limites específicos** por tipo de agendamento
- **Diferenciação** entre dias úteis e fins de semana
- **Horários de corte** para cada turno
- **Regras de negócio** implementadas

### Validações de Negócio

- **Centros de custo** válidos
- **Times/setores** permitidos
- **Refeições compatíveis** com turno
- **Períodos de agendamento** permitidos

## Funcionalidades Avançadas

### Dashboard Administrativo

- **Estatísticas em tempo real**
- **Filtros por período**
- **Contadores por status**
- **Visualização por tipo**

### Sistema de Filtros

- **Filtros básicos** (nome, email, tipo)
- **Filtros avançados** (período, quantidade, status)
- **Filtros específicos** por tipo de agendamento
- **Combinação** de múltiplos filtros

### Exportação de Dados

- **Formato Excel** (.xlsx)
- **Colunas específicas** por tipo
- **Formatação** de datas em pt-BR
- **Headers** em português
- **Múltiplas abas** por tipo

### Paginação e Ordenação

- **Paginação** com 20 itens por página
- **Ordenação** por qualquer coluna
- **Navegação** intuitiva
- **Contadores** de resultados

## Tratamento de Erros

### Interface de Usuário

- **Modais de erro** informativos
- **Toasts** para feedback rápido
- **Estados de loading** visuais
- **Mensagens contextualizadas**

### Validação de Formulários

- **Feedback em tempo real**
- **Indicadores visuais** de erro
- **Mensagens específicas** por campo
- **Prevenção** de envio inválido

### Comunicação com API

- **Interceptors** para tokens
- **Timeout** configurado (30s)
- **Tratamento** de erros de rede
- **Fallbacks** para falhas

## Configurações Técnicas

### Vite

- **Alias** configurado (@ para src/)
- **Hot-reload** otimizado
- **Build** otimizado para produção
- **Dev server** rápido

### TailwindCSS

- **Configuração** customizada
- **Cores** da marca Nutrilite
- **Animações** personalizadas
- **Plugins** adicionais (scrollbar, animate)

### ESLint

- **Regras** para React
- **Hooks** linting
- **Refresh** linting
- **Configuração** estrita

## Responsividade

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Adaptações

- **Formulários** responsivos
- **Tabelas** com scroll horizontal
- **Modais** adaptativos
- **Navegação** mobile-friendly

## Estado da Aplicação

### Contexto de Autenticação

- **Usuário logado** persistido
- **Token JWT** armazenado
- **Estado global** de autenticação
- **Logout** automático

### Gerenciamento de Formulários

- **Estado local** por componente
- **Validação** em tempo real
- **Reset** após envio
- **Persistência** de dados

## Performance

### Otimizações

- **Code splitting** automático
- **Lazy loading** de componentes
- **Memoização** de componentes pesados
- **Bundle** otimizado

### Métricas

- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **First Input Delay** < 100ms

## Desenvolvimento

### Scripts Disponíveis

```bash
yarn dev          # Desenvolvimento
yarn build        # Build de produção
yarn preview      # Preview do build
yarn lint         # Verificação de código
```

### Estrutura de Desenvolvimento

- **Hot-reload** automático
- **ESLint** em tempo real
- **TypeScript** support
- **Debug** configurado
