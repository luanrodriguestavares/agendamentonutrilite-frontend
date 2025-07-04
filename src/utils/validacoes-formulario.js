import { validarAgendamentoTime as validarAgendamentoTimeHorario, validarHomeOffice as validarHomeOfficeHorario, validarSolicitacaoLanche as validarSolicitacaoLancheHorario, validarCoffeeBreak as validarCoffeeBreakHorario, validarRotaExtra as validarRotaExtraHorario } from "./validacoes-agendamento"

export const validarCamposObrigatorios = (formData) => {
    const erros = []

    if (!formData.nome?.trim()) {
        erros.push("Nome é obrigatório")
    }
    if (!formData.email?.trim()) {
        erros.push("Email é obrigatório")
    }
    if (!formData.tipoServico?.trim()) {
        erros.push("Tipo de serviço é obrigatório")
    }
    if (!formData.tipoAgendamento?.trim()) {
        erros.push("Tipo de agendamento é obrigatório")
    }

    return erros
}

export const validarHomeOffice = (formData) => {
    const erros = []

    if (!formData.timeSetor?.trim()) {
        erros.push("Time/Setor é obrigatório")
    }
    if (!formData.turno?.trim()) {
        erros.push("Turno é obrigatório")
    }
    if (!formData.dataInicio) {
        erros.push("Data de início é obrigatória")
    }
    if (!formData.dataFim) {
        erros.push("Data de fim é obrigatória")
    }
    if (!formData.refeitorio?.trim()) {
        erros.push("Refeitório é obrigatório")
    }

    if (!formData.refeicoes || formData.refeicoes.length === 0) {
        erros.push("Pelo menos uma refeição deve ser selecionada")
    } else {
        const refeicoesPermitidas = {
            A: ["Almoço", "Lanche"],
            B: ["Jantar", "Ceia"],
            ADM: ["Almoço"]
        }

        const refeicoesDoTurno = refeicoesPermitidas[formData.turno] || []
        const refeicoesSelecionadas = formData.refeicoes

        const temRefeicaoValida = refeicoesSelecionadas.some(refeicao =>
            refeicoesDoTurno.includes(refeicao)
        )

        if (!temRefeicaoValida) {
            erros.push(`Para o turno ${formData.turno}, selecione pelo menos uma das refeições: ${refeicoesDoTurno.join(", ")}`)
        }
    }

    const validacaoHorario = validarHomeOfficeHorario(formData)
    if (!validacaoHorario.permitido) {
        erros.push(`Horário limite excedido: ${validacaoHorario.mensagem}`)
    }

    return erros
}

export const validarAgendamentoTime = (formData) => {
    const erros = []

    if (!formData.timeSetor?.trim()) {
        erros.push("Time/Setor é obrigatório")
    }
    if (!formData.centroCusto?.trim()) {
        erros.push("Centro de custo é obrigatório")
    }
    if (!formData.turno?.trim()) {
        erros.push("Turno é obrigatório")
    }
    if (!formData.refeitorio?.trim()) {
        erros.push("Refeitório é obrigatório")
    }

    if (formData.isFeriado) {
        if (!formData.dataFeriado) {
            erros.push("Data do feriado é obrigatória")
        }
    } else {
        if (!formData.dataInicio) {
            erros.push("Data de início é obrigatória")
        }
        if (!formData.dataFim) {
            erros.push("Data de fim é obrigatória")
        }
    }

    if (formData.turno === "A") {
        if (!formData.quantidadeAlmocoLanche || formData.quantidadeAlmocoLanche <= 0) {
            erros.push("Quantidade de Almoço e Lanche é obrigatória para o turno A")
        }
    } else if (formData.turno === "B") {
        if (!formData.quantidadeJantarCeia || formData.quantidadeJantarCeia <= 0) {
            erros.push("Quantidade de Jantar e Ceia é obrigatória para o turno B")
        }
    } else if (formData.turno === "ADM") {
        if (!formData.quantidadeLancheExtra || formData.quantidadeLancheExtra <= 0) {
            erros.push("Quantidade de Lanche Extra é obrigatória para o turno ADM")
        }
    }

    const validacaoHorario = validarAgendamentoTimeHorario(formData)
    if (!validacaoHorario.permitido) {
        erros.push(`Horário limite excedido: ${validacaoHorario.mensagem}`)
    }

    return erros
}

export const validarLancheIndividual = (formData) => {
    const erros = []

    if (!formData.timeSetor?.trim()) {
        erros.push("Time/Setor é obrigatório")
    }
    if (!formData.turno?.trim()) {
        erros.push("Turno é obrigatório")
    }
    if (!formData.refeitorio?.trim()) {
        erros.push("Refeitório é obrigatório")
    }
    if (!formData.data) {
        erros.push("Data é obrigatória")
    }
    if (!formData.refeicoes?.trim()) {
        erros.push("Refeições é obrigatório")
    }

    const validacaoHorario = validarSolicitacaoLancheHorario(formData)
    if (!validacaoHorario.permitido) {
        erros.push(`Horário limite excedido: ${validacaoHorario.mensagem}`)
    }

    return erros
}

export const validarVisitante = (formData) => {
    const erros = []

    if (!formData.acompanhante?.trim()) {
        erros.push("Nome do acompanhante é obrigatório")
    }
    if (!formData.quantidadeVisitantes || formData.quantidadeVisitantes <= 0) {
        erros.push("Quantidade de visitantes é obrigatória")
    }
    if (!formData.turno?.trim()) {
        erros.push("Turno é obrigatório")
    }
    if (!formData.refeitorio?.trim()) {
        erros.push("Refeitório é obrigatório")
    }
    if (!formData.data) {
        erros.push("Data é obrigatória")
    }
    if (!formData.refeicoes?.trim()) {
        erros.push("Refeições é obrigatório")
    }

    return erros
}

export const validarCoffeeBreak = (formData) => {
    const erros = []

    if (!formData.timeSetor?.trim()) {
        erros.push("Time/Setor é obrigatório")
    }
    if (!formData.turno?.trim()) {
        erros.push("Turno é obrigatório")
    }
    if (!formData.cardapio?.trim()) {
        erros.push("Cardápio é obrigatório")
    }
    if (!formData.quantidade || formData.quantidade <= 0) {
        erros.push("Quantidade é obrigatória")
    }
    if (!formData.centroCusto?.trim()) {
        erros.push("Centro de custo é obrigatório")
    }
    if (!formData.rateio?.trim()) {
        erros.push("Rateio é obrigatório")
    }
    if (!formData.dataCoffee) {
        erros.push("Data é obrigatória")
    }
    if (!formData.horario?.trim()) {
        erros.push("Horário é obrigatório")
    }
    if (!formData.refeicoes?.trim()) {
        erros.push("Refeições é obrigatório")
    }
    if (!formData.localEntrega?.trim()) {
        erros.push("Local de entrega é obrigatório")
    }

    const validacaoHorario = validarCoffeeBreakHorario(formData)
    if (!validacaoHorario.permitido) {
        erros.push(`Horário limite excedido: ${validacaoHorario.mensagem}`)
    }

    return erros
}

export const validarRotaExtra = (formData) => {
    const erros = []

    if (!formData.timeSetor?.trim()) {
        erros.push("Time/Setor é obrigatório")
    }
    if (!formData.centroCusto?.trim()) {
        erros.push("Centro de custo é obrigatório")
    }
    if (!formData.dia?.trim()) {
        erros.push("Dia é obrigatório")
    }
    if (!formData.dataInicio) {
        erros.push("Data de início é obrigatória")
    }
    if (!formData.dataFim) {
        erros.push("Data de fim é obrigatória")
    }
    if (formData.quantidadeTiangua === undefined || formData.quantidadeTiangua === null || formData.quantidadeTiangua === "") {
        erros.push("Quantidade de Tianguá é obrigatória")
    }
    if (formData.quantidadeUbajara === undefined || formData.quantidadeUbajara === null || formData.quantidadeUbajara === "") {
        erros.push("Quantidade de Ubajara é obrigatória")
    }

    const validacaoHorario = validarRotaExtraHorario(formData)
    if (!validacaoHorario.permitido) {
        erros.push(`Horário limite excedido: ${validacaoHorario.mensagem}`)
    }

    return erros
}

export const validarFormulario = (formData) => {
    let erros = []

    const errosBasicos = validarCamposObrigatorios(formData)
    erros = erros.concat(errosBasicos)

    switch (formData.tipoAgendamento) {
        case "Home Office":
            const errosHomeOffice = validarHomeOffice(formData)
            erros = erros.concat(errosHomeOffice)
            break
        case "Agendamento para Time":
            const errosTime = validarAgendamentoTime(formData)
            erros = erros.concat(errosTime)
            break
        case "Administrativo - Lanche":
            const errosLanche = validarLancheIndividual(formData)
            erros = erros.concat(errosLanche)
            break
        case "Agendamento para Visitante":
            const errosVisitante = validarVisitante(formData)
            erros = erros.concat(errosVisitante)
            break
        case "Coffee Break":
            const errosCoffee = validarCoffeeBreak(formData)
            erros = erros.concat(errosCoffee)
            break
        case "Rota Extra":
            const errosRota = validarRotaExtra(formData)
            erros = erros.concat(errosRota)
            break
        default:
            erros.push("Tipo de agendamento não reconhecido")
    }

    return {
        valido: erros.length === 0,
        erros: erros
    }
}
