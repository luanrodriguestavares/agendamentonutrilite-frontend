# 🧪 Sistema de Testes Automatizados - Agendamento de Refeições

## 📋 Visão Geral

Este sistema de testes automatizados valida todas as regras de negócio do sistema de agendamento de refeições, incluindo validações de horário, datas limite e cenários específicos para cada tipo de agendamento.

## 🚀 Como Executar

### Execução Rápida

```bash
yarn test
# ou
npm run test
```

### Execução Manual

```bash
node src/tests/runTests.js
```

## 📊 Resultados Esperados

### ✅ Testes que DEVEM Passar

- Agendamentos dentro dos horários limite
- Cancelamentos dentro dos horários limite
- Validações de campos obrigatórios
- Regras específicas por tipo de agendamento

### ❌ Testes que DEVEM Falhar

- Agendamentos após horários limite
- Cancelamentos após horários limite
- Datas inválidas (passadas)
- Cenários não permitidos

## 🕐 Regras de Negócio Testadas

### Agendamento para Time

- **Dias úteis**: Até 07:30h do mesmo dia
- **Fins de semana**: Até 09:00h da sexta-feira
- **Feriados**: Até 09:00h da sexta-feira anterior
- **Turno A**: Almoço e lanche
- **Turno B**: Jantar e ceia
- **Turno ADM**: Lanche extra

### Home Office

- **Dias úteis**: Até 07:30h do mesmo dia
- **Fins de semana**: Até 09:00h da sexta-feira
- **Almoço**: Até 07:30h do mesmo dia
- **Lanche**: Até 09:00h do mesmo dia
- **Jantar/Ceia**: Até 07:30h do mesmo dia

### Solicitação de Lanche

- **Mesmo dia**: Até 09:00h
- **Próximo dia**: Sempre permitido
- **Fins de semana**: Até 09:00h da sexta-feira

### Coffee Break

- **Agendamento**: Até 12:00h do dia anterior
- **Cancelamento**: Até 12:00h do dia anterior
- **Mesmo dia**: Não permitido

### Rota Extra

- **Agendamento**: Até 11:00h da sexta-feira
- **Sábado/Domingo**: Não permitido agendar

## ❌ Regras de Cancelamento

### Coffee Break

- **Limite**: Até 12:00h do dia anterior

### Dias Úteis

- **Almoço (Turno A/ADM)**: Até 07:35h do mesmo dia
- **Jantar/Ceia (Turno B)**: Até 09:05h do mesmo dia

### Fins de Semana/Feriados

- **Almoço**: Até 13:30h do dia anterior
- **Jantar/Ceia**: Até 12:00h do dia solicitado

## 🎯 Cenários de Teste

### 1. Agendamento para Time

- ✅ Mesmo dia antes do limite (07:00h)
- ❌ Mesmo dia após limite (08:00h)
- ✅ Fim de semana antes do limite (sexta 08:00h)
- ❌ Fim de semana após limite (sexta 10:00h)
- ❌ Feriado após limite (sexta 10:00h)

### 2. Home Office

- ✅ Almoço antes do limite (07:00h)
- ❌ Almoço após limite (08:00h)
- ✅ Lanche antes do limite (08:30h)
- ❌ Lanche após limite (09:30h)
- ❌ Fim de semana após limite (sexta 10:00h)

### 3. Solicitação de Lanche

- ✅ Mesmo dia antes do limite (08:30h)
- ❌ Mesmo dia após limite (09:30h)
- ✅ Próximo dia (sempre permitido)

### 4. Coffee Break

- ✅ Dia anterior antes do limite (11:00h)
- ❌ Dia anterior após limite (13:00h)
- ❌ Mesmo dia (não permitido)

### 5. Rota Extra

- ✅ Sexta antes do limite (10:00h)
- ❌ Sexta após limite (12:00h)
- ❌ Sábado (não permitido)

### 6. Cancelamentos

- ✅ Coffee Break antes do limite (11:00h)
- ❌ Coffee Break após limite (13:00h)
- ✅ Almoço dia útil antes do limite (07:00h)
- ❌ Almoço dia útil após limite (08:00h)
- ✅ Jantar dia útil antes do limite (09:00h)
- ❌ Jantar dia útil após limite (10:00h)
- ✅ Fim de semana antes do limite (13:00h)
- ❌ Fim de semana após limite (14:00h)

## 🔧 Como Adicionar Novos Testes

### 1. Estrutura do Teste

```javascript
this.test("Nome do Teste", () => {
  this.setMockTime("2024-01-15T07:00:00"); // Simula horário
  const data = {
    // Dados do agendamento
  };
  const result = validarFuncao(data);
  this.resetTime(); // Restaura horário real
  return {
    success: result.permitido, // true se deve passar, false se deve falhar
    expected: "Descrição do comportamento esperado",
    received: result.permitido ? "Permitido" : `Negado: ${result.mensagem}`,
  };
});
```

### 2. Simulação de Horário

```javascript
// Simula horário específico
this.setMockTime("2024-01-15T07:00:00");

// Restaura horário real
this.resetTime();
```

### 3. Validação de Resultado

```javascript
// Para testes que DEVEM passar
success: result.permitido;

// Para testes que DEVEM falhar
success: !result.permitido;
```

## 📈 Interpretação dos Resultados

### ✅ Verde (PASS)

- Teste passou conforme esperado
- Regra de negócio está funcionando corretamente

### ❌ Vermelho (FAIL)

- Teste falhou quando deveria passar
- OU teste passou quando deveria falhar
- Verificar regra de negócio implementada

### 💥 Erro (ERROR)

- Problema técnico no teste
- Verificar sintaxe ou lógica do teste

## 🚨 Troubleshooting

### Problema: Testes falhando inesperadamente

1. Verificar se as regras de negócio foram alteradas
2. Confirmar horários limite corretos
3. Validar lógica de validação no frontend

### Problema: Mock de horário não funcionando

1. Verificar se `setMockTime()` foi chamado
2. Confirmar se `resetTime()` foi chamado após o teste
3. Validar formato da data (YYYY-MM-DDTHH:mm:ss)

### Problema: Testes inconsistentes

1. Verificar se não há estado compartilhado entre testes
2. Confirmar que cada teste é independente
3. Validar se `resetTime()` está sendo chamado

## 📋 Checklist de Validação

### Antes de Executar Testes

- [ ] Backend rodando na porta 3001
- [ ] Dependências instaladas (`yarn install`)
- [ ] Arquivo `.env` configurado

### Após Executar Testes

- [ ] Verificar taxa de sucesso > 90%
- [ ] Analisar falhas específicas
- [ ] Validar regras de negócio
- [ ] Documentar mudanças necessárias

## 🔄 Manutenção dos Testes

### Atualizações Regulares

1. **Semanal**: Executar todos os testes
2. **Mensal**: Revisar regras de negócio
3. **Trimestral**: Adicionar novos cenários
4. **Anual**: Refatorar testes antigos

### Adição de Novos Cenários

1. Identificar nova regra de negócio
2. Criar teste específico
3. Validar comportamento esperado
4. Documentar no README

## 📞 Suporte

Para dúvidas sobre os testes:

- Verificar este documento
- Consultar código fonte em `src/tests/`
- Analisar logs de execução
- Contatar equipe de desenvolvimento

---

**Última atualização**: Janeiro 2024
**Versão**: 1.0.0
**Responsável**: Equipe de Desenvolvimento
