import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar, Clock, Building, Utensils, FileText, Users } from "lucide-react"
import { TIMES_SETORES, verificarRegrasFimDeSemana } from "../../utils/validacoes-agendamento"

const HomeOfficeForm = ({ dados, onChange, onError }) => {
    const [formData, setFormData] = useState({
        timeSetor: "",
        dataInicio: null,
        dataFim: null,
        turno: "",
        refeitorio: "",
        refeicoes: [],
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
            }))
            return
        }
        setFormData((prev) => ({ ...prev, [field]: value }))
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
        const ehFinalDeSemana = diaSemana === 0 || diaSemana === 6

        if (ehFinalDeSemana) {
            if (agora.getDay() === 5) {
                const limite = new Date(agora)
                limite.setHours(9, 0, 0, 0)

                if (agora > limite) {
                    onError(
                        "Horário limite excedido",
                        "Em sextas-feiras, agendamentos para fins de semana devem ser feitos até às 09:00h.",
                    )
                    return false
                }
            }
        } else if (date.getTime() === hoje.getTime()) {
            const limiteAlmoco = new Date(hoje)
            limiteAlmoco.setHours(7, 30, 0, 0)

            const limiteLanche = new Date(hoje)
            limiteLanche.setHours(9, 0, 0, 0)

            if (formData.turno === "A" || formData.turno === "ADM") {
                if (agora > limiteAlmoco && formData.refeicoes.includes("Almoço")) {
                    onError("Horário limite excedido", "O horário limite para agendamento de almoço é até 07:30h do mesmo dia.")
                    return false
                }
                if (agora > limiteLanche && formData.refeicoes.includes("Lanche")) {
                    onError("Horário limite excedido", "O horário limite para agendamento de lanche é até 09:00h do mesmo dia.")
                    return false
                }
            } else if (formData.turno === "B") {
                if (agora > limiteAlmoco) {
                    onError(
                        "Horário limite excedido",
                        "O horário limite para agendamento de jantar e ceia é até 07:30h do mesmo dia.",
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

        if (formData.refeicoes.length === 0) {
            onError("Refeições não selecionadas", "Por favor, selecione pelo menos uma refeição antes de escolher a data.")
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

        setFormData((prev) => ({ ...prev, [field]: date }))
    }

    const handleRefeicaoChange = (refeicao, checked) => {
        setFormData((prev) => ({
            ...prev,
            refeicoes: checked ? [...prev.refeicoes, refeicao] : prev.refeicoes.filter((r) => r !== refeicao),
        }))
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

    const getRefeicoesPorTurno = () => {
        switch (formData.turno) {
            case "A":
                return ["Almoço", "Lanche"]
            case "B":
                return ["Jantar", "Ceia"]
            case "ADM":
                return ["Almoço", "Lanche"]
            default:
                return []
        }
    }

    const getCategoriaDia = (data) => {
        if (!data) return null

        const dataObj = new Date(data)
        const diasSemana = [
            "Domingo",
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado",
        ]
        return diasSemana[dataObj.getDay()]
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
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

            {formData.turno && (
                <div className="space-y-3 animate-in fade-in-50 duration-300">
                    <Label className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-emerald-600" />
                        Refeições:
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                        {getRefeicoesPorTurno().map((refeicao) => {

                            const isRequired = formData.turno === "ADM" ? refeicao === "Almoço" : true

                            return (
                                <div key={refeicao} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`checkbox${refeicao}`}
                                        checked={formData.refeicoes.includes(refeicao)}
                                        onCheckedChange={(checked) => handleRefeicaoChange(refeicao, checked)}
                                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                    />
                                    <Label htmlFor={`checkbox${refeicao}`} className="cursor-pointer">
                                        {refeicao}
                                        {!isRequired && <span className="text-gray-500 text-xs ml-1"></span>}
                                    </Label>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="dataInicio" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        Data Início:
                    </Label>
                    <DatePicker date={formData.dataInicio} onChange={(date) => handleDataChange("dataInicio", date)} />
                    {formData.dataInicio && <p className="text-xs text-gray-500">{getCategoriaDia(formData.dataInicio)}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataFim" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        Data Fim:
                    </Label>
                    <DatePicker date={formData.dataFim} onChange={(date) => handleDataChange("dataFim", date)} />
                    {formData.dataFim && <p className="text-xs text-gray-500">{getCategoriaDia(formData.dataFim)}</p>}
                </div>
            </div>

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

export default HomeOfficeForm
