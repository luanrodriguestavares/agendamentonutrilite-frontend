import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Calendar, Clock, Building, FileText, DollarSign, AlertTriangle } from "lucide-react"
import { TIMES_SETORES, CENTROS_CUSTO, validarAgendamentoTime, verificarRegrasFimDeSemana } from "../../utils/validacoes-agendamento"

const AgendamentoTimeForm = ({ dados, onChange, onError }) => {
    const [formData, setFormData] = useState({
        timeSetor: "",
        centroCusto: "",
        isFeriado: false,
        turno: "",
        dataInicio: null,
        dataFim: null,
        dataFeriado: null,
        quantidadeAlmoco: "",
        quantidadeLanche: "",
        quantidadeJantar: "",
        quantidadeCeia: "",
        refeitorio: "",
        observacao: "",
        diasSemana: [],
        ...dados,
    })

    useEffect(() => {
        onChange(formData)
    }, [formData, onChange])

    const handleInputChange = (field, value) => {
        if (field === "turno") {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
                dataInicio: null,
                dataFim: null,
                dataFeriado: null,
            }))
            return
        }
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleDiaSemanaChange = (dia, checked) => {
        setFormData((prev) => {
            if (checked) {
                return {
                    ...prev,
                    diasSemana: [...prev.diasSemana, dia]
                }
            } else {
                return {
                    ...prev,
                    diasSemana: prev.diasSemana.filter(d => d !== dia)
                }
            }
        })
    }

    const handleFeriadoToggle = (checked) => {
        if (checked) {
            setFormData((prev) => ({
                ...prev,
                isFeriado: true,
                dataInicio: null,
                dataFim: null,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                isFeriado: false,
                dataFeriado: null,
            }))
        }
    }

    const validarHorarioAgendamento = (date) => {
        if (!formData.turno) {
            onError("Turno não selecionado", "Por favor, selecione o turno antes de escolher a data.")
            return false
        }

        const verificarFimDeSemana = verificarRegrasFimDeSemana(date)
        if (!verificarFimDeSemana.permitido) {
            onError("Agendamento não permitido", verificarFimDeSemana.mensagem)
            return false
        }

        const agora = new Date()
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        const diaSemana = date.getDay()
        const ehFinalDeSemana = diaSemana === 0 || diaSemana === 6 || formData.isFeriado

        const ehProximoFinalDeSemana = (dataVerificar) => {
            const dataAtual = new Date(agora)
            const proximaSexta = new Date(dataAtual)

            while (proximaSexta.getDay() !== 5) {
                proximaSexta.setDate(proximaSexta.getDate() + 1)
            }

            const inicioProximoFds = new Date(proximaSexta)
            inicioProximoFds.setDate(proximaSexta.getDate() + 1)
            inicioProximoFds.setHours(0, 0, 0, 0)

            const fimProximoFds = new Date(inicioProximoFds)
            fimProximoFds.setDate(inicioProximoFds.getDate() + 1)
            fimProximoFds.setHours(23, 59, 59, 999)

            const dataVerificarInicio = new Date(dataVerificar)
            dataVerificarInicio.setHours(0, 0, 0, 0)

            return dataVerificarInicio >= inicioProximoFds && dataVerificarInicio <= fimProximoFds
        }

        if (ehFinalDeSemana && ehProximoFinalDeSemana(date)) {
            if (agora.getDay() === 5) {
                const limite = new Date(agora)
                limite.setHours(9, 0, 0, 0)

                if (agora > limite) {
                    onError(
                        "Horário limite excedido",
                        "Em sextas-feiras, agendamentos para o próximo fim de semana devem ser feitos até às 09:00h."
                    )
                    return false
                }
            }
        } else if (date.getTime() === hoje.getTime()) {
            const limiteAlmoco = new Date(hoje)
            limiteAlmoco.setHours(7, 30, 0, 0)

            const limiteLanche = new Date(hoje)
            limiteLanche.setHours(9, 0, 0, 0)

            if (formData.turno === "A") {
                if (agora > limiteAlmoco) {
                    onError(
                        "Horário limite excedido",
                        "O horário limite para agendamento de almoço é até 07:30h do mesmo dia."
                    )
                    return false
                }
                if (agora > limiteLanche) {
                    onError(
                        "Horário limite excedido",
                        "O horário limite para agendamento de lanche é até 09:00h do mesmo dia."
                    )
                    return false
                }
            } else if (formData.turno === "B") {
                if (agora > limiteAlmoco) {
                    onError(
                        "Horário limite excedido",
                        "O horário limite para agendamento de jantar e ceia é até 07:30h do mesmo dia."
                    )
                    return false
                }
            }
        }

        return true
    }

    const handleDataChange = (field, date) => {
        if (!date) return

        if (!formData.turno) {
            onError("Turno não selecionado", "Por favor, selecione o turno antes de escolher a data.")
            return
        }

        if (field === "dataFim" && !formData.dataInicio) {
            onError("Sequência inválida", "Por favor, selecione a data de início primeiro.")
            return
        }

        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        if (date < hoje) {
            onError("Data inválida", "A data não pode ser anterior à data atual.")
            return
        }

        if (field === "dataFim" && formData.dataInicio && date < formData.dataInicio) {
            onError("Data inválida", "A data de fim não pode ser anterior à data de início.")
            return
        }

        if (!validarHorarioAgendamento(date)) {
            return
        }

        const updatedFormData = {
            ...formData,
            [field]: date,
        }

        const resultado = validarAgendamentoTime(updatedFormData)

        if (!resultado.permitido) {
            onError("Horário limite excedido", resultado.mensagem)
            return
        }

        setFormData(updatedFormData)
    }

    const getCategoriaDia = () => {
        if (formData.isFeriado) return "Feriado"

        if (!formData.dataInicio) return null

        const data = new Date(formData.dataInicio)
        const diasSemana = [
            "Domingo",
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado",
        ]
        return diasSemana[data.getDay()]
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="selectTimeSetor" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        Time/Setor:
                    </Label>
                    <Select value={formData.timeSetor} onValueChange={(value) => handleInputChange("timeSetor", value)} required>
                        <SelectTrigger id="selectTimeSetor" className="w-full">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {TIMES_SETORES.map((time) => (
                                <SelectItem key={time} value={time}>
                                    {time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="selectCentroCusto" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        Centro de Custo:
                    </Label>
                    <Select value={formData.centroCusto} onValueChange={(value) => handleInputChange("centroCusto", value)} required>
                        <SelectTrigger id="selectCentroCusto" className="w-full">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {CENTROS_CUSTO.map((centro) => (
                                <SelectItem key={centro} value={centro}>
                                    {centro}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                    <Label htmlFor="feriadoToggle" className="text-sm font-medium text-emerald-800">
                        Este agendamento é para um feriado?
                    </Label>
                    <p className="text-xs text-emerald-600 mt-1">Marque esta opção se o agendamento for para um dia de feriado</p>
                </div>
                <Switch id="feriadoToggle" checked={formData.isFeriado} onCheckedChange={handleFeriadoToggle} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="selectTurno" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    Turno:
                </Label>
                <Select value={formData.turno} onValueChange={(value) => handleInputChange("turno", value)} required>
                    <SelectTrigger id="selectTurno" className="w-full">
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="ADM">ADM</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {!formData.isFeriado ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="dataInicio" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            Data Início:
                        </Label>
                        <DatePicker date={formData.dataInicio} onChange={(date) => handleDataChange("dataInicio", date)} />
                        {getCategoriaDia() && <p className="text-xs text-gray-500">{getCategoriaDia()}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dataFim" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            Data Fim:
                        </Label>
                        <DatePicker date={formData.dataFim} onChange={(date) => handleDataChange("dataFim", date)} />
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="dataFeriado" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        Data do Feriado:
                    </Label>
                    <DatePicker date={formData.dataFeriado} onChange={(date) => handleDataChange("dataFeriado", date)} />
                    <p className="text-xs text-gray-500">Feriado</p>
                </div>
            )}

            {!formData.isFeriado && (
                <div className="space-y-3 animate-in fade-in-50 duration-300">
                    <Label className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        Dias da Semana:
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { value: "segunda", label: "Segunda-feira" },
                            { value: "terca", label: "Terça-feira" },
                            { value: "quarta", label: "Quarta-feira" },
                            { value: "quinta", label: "Quinta-feira" },
                            { value: "sexta", label: "Sexta-feira" },
                            { value: "sabado", label: "Sábado" },
                            { value: "domingo", label: "Domingo" }
                        ].map((dia) => (
                            <div key={dia.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`dia-${dia.value}`}
                                    checked={formData.diasSemana.includes(dia.value)}
                                    onCheckedChange={(checked) => handleDiaSemanaChange(dia.value, checked)}
                                />
                                <Label htmlFor={`dia-${dia.value}`} className="text-sm">
                                    {dia.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {formData.turno === "A" && (
                <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <div className="space-y-2">
                        <Label htmlFor="quantidadeAlmoco" className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-600" />
                            Quantidade de Almoço:
                        </Label>
                        <Input
                            type="number"
                            id="quantidadeAlmoco"
                            value={formData.quantidadeAlmoco}
                            onChange={(e) => handleInputChange("quantidadeAlmoco", e.target.value)}
                            min="0"
                            className="w-full"
                            placeholder="Número de pessoas"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="quantidadeLanche" className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-600" />
                            Quantidade de Lanche: 
                        </Label>
                        <Input
                            type="number"
                            id="quantidadeLanche"
                            value={formData.quantidadeLanche}
                            onChange={(e) => handleInputChange("quantidadeLanche", e.target.value)}
                            min="0"
                            className="w-full"
                            placeholder="Número de pessoas"
                        />
                    </div>
                </div>
            )}

            {formData.turno === "B" && (
                <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <div className="space-y-2">
                        <Label htmlFor="quantidadeJantar" className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-600" />
                            Quantidade de Jantar:
                        </Label>
                        <Input
                            type="number"
                            id="quantidadeJantar"
                            value={formData.quantidadeJantar}
                            onChange={(e) => handleInputChange("quantidadeJantar", e.target.value)}
                            min="0"
                            className="w-full"
                            placeholder="Número de pessoas"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="quantidadeCeia" className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-600" />
                            Quantidade de Ceia: 
                        </Label>
                        <Input
                            type="number"
                            id="quantidadeCeia"
                            value={formData.quantidadeCeia}
                            onChange={(e) => handleInputChange("quantidadeCeia", e.target.value)}
                            min="0"
                            className="w-full"
                            placeholder="Número de pessoas"
                        />
                    </div>
                </div>
            )}

            {formData.turno === "ADM" && (
                <div className="space-y-2 animate-in fade-in-50 duration-300">
                    <Label htmlFor="quantidadeAlmoco" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        Quantidade de Almoço:
                    </Label>
                    <Input
                        type="number"
                        id="quantidadeAlmoco"
                        value={formData.quantidadeAlmoco}
                        onChange={(e) => handleInputChange("quantidadeAlmoco", e.target.value)}
                        min="0"
                        className="w-full"
                        placeholder="Número de pessoas"
                        required
                    />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="selectRefeitorio" className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-600" />
                        Refeitório:
                    </Label>
                    <Select
                        value={formData.refeitorio}
                        onValueChange={(value) => handleInputChange("refeitorio", value)}
                        required
                    >
                        <SelectTrigger id="selectRefeitorio" className="w-full">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Fazenda">Fazenda</SelectItem>
                            <SelectItem value="Industria">Indústria</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="observacao" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Observação:
                </Label>
                <Textarea
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => handleInputChange("observacao", e.target.value)}
                    rows={3}
                    className="w-full resize-none"
                    placeholder="Informações adicionais sobre o agendamento..."
                />
            </div>
        </div>
    )
}

export default AgendamentoTimeForm
