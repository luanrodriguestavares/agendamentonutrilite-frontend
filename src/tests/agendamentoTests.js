import { validarAgendamentoTime, validarHomeOffice, validarSolicitacaoLanche, validarCoffeeBreak, validarRotaExtra } from '../utils/validacoes-agendamento.js'

const color = {
    green: (msg) => `\x1b[32m${msg}\x1b[0m`,
    red: (msg) => `\x1b[31m${msg}\x1b[0m`,
    yellow: (msg) => `\x1b[33m${msg}\x1b[0m`,
    cyan: (msg) => `\x1b[36m${msg}\x1b[0m`,
    bold: (msg) => `\x1b[1m${msg}\x1b[0m`,
    gray: (msg) => `\x1b[90m${msg}\x1b[0m`,
}

class AgendamentoTestSuite {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        }
        this.originalDate = global.Date
        this.originalNow = global.Date.now
    }

    setMockTime(dateString) {
        const mockDate = new this.originalDate(dateString)
        const OriginalDate = this.originalDate
        function MockDate(...args) {
            if (args.length === 0) {
                return new OriginalDate(mockDate)
            }
            return new OriginalDate(...args)
        }
        MockDate.now = () => mockDate.getTime()
        MockDate.UTC = OriginalDate.UTC
        MockDate.parse = OriginalDate.parse
        MockDate.prototype = OriginalDate.prototype
        global.Date = MockDate
    }

    resetTime() {
        global.Date = this.originalDate
        global.Date.now = this.originalNow
    }

    test(name, testFunction, group) {
        this.results.total++
        try {
            const result = testFunction()
            if (result.success) {
                this.results.passed++
                this.results.details.push({ name, status: 'PASS', group, message: result.message })
                console.log(`  ${color.green('✔')} ${name}`)
                if (result.expected) {
                    console.log(`    ${color.gray('Esperado:')} ${result.expected}`)
                }
            } else {
                this.results.failed++
                this.results.details.push({
                    name,
                    status: 'FAIL',
                    group,
                    expected: result.expected,
                    received: result.received
                })
                console.log(`  ${color.red('✖')} ${name}`)
                if (result.expected) {
                    console.log(`    ${color.gray('Esperado:')} ${result.expected}`)
                }
            }
        } catch (error) {
            this.results.failed++
            this.results.details.push({ name, status: 'ERROR', group, error: error.message })
            console.log(`  ${color.red('💥')} ${name} - ${error.message}`)
        }
    }

    runAllTests() {
        console.log(color.bold('\n🧪 SISTEMA DE TESTES AUTOMATIZADOS - AGENDAMENTO DE REFEIÇÕES'))
        console.log(color.gray('='.repeat(70)))
        console.log(color.cyan('Testando todas as regras de negócio de agendamento'))
        console.log(color.gray('='.repeat(70)))

        this.testAgendamentoTime()
        this.testHomeOffice()
        this.testSolicitacaoLanche()
        this.testCoffeeBreak()
        this.testRotaExtra()
        // Removido: this.testCancelamentos()

        this.printResults()
    }

    testAgendamentoTime() {
        console.log(color.bold('\n📋 Agendamento para Time'))
        this.test('Mesmo dia antes do limite (Turno A)', () => {
            this.setMockTime('2024-01-15T07:00:00')
            const data = {
                timeSetor: 'Manufatura',
                centroCusto: '201001-MANUFATURA',
                turno: 'A',
                dataInicio: new Date('2024-01-15'),
                dataFim: new Date('2024-01-15'),
                quantidadeAlmocoLanche: 10,
                refeitorio: 'Fazenda'
            }
            const result = validarAgendamentoTime(data)
            this.resetTime()
            return {
                success: result.permitido,
                expected: 'Permitido (antes do limite 07:30)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Agendamento para Time')
        this.test('Mesmo dia após limite (Turno A)', () => {
            this.setMockTime('2024-01-15T08:00:00')
            const data = {
                timeSetor: 'Manufatura',
                centroCusto: '201001-MANUFATURA',
                turno: 'A',
                dataInicio: new Date('2024-01-15'),
                dataFim: new Date('2024-01-15'),
                quantidadeAlmocoLanche: 10,
                refeitorio: 'Fazenda'
            }
            const result = validarAgendamentoTime(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (após limite 07:30)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Agendamento para Time')
        this.test('Fim de semana próximo (Sexta após 09:00)', () => {
            this.setMockTime('2024-01-19T10:00:00')
            const data = {
                timeSetor: 'Manufatura',
                centroCusto: '201001-MANUFATURA',
                turno: 'A',
                dataInicio: new Date('2024-01-20'),
                dataFim: new Date('2024-01-21'),
                quantidadeAlmocoLanche: 10,
                refeitorio: 'Fazenda'
            }
            const result = validarAgendamentoTime(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (após limite sexta 09:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Agendamento para Time')
        this.test('Fim de semana próximo (Sexta antes 09:00)', () => {
            this.setMockTime('2024-01-19T08:00:00')
            const data = {
                timeSetor: 'Manufatura',
                centroCusto: '201001-MANUFATURA',
                turno: 'A',
                dataInicio: new Date('2024-01-20'),
                dataFim: new Date('2024-01-21'),
                quantidadeAlmocoLanche: 10,
                refeitorio: 'Fazenda'
            }
            const result = validarAgendamentoTime(data)
            this.resetTime()
            return {
                success: result.permitido,
                expected: 'Permitido (antes do limite sexta 09:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Agendamento para Time')
        this.test('Feriado próximo fim de semana', () => {
            this.setMockTime('2024-01-19T10:00:00')
            const data = {
                timeSetor: 'Manufatura',
                centroCusto: '201001-MANUFATURA',
                turno: 'A',
                isFeriado: true,
                dataFeriado: new Date('2024-01-20'),
                quantidadeAlmocoLanche: 10,
                refeitorio: 'Fazenda'
            }
            const result = validarAgendamentoTime(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (feriado após limite sexta 09:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Agendamento para Time')
    }

    testHomeOffice() {
        console.log(color.bold('\n🏠 Home Office'))
        this.test('Mesmo dia com almoço antes do limite', () => {
            this.setMockTime('2024-01-15T07:00:00')
            const data = {
                timeSetor: 'Manufatura',
                dataInicio: new Date('2024-01-15'),
                dataFim: new Date('2024-01-15'),
                turno: 'A',
                refeitorio: 'Fazenda',
                refeicoes: ['Almoço']
            }
            const result = validarHomeOffice(data)
            this.resetTime()
            return {
                success: result.permitido,
                expected: 'Permitido (almoço antes do limite 07:30)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Home Office')
        this.test('Mesmo dia com almoço após limite', () => {
            this.setMockTime('2024-01-15T08:00:00')
            const data = {
                timeSetor: 'Manufatura',
                dataInicio: new Date('2024-01-15'),
                dataFim: new Date('2024-01-15'),
                turno: 'A',
                refeitorio: 'Fazenda',
                refeicoes: ['Almoço']
            }
            const result = validarHomeOffice(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (almoço após limite 07:30)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Home Office')
        this.test('Mesmo dia com lanche antes do limite', () => {
            this.setMockTime('2024-01-15T08:30:00')
            const data = {
                timeSetor: 'Manufatura',
                dataInicio: new Date('2024-01-15'),
                dataFim: new Date('2024-01-15'),
                turno: 'A',
                refeitorio: 'Fazenda',
                refeicoes: ['Lanche']
            }
            const result = validarHomeOffice(data)
            this.resetTime()
            return {
                success: result.permitido,
                expected: 'Permitido (lanche antes do limite 09:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Home Office')
        this.test('Mesmo dia com lanche após limite', () => {
            this.setMockTime('2024-01-15T09:30:00')
            const data = {
                timeSetor: 'Manufatura',
                dataInicio: new Date('2024-01-15'),
                dataFim: new Date('2024-01-15'),
                turno: 'A',
                refeitorio: 'Fazenda',
                refeicoes: ['Lanche']
            }
            const result = validarHomeOffice(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (lanche após limite 09:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Home Office')
        this.test('Fim de semana próximo (Sexta após 09:00)', () => {
            this.setMockTime('2024-01-19T10:00:00')
            const data = {
                timeSetor: 'Manufatura',
                dataInicio: new Date('2024-01-20'),
                dataFim: new Date('2024-01-21'),
                turno: 'A',
                refeitorio: 'Fazenda',
                refeicoes: ['Almoço']
            }
            const result = validarHomeOffice(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (fim de semana após limite sexta 09:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Home Office')
    }

    testSolicitacaoLanche() {
        console.log(color.bold('\n🍎 Solicitação de Lanche'))
        this.test('Mesmo dia antes do limite', () => {
            this.setMockTime('2024-01-15T08:30:00')
            const data = {
                timeSetor: 'Manufatura',
                data: new Date('2024-01-15'),
                turno: 'A',
                refeitorio: 'Fazenda',
                refeicoes: 'Lanche Individual'
            }
            const result = validarSolicitacaoLanche(data)
            this.resetTime()
            return {
                success: result.permitido,
                expected: 'Permitido (antes do limite 09:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        }, 'Solicitação de Lanche')
        this.test('Mesmo dia após limite', () => {
            this.setMockTime('2024-01-15T09:30:00')
            const data = {
                timeSetor: 'Manufatura',
                data: new Date('2024-01-15'),
                turno: 'A',
                refeitorio: 'Fazenda',
                refeicoes: 'Lanche Individual'
            }
            const result = validarSolicitacaoLanche(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (após limite 09:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        })

        this.test('Solicitação Lanche - Próximo dia', () => {
            this.setMockTime('2024-01-15T10:00:00')
            const data = {
                timeSetor: 'Manufatura',
                data: new Date('2024-01-16'),
                turno: 'A',
                refeitorio: 'Fazenda',
                refeicoes: 'Lanche Individual'
            }
            const result = validarSolicitacaoLanche(data)
            this.resetTime()
            return {
                success: result.permitido,
                expected: 'Permitido (próximo dia)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        })
    }

    testCoffeeBreak() {
        console.log('\n☕ Testando Coffee Break')
        console.log('='.repeat(50))

        this.test('Coffee Break - Dia anterior antes do limite', () => {
            this.setMockTime('2024-01-15T11:00:00')
            const data = {
                timeSetor: 'Manufatura',
                dataCoffee: new Date('2024-01-16'),
                turno: 'A',
                cardapio: 'Coffe Tipo 01',
                quantidade: 10,
                centroCusto: '201001-MANUFATURA',
                rateio: 'Sim',
                horario: '10:00',
                localEntrega: 'Sala de Reunião'
            }
            const result = validarCoffeeBreak(data)
            this.resetTime()
            return {
                success: result.permitido,
                expected: 'Permitido (antes do limite 12:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        })

        this.test('Coffee Break - Dia anterior após limite', () => {
            this.setMockTime('2024-01-15T13:00:00')
            const data = {
                timeSetor: 'Manufatura',
                dataCoffee: new Date('2024-01-16'),
                turno: 'A',
                cardapio: 'Coffe Tipo 01',
                quantidade: 10,
                centroCusto: '201001-MANUFATURA',
                rateio: 'Sim',
                horario: '10:00',
                localEntrega: 'Sala de Reunião'
            }
            const result = validarCoffeeBreak(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (após limite 12:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        })

        this.test('Coffee Break - Mesmo dia', () => {
            this.setMockTime('2024-01-15T08:00:00')
            const data = {
                timeSetor: 'Manufatura',
                dataCoffee: new Date('2024-01-15'),
                turno: 'A',
                cardapio: 'Coffe Tipo 01',
                quantidade: 10,
                centroCusto: '201001-MANUFATURA',
                rateio: 'Sim',
                horario: '10:00',
                localEntrega: 'Sala de Reunião'
            }
            const result = validarCoffeeBreak(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (mesmo dia não permitido)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        })
    }

    testRotaExtra() {
        console.log('\n🚌 Testando Rota Extra')
        console.log('='.repeat(50))

        this.test('Rota Extra - Sexta antes do limite', () => {
            this.setMockTime('2024-01-19T10:00:00')
            const data = {
                timeSetor: 'Manufatura',
                centroCusto: '201001-MANUFATURA',
                dia: 'Sabado',
                dataInicio: new Date('2024-01-20'),
                dataFim: new Date('2024-01-21'),
                quantidadeTiangua: 5,
                quantidadeUbajara: 3
            }
            const result = validarRotaExtra(data)
            this.resetTime()
            return {
                success: result.permitido,
                expected: 'Permitido (sexta antes do limite 11:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        })

        this.test('Rota Extra - Sexta após limite', () => {
            this.setMockTime('2024-01-19T12:00:00')
            const data = {
                timeSetor: 'Manufatura',
                centroCusto: '201001-MANUFATURA',
                dia: 'Sabado',
                dataInicio: new Date('2024-01-20'),
                dataFim: new Date('2024-01-21'),
                quantidadeTiangua: 5,
                quantidadeUbajara: 3
            }
            const result = validarRotaExtra(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (sexta após limite 11:00)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        })

        this.test('Rota Extra - Sábado', () => {
            this.setMockTime('2024-01-20T10:00:00')
            const data = {
                timeSetor: 'Manufatura',
                centroCusto: '201001-MANUFATURA',
                dia: 'Domingo',
                dataInicio: new Date('2024-01-21'),
                dataFim: new Date('2024-01-21'),
                quantidadeTiangua: 5,
                quantidadeUbajara: 3
            }
            const result = validarRotaExtra(data)
            this.resetTime()
            return {
                success: !result.permitido,
                expected: 'Negado (sábado não permitido)',
                received: result.permitido ? 'Permitido' : `Negado: ${result.mensagem}`
            }
        })
    }

    // Removido: testCancelamentos()
    // Removido: simularCancelamento()

    printResults() {
        console.log('\n📊 RESULTADOS DOS TESTES')
        console.log('='.repeat(50))
        console.log(`✅ Passou: ${this.results.passed}`)
        console.log(`❌ Falhou: ${this.results.failed}`)
        console.log(`📈 Total: ${this.results.total}`)
        console.log(`📊 Taxa de Sucesso: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`)

        if (this.results.failed > 0) {
            console.log('\n❌ DETALHES DOS FALHOS:')
            this.results.details
                .filter(test => test.status === 'FAIL' || test.status === 'ERROR')
                .forEach(test => {
                    console.log(`\n🔍 ${test.name}`)
                    if (test.expected && test.received) {
                        console.log(`   Esperado: ${test.expected}`)
                        console.log(`   Recebido: ${test.received}`)
                    }
                    if (test.error) {
                        console.log(`   Erro: ${test.error}`)
                    }
                })
        }

        console.log('\n🎯 RESUMO:')
        if (this.results.failed === 0) {
            console.log('🎉 Todos os testes passaram! O sistema está funcionando corretamente.')
        } else {
            console.log(`⚠️  ${this.results.failed} teste(s) falharam. Verifique as regras de negócio.`)
        }
    }
}

export default AgendamentoTestSuite
