import AgendamentoTestSuite from './agendamentoTests.js'

console.log('🧪 SISTEMA DE TESTES AUTOMATIZADOS - AGENDAMENTO DE REFEIÇÕES')
console.log('='.repeat(70))
console.log('Este sistema testa todas as regras de negócio de agendamento e cancelamento')
console.log('Incluindo validações de horário, datas limite e cenários específicos\n')

const testSuite = new AgendamentoTestSuite()

testSuite.runAllTests()

console.log('\n📋 COMO USAR OS TESTES:')
console.log('='.repeat(50))
console.log('1. Execute: node src/tests/runTests.js')
console.log('2. Os testes simulam diferentes horários e cenários')
console.log('3. Cada teste verifica se a regra de negócio está correta')
console.log('4. Resultados mostram taxa de sucesso e detalhes dos falhos\n')

console.log('📚 REGRAS DE NEGÓCIO TESTADAS:')
console.log('='.repeat(50))

console.log('\n🕐 HORÁRIOS LIMITE DE AGENDAMENTO:')
console.log('• Dias úteis: até 07:30h do mesmo dia')
console.log('• Fins de semana: até 09:00h da sexta-feira')
console.log('• Coffee Break: até 12:00h do dia anterior')
console.log('• Rota Extra: até 11:00h da sexta-feira')

console.log('\n❌ HORÁRIOS LIMITE DE CANCELAMENTO:')
console.log('• Coffee Break: até 12:00h do dia anterior')
console.log('• Almoço (dias úteis): até 07:35h do mesmo dia')
console.log('• Jantar/Ceia (dias úteis): até 09:05h do mesmo dia')
console.log('• Almoço (fins de semana): até 13:30h do dia anterior')
console.log('• Jantar/Ceia (fins de semana): até 12:00h do dia')

console.log('\n🎯 TIPOS DE AGENDAMENTO TESTADOS:')
console.log('• Agendamento para Time')
console.log('• Home Office')
console.log('• Solicitação de Lanche')
console.log('• Coffee Break')
console.log('• Rota Extra')

console.log('\n🔧 PARA ADICIONAR NOVOS TESTES:')
console.log('1. Adicione métodos na classe AgendamentoTestSuite')
console.log('2. Use setMockTime() para simular horários específicos')
console.log('3. Use resetTime() após cada teste')
console.log('4. Retorne objeto com success, expected e received')

console.log('\n📊 INTERPRETAÇÃO DOS RESULTADOS:')
console.log('✅ Verde: Teste passou (comportamento esperado)')
console.log('❌ Vermelho: Teste falhou (verificar regra de negócio)')
console.log('💥 Erro: Problema técnico no teste')

console.log('\n🚀 PRÓXIMOS PASSOS:')
console.log('1. Execute os testes regularmente')
console.log('2. Adicione testes para novos cenários')
console.log('3. Mantenha as regras de negócio atualizadas')
console.log('4. Use os resultados para validar mudanças no sistema')
