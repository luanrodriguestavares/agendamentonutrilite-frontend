import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar, Clock, Building, Coffee, FileText, Users } from "lucide-react"
import { TIMES_SETORES, validarSolicitacaoLanche, verificarRegrasFimDeSemana } from "../../utils/validacoes-agendamento"

const SolicitacaoLancheForm = ({ dados, onChange, onError }) => {
    const [formData, setFormData] = useState({
        timeSetor: "",
        data: null,
        turno: "",
        refeitorio: "Industria",
        refeicoes: "Lanche Individual",
        observacao: "",
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
                data: null,
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
        const dataAgendamento = new Date(date)
        dataAgendamento.setHours(0, 0, 0, 0)

        const diaSemanaAgendamento = dataAgendamento.getDay()
        const ehFimDeSemana = diaSemanaAgendamento === 0 || diaSemanaAgendamento === 6

        if (ehFimDeSemana) {
            const proximoSabado = new Date(hoje)
            proximoSabado.setDate(hoje.getDate() + (6 - hoje.getDay()))

            const proximoDomingo = new Date(proximoSabado)
            proximoDomingo.setDate(proximoSabado.getDate() + 1)

            const ehProximoFimDeSemana =
                dataAgendamento.getTime() === proximoSabado.getTime() ||
                dataAgendamento.getTime() === proximoDomingo.getTime()

            if (ehProximoFimDeSemana && agora.getDay() === 5) {
                const limite = new Date()
                limite.setHours(9, 0, 0, 0)

                if (agora > limite) {
                    onError(
                        "Horário limite excedido",
                        "Agendamentos para o próximo fim de semana devem ser feitos até às 09:00h da sexta-feira."
                    )
                    return false
                }
            }
        } else if (dataAgendamento.getTime() === hoje.getTime()) {
            const limite = new Date(hoje)
            limite.setHours(9, 0, 0, 0)

            if (agora > limite) {
                onError(
                    "Horário limite excedido",
                    "O horário limite para agendamento de lanche no mesmo dia é até 09:00h."
                )
                return false
            }
        }

        return true
    }

    const handleDataChange = (date) => {
        if (!date) return

        if (!formData.turno) {
            onError("Turno não selecionado", "Por favor, selecione o turno antes de escolher a data.")
            return
        }

        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        if (date < hoje) {
            onError("Data inválida", "A data não pode ser anterior à data atual.")
            return
        }

        if (!validarHorarioAgendamento(date)) {
            return
        }

        setFormData((prev) => ({ ...prev, data: date }))
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <SelectItem value="ADM">ADM</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="refeitorio" className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-600" />
                        Refeitório:
                    </Label>
                    <Input
                        id="refeitorio"
                        value="Indústria"
                        disabled
                        className="w-full bg-gray-100"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    Data:
                </Label>
                <DatePicker date={formData.data} onChange={handleDataChange} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="refeicoes" className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-emerald-600" />
                    Refeições:
                </Label>
                <Input
                    id="refeicoes"
                    value={formData.refeicoes}
                    disabled
                    className="w-full bg-gray-100"
                    placeholder="Lanche Individual"
                />
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
                    placeholder="Informações adicionais sobre o lanche..."
                />
            </div>
        </div>
    )
}

export default SolicitacaoLancheForm
