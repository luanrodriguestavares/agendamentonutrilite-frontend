/**
 * Validações específicas para cada tipo de agendamento
 */

// Centros de custo disponíveis
export const CENTROS_CUSTO = [
    "101002-SUPPLY",
    "101003-SUPPLY",
    "101004-RH",
    "101005-OPEX",
    "101007-OPEX",
    "101009-SUPPLY",
    "101010-ENGENHARIA",
    "101011-ENGENHARIA",
    "102000-PESQUISA",
    "201001-MANUFATURA",
    "201002-MANUFATURA",
    "201003-MANUFATURA",
    "201004-MANUFATURA",
    "201006-MANUFATURA",
    "201007-MANUTENÇÃO",
    "201008-SUPPLY",
    "201009-SUPPLY",
    "201011-GPM",
    "201012-QUALIDADE",
    "201013-QUALIDADE",
    "301001-AGRO",
    "301002-AGRO",
    "301006-AGRO",
    "301007-MANUTENÇÃO",
    "301009-AGRO",
    "401001-OPEX",
    "401003-OPEX",
    "401004-MANUTENÇÃO",
    "401005-AGRO",
    "401006-AGRO",
    "401007-MANUTENÇÃO",
    "401009-MANUTENÇÃO",
    "401010-OPEX",
]

// Times/Setores disponíveis
export const TIMES_SETORES = [
    "Agro",
    "Manufatura",
    "Manutenção",
    "Engenharia",
    "Opex",
    "Logistica",
    "Qualidade",
    "RH",
    "Pesquisa",
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
                mensagem: "Não é possível realizar agendamentos para sábados."
            }
        }

        const amanha = new Date(hoje)
        amanha.setDate(amanha.getDate() + 1)
        if (dataAgendamentoObj.getTime() === amanha.getTime()) {
            return {
                permitido: false,
                mensagem: "Não é possível realizar agendamentos para domingos."
            }
        }
    }

    if (diaSemanaHoje === 0) {
        if (dataAgendamentoObj.getTime() === hoje.getTime()) {
            return {
                permitido: false,
                mensagem: "Não é possível realizar agendamentos para domingos."
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
