# Sistema de Agendamento de Refeições - Frontend

## Sobre o Projeto

Sistema web para gerenciamento de agendamentos de refeições da Nutrilite. Permite que colaboradores agendem refeições, home office, visitas e outros serviços relacionados ao refeitório.

## Tecnologias

- [React 18](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
- [Vite](https://vitejs.dev/) - Build tool e dev server
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Radix UI](https://www.radix-ui.com/) - Componentes React primitivos e acessíveis
- [React Router DOM](https://reactrouter.com/) - Roteamento
- [Axios](https://axios-http.com/) - Cliente HTTP
- [Date-fns](https://date-fns.org/) - Manipulação de datas
- [Lucide React](https://lucide.dev/) - Ícones
- [Class Variance Authority](https://cva.style/) - Utilitário para estilos condicionais

## Arquitetura

```
frontend/
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   ├── contexts/      # Contextos React (auth)
│   ├── lib/           # Configurações e utilitários
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços (API)
│   └── utils/         # Funções utilitárias
├── public/            # Arquivos estáticos
└── index.html         # Entrada da aplicação
```

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
cd frontend
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```
VITE_API_URL=http://localhost:3000
```

## 🚀 Rodando o Projeto

```bash
# Desenvolvimento
yarn dev

# Build de produção
yarn build

# Preview do build
yarn preview
```

## Funcionalidades

### Tipos de Agendamento

1. **Agendamento para Time**
   - Agendamento de refeições para equipes
   - Seleção de data e turno
   - Quantidade de pessoas por refeição (Almoço/Lanche, Jantar/Ceia, Lanche Extra)
   - Centro de custo
   - Opção para feriados

2. **Home Office**
   - Agendamento de dias em home office
   - Período (data início e fim)
   - Seleção de refeições
   - Refeitório (Indústria/Agro)
   - Turno (A, B, C)

3. **Administrativo - Lanche**
   - Agendamento de lanches para reuniões
   - Data específica
   - Quantidade de lanches
   - Tipo de lanche

4. **Agendamento para Visitante**
   - Registro de visitantes
   - Data da visita
   - Quantidade de visitantes
   - Refeitório
   - Acompanhante responsável
   - Centro de custo

5. **Coffee Break**
   - Agendamento de coffee break
   - Data e horário específico
   - Quantidade de pessoas
   - Cardápio personalizado
   - Local de entrega
   - Time/Setor responsável

6. **Rota Extra**
   - Agendamento de transporte
   - Período (data início e fim)
   - Quantidade de pessoas por cidade (Tianguá/Ubajara)
   - Centro de custo
   - Time/Setor

### Regras de Negócio

1. **Status dos Agendamentos**
   - Pendente: Aguardando aprovação
   - Confirmado: Aprovado pelo administrador
   - Cancelado: Cancelado pelo usuário ou administrador
   - Finalizado: Data do agendamento já passou

2. **Confirmações**
   - Agendamentos ficam pendentes até confirmação do admin
   - Email enviado após criação e confirmação
   - Detalhes completos disponíveis no email

3. **Cancelamentos**
   - Podem ser feitos pelo usuário (via link no email)
   - Podem ser feitos pelo administrador (com motivo)
   - Notificação por email com detalhes

4. **Restrições**
   - Validações específicas por tipo de agendamento
   - Controle de datas futuras
   - Validações de quantidade de pessoas
   - Centro de custo obrigatório para alguns tipos

## 👥 Perfis de Usuário

1. **Usuário Comum**
   - Criar agendamentos
   - Visualizar próprios agendamentos
   - Cancelar agendamentos via email

2. **Administrador**
   - Dashboard com estatísticas
   - Gerenciar todos os agendamentos
   - Confirmar/cancelar solicitações
   - Exportar relatórios para Excel
   - Filtros avançados de busca
