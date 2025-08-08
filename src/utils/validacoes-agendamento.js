/**
 * Validações específicas para cada tipo de agendamento
 */

// Centros de custo disponíveis
export const CENTROS_CUSTO = [
    "102023-AGRIAO - P&D",
    "301009-AGRIAO",
    "301001-AGRO",
    "201009-ALMOXARIFADO",
    "401001-AMBULATORIO",
    "102024-CAMOMILA - P&D",
    "102027-CAMOMILA - P&D",
    "301011-CAMOMILA",
    "102028-CHIA - P&D",
    "301010-CHIA",
    "101002-COMPRAS",
    "101006-COMUNIDADE",
    "201013-CONTROLE DE QUALIDADE",
    "201004-DESIDRATACAO",
    "201015-DESIDRATACAO DE AGRIAO",
    "101011-ENGENHARIA",
    "201002-EXTRACAO",
    "401009-FACILITIES",
    "101009-FINANCEIRO",
    "201012-GARANTIA DA QUALIDADE",
    "101007-GESTAO OPERACIONAL",
    "201008-LOGISTICA",
    "201011-MANUTENCAO - PARADA",
    "401004-MANUTENCAO COMPARTILHADA",
    "301007-MANUTENCAO FAZENDA",
    "201007-MANUTENCAO INDUSTRIA",
    "401007-MANUTENCAO PATRIMONIAL",
    "102000-PESQUISA E DESENVOLVIMENTO",
    "401005-PROCOMPET",
    "201001-PRODUCAO",
    "401002-RESTAURANTE",
    "101004-RH",
    "101005-SEGURANCA E AMBIENTE",
    "401010-SERVICO DE SUPORTE",
    "201003-SPRAY DRYER",
    "101010-TECNOLOGIA DA INFORMACAO",
    "401003-TRANSPORTE",
    "201006-UTILIDADES",
    "101003-VENDAS",
    "301006-VIVEIRO",
]

// Times/Setores disponíveis
export const TIMES_SETORES = [
    "AGRIAO - P&D",
    "AGRIAO",
    "AGRO",
    "ALMOXARIFADO",
    "AMBULATORIO",
    "CAMOMILA - P&D",
    "CAMOMILA",
    "CHIA - P&D",
    "CHIA",
    "COMPRAS",
    "COMUNIDADE",
    "CONTROLE DE QUALIDADE",
    "DESIDRATACAO",
    "DESIDRATACAO DE AGRIAO",
    "ENGENHARIA",
    "EXTRACAO",
    "FACILITIES",
    "FINANCEIRO",
    "GARANTIA DA QUALIDADE",
    "GESTAO OPERACIONAL",
    "LOGISTICA",
    "MANUTENCAO - PARADA",
    "MANUTENCAO COMPARTILHADA",
    "MANUTENCAO FAZENDA",
    "MANUTENCAO INDUSTRIA",
    "MANUTENCAO PATRIMONIAL",
    "PESQUISA E DESENVOLVIMENTO",
    "PROCOMPET",
    "PRODUCAO",
    "RESTAURANTE",
    "RH",
    "SEGURANCA E AMBIENTE",
    "SERVICO DE SUPORTE",
    "SPRAY DRYER",
    "TECNOLOGIA DA INFORMACAO",
    "TRANSPORTE",
    "UTILIDADES",
    "VENDAS",
    "VIVEIRO",
]

/**
 * Função utilitária para verificar regras de fim de semana
 * Retorna { permitido: boolean, mensagem: string }
 */
export function verificarRegrasFimDeSemana(dataAgendamento) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const diaSemanaHoje = hoje.getDay()

    const dataAgendamentoObj = new Date(dataAgendamento)
    dataAgendamentoObj.setHours(0, 0, 0, 0)

    if (diaSemanaHoje === 6) {
        if (dataAgendamentoObj.getTime() === hoje.getTime()) {
            return {
                permitido: false,
                mensagem: "Não é possível realizar agendamentos para esse sábado."
            }
        }

        const amanha = new Date(hoje)
        amanha.setDate(amanha.getDate() + 1)
        if (dataAgendamentoObj.getTime() === amanha.getTime()) {
            return {
                permitido: false,
                mensagem: "Não é possível realizar agendamentos para esse domingo."
            }
        }
    }

    if (diaSemanaHoje === 0) {
        if (dataAgendamentoObj.getTime() === hoje.getTime()) {
            return {
                permitido: false,
                mensagem: "Não é possível realizar agendamentos para esse domingo."
            }
        }

        const amanha = new Date(hoje)
        amanha.setDate(amanha.getDate() + 1)
        if (dataAgendamentoObj.getTime() === amanha.getTime()) {
            return {
                permitido: true,
                mensagem: ""
            }
        }
    }

    return { permitido: true, mensagem: "" }
}

/**
 * Validação para Agendamento Time
 */
export function validarAgendamentoTime(data) {
    const agora = new Date()

    if (data.isFeriado) {
        if (!data.dataFeriado) {
            return { permitido: true, mensagem: "" }
        }

        const verificarFimDeSemana = verificarRegrasFimDeSemana(data.dataFeriado)
        if (!verificarFimDeSemana.permitido) {
            return verificarFimDeSemana
        }

        const dataFeriado = new Date(data.dataFeriado)

        const hoje = new Date()
        const proximaSexta = new Date(hoje)
        const diasAteSexta = (5 - hoje.getDay() + 7) % 7
        proximaSexta.setDate(hoje.getDate() + diasAteSexta)
        proximaSexta.setHours(9, 0, 0, 0)

        const proximoDomingo = new Date(proximaSexta)
        proximoDomingo.setDate(proximaSexta.getDate() + 2)
        proximoDomingo.setHours(23, 59, 59, 999)

        if (dataFeriado >= proximaSexta && dataFeriado <= proximoDomingo) {
            if (agora > proximaSexta) {
                return {
                    permitido: false,
                    mensagem: "Programação de feriado para o próximo fim de semana: Agendar até sexta-feira às 09:00h.",
                }
            }
        }

        return { permitido: true, mensagem: "" }
    }

    if (!data.dataInicio) {
        return { permitido: true, mensagem: "" }
    }

    const verificarFimDeSemanaInicio = verificarRegrasFimDeSemana(data.dataInicio)
    if (!verificarFimDeSemanaInicio.permitido) {
        return verificarFimDeSemanaInicio
    }

    const dataInicio = new Date(data.dataInicio)
    const diaSemanaInicio = dataInicio.getDay()

    if (diaSemanaInicio === 0 || diaSemanaInicio === 6) {
        const hoje = new Date()
        const proximaSexta = new Date(hoje)
        const diasAteSexta = (5 - hoje.getDay() + 7) % 7
        proximaSexta.setDate(hoje.getDate() + diasAteSexta)
        proximaSexta.setHours(9, 0, 0, 0)

        const proximoDomingo = new Date(proximaSexta)
        proximoDomingo.setDate(proximaSexta.getDate() + 2)
        proximoDomingo.setHours(23, 59, 59, 999)

        if (dataInicio >= proximaSexta && dataInicio <= proximoDomingo) {
            if (agora > proximaSexta) {
                return {
                    permitido: false,
                    mensagem: "Programação do final de semana: Agendar até sexta-feira às 09:00h.",
                }
            }
        }
    }

    if (dataInicio.toDateString() === agora.toDateString()) {
        const limite = new Date(agora)
        limite.setHours(7, 30, 0, 0)
        if (agora > limite) {
            return {
                permitido: false,
                mensagem: "Agendamento para o mesmo dia: deve ser feito até às 07:30h da manhã.",
            }
        }
    }

    if (data.dataFim) {
        const verificarFimDeSemanaFim = verificarRegrasFimDeSemana(data.dataFim)
        if (!verificarFimDeSemanaFim.permitido) {
            return verificarFimDeSemanaFim
        }

        const dataFim = new Date(data.dataFim)
        const diaSemanaFim = dataFim.getDay()

        if (diaSemanaFim === 0 || diaSemanaFim === 6) {
            const hoje = new Date()
            const proximaSexta = new Date(hoje)
            const diasAteSexta = (5 - hoje.getDay() + 7) % 7
            proximaSexta.setDate(hoje.getDate() + diasAteSexta)
            proximaSexta.setHours(9, 0, 0, 0)

            const proximoDomingo = new Date(proximaSexta)
            proximoDomingo.setDate(proximaSexta.getDate() + 2)
            proximoDomingo.setHours(23, 59, 59, 999)

            if (dataFim >= proximaSexta && dataFim <= proximoDomingo) {
                if (agora > proximaSexta) {
                    return {
                        permitido: false,
                        mensagem: "Programação do final de semana: Agendar até sexta-feira às 09:00h.",
                    }
                }
            }
        }

        if (dataFim.toDateString() === agora.toDateString()) {
            const limite = new Date(agora)
            limite.setHours(7, 30, 0, 0)
            if (agora > limite) {
                return {
                    permitido: false,
                    mensagem: "Agendamento para o mesmo dia: deve ser feito até às 07:30h da manhã.",
                }
            }
        }
    }

    if (data.turno) {
        if (dataInicio.toDateString() === agora.toDateString()) {
            if (data.turno === "A") {
                const limiteLanche = new Date(agora)
                limiteLanche.setHours(9, 0, 0, 0)
                if (agora > limiteLanche) {
                    return {
                        permitido: false,
                        mensagem: "Lanche das 16h do dia solicitado: até 09:00h do mesmo dia.",
                    }
                }
            }
        }

        if (data.dataFim && data.dataFim.toDateString() === agora.toDateString()) {
            if (data.turno === "A") {
                const limiteLanche = new Date(agora)
                limiteLanche.setHours(9, 0, 0, 0)
                if (agora > limiteLanche) {
                    return {
                        permitido: false,
                        mensagem: "Lanche das 16h do dia solicitado: até 09:00h do mesmo dia.",
                    }
                }
            }
        }
    }

    return { permitido: true, mensagem: "" }
}

/**
 * Validação para Home Office
 */
export function validarHomeOffice(data) {
    const agora = new Date()

    if (!data.dataInicio) {
        return { permitido: true, mensagem: "" }
    }

    const verificarFimDeSemanaInicio = verificarRegrasFimDeSemana(data.dataInicio)
    if (!verificarFimDeSemanaInicio.permitido) {
        return verificarFimDeSemanaInicio
    }

    const dataInicio = new Date(data.dataInicio)
    const diaSemanaInicio = dataInicio.getDay()

    if (diaSemanaInicio === 0 || diaSemanaInicio === 6) {
        const hoje = new Date()
        const proximaSexta = new Date(hoje)
        const diasAteSexta = (5 - hoje.getDay() + 7) % 7
        proximaSexta.setDate(hoje.getDate() + diasAteSexta)
        proximaSexta.setHours(9, 0, 0, 0)

        const proximoDomingo = new Date(proximaSexta)
        proximoDomingo.setDate(proximaSexta.getDate() + 2)
        proximoDomingo.setHours(23, 59, 59, 999)

        if (dataInicio >= proximaSexta && dataInicio <= proximoDomingo) {
            if (agora > proximaSexta) {
                return {
                    permitido: false,
                    mensagem: "Programação do final de semana: Agendar até sexta-feira às 09:00h.",
                }
            }
        }
    }

    const amanha = new Date(agora)
    amanha.setDate(amanha.getDate() + 1)

    if (dataInicio.toDateString() === amanha.toDateString()) {
        return { permitido: true, mensagem: "" }
    }

    if (dataInicio.toDateString() === agora.toDateString()) {
        const limite = new Date(agora)
        limite.setHours(7, 30, 0, 0)
        if (agora > limite) {
            return {
                permitido: false,
                mensagem: "Agendamento para o mesmo dia: deve ser feito até às 07:30h da manhã.",
            }
        }

        if (data.refeicoes && data.refeicoes.length > 0) {
            if (data.refeicoes.some((r) => r.includes("Almoço"))) {
                const limiteAlmoco = new Date(agora)
                limiteAlmoco.setHours(7, 30, 0, 0)
                if (agora > limiteAlmoco) {
                    return {
                        permitido: false,
                        mensagem: "Almoço do dia solicitado: até 07:30h do mesmo dia.",
                    }
                }
            }

            if (data.refeicoes.some((r) => r.includes("Lanche"))) {
                const limiteLanche = new Date(agora)
                limiteLanche.setHours(9, 0, 0, 0)
                if (agora > limiteLanche) {
                    return {
                        permitido: false,
                        mensagem: "Lanche das 16h do dia solicitado: até 09:00h do mesmo dia.",
                    }
                }
            }

            if (data.refeicoes.some((r) => r.includes("Jantar") || r.includes("Ceia"))) {
                const limiteJantar = new Date(agora)
                limiteJantar.setHours(7, 30, 0, 0)
                if (agora > limiteJantar) {
                    return {
                        permitido: false,
                        mensagem: "Jantar e Ceia do dia solicitado: até 07:30h do mesmo dia.",
                    }
                }
            }
        }
    }

    if (data.dataFim) {
        // Verificar regras de fim de semana para data de fim
        const verificarFimDeSemanaFim = verificarRegrasFimDeSemana(data.dataFim)
        if (!verificarFimDeSemanaFim.permitido) {
            return verificarFimDeSemanaFim
        }

        const dataFim = new Date(data.dataFim)
        const diaSemanaFim = dataFim.getDay()

        if (diaSemanaFim === 0 || diaSemanaFim === 6) {
            const hoje = new Date()
            const proximaSexta = new Date(hoje)
            const diasAteSexta = (5 - hoje.getDay() + 7) % 7
            proximaSexta.setDate(hoje.getDate() + diasAteSexta)
            proximaSexta.setHours(9, 0, 0, 0)

            const proximoDomingo = new Date(proximaSexta)
            proximoDomingo.setDate(proximaSexta.getDate() + 2)
            proximoDomingo.setHours(23, 59, 59, 999)

            if (dataFim >= proximaSexta && dataFim <= proximoDomingo) {
                if (agora > proximaSexta) {
                    return {
                        permitido: false,
                        mensagem: "Programação do final de semana: Agendar até sexta-feira às 09:00h.",
                    }
                }
            }
        }

        if (dataFim.toDateString() === agora.toDateString()) {
            const limite = new Date(agora)
            limite.setHours(7, 30, 0, 0)
            if (agora > limite) {
                return {
                    permitido: false,
                    mensagem: "Agendamento para o mesmo dia: deve ser feito até às 07:30h da manhã.",
                }
            }

            if (data.refeicoes && data.refeicoes.length > 0) {
                if (data.refeicoes.some((r) => r.includes("Lanche"))) {
                    const limiteLanche = new Date(agora)
                    limiteLanche.setHours(9, 0, 0, 0)
                    if (agora > limiteLanche) {
                        return {
                            permitido: false,
                            mensagem: "Lanche das 16h do dia solicitado: até 09:00h do mesmo dia.",
                        }
                    }
                }
            }
        }
    }

    return { permitido: true, mensagem: "" }
}

/**
 * Validação para Solicitação Lanche
 */
export function validarSolicitacaoLanche(data) {
    const agora = new Date()
    const dataLanche = new Date(data.data)

    const verificarFimDeSemana = verificarRegrasFimDeSemana(data.data)
    if (!verificarFimDeSemana.permitido) {
        return verificarFimDeSemana
    }

    if (dataLanche.toDateString() === agora.toDateString()) {
        const limite = new Date(agora)
        limite.setHours(9, 0, 0, 0)
        if (agora > limite) {
            return {
                permitido: false,
                mensagem: "Lanche das 16h do dia solicitado: Até 09:00h do mesmo dia.",
            }
        }
    }

    const amanha = new Date(agora)
    amanha.setDate(amanha.getDate() + 1)

    if (dataLanche.toDateString() === amanha.toDateString()) {
        return { permitido: true, mensagem: "" }
    }

    return { permitido: true, mensagem: "" }
}

/**
 * Validação para Agendamento Visitante
 */
export function validarAgendamentoVisitante(data) {
    const agora = new Date()
    const dataVisitante = new Date(data.data)

    const verificarFimDeSemana = verificarRegrasFimDeSemana(data.data)
    if (!verificarFimDeSemana.permitido) {
        return verificarFimDeSemana
    }

    if (dataVisitante.toDateString() === agora.toDateString()) {
        const limite = new Date(agora)
        limite.setHours(7, 30, 0, 0)
        if (agora > limite) {
            return {
                permitido: false,
                mensagem: "Agendamento de visitante para o mesmo dia: deve ser feito até às 07:30h da manhã.",
            }
        }
    }

    return { permitido: true, mensagem: "" }
}

/**
 * Validação para Coffee Break
 */
export function validarCoffeeBreak(data) {
    const agora = new Date()
    const dataCoffee = new Date(data.dataCoffee)

    const diaAnterior = new Date(dataCoffee)
    diaAnterior.setDate(diaAnterior.getDate() - 1)
    diaAnterior.setHours(12, 0, 0, 0)

    if (agora > diaAnterior) {
        return {
            permitido: false,
            mensagem: "Coffee Break: Agendar até 12:00h o dia anterior.",
        }
    }

    return { permitido: true, mensagem: "" }
}

/**
 * Validação para Rota Extra
 */
export function validarRotaExtra(data) {
    const agora = new Date()
    const diaSemana = agora.getDay()

    if (data.dataInicio) {
        const verificarFimDeSemanaInicio = verificarRegrasFimDeSemana(data.dataInicio)
        if (!verificarFimDeSemanaInicio.permitido) {
            return verificarFimDeSemanaInicio
        }
    }

    if (data.dataFim) {
        const verificarFimDeSemanaFim = verificarRegrasFimDeSemana(data.dataFim)
        if (!verificarFimDeSemanaFim.permitido) {
            return verificarFimDeSemanaFim
        }
    }

    if (diaSemana === 5) {
        const limite = new Date(agora)
        limite.setHours(11, 0, 0, 0)
        if (agora > limite) {
            return {
                permitido: false,
                mensagem: "Rota Extra: Agendar até sexta-feira às 11:00h.",
            }
        }
    }

    return { permitido: true, mensagem: "" }
}
