import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar, Users, DollarSign, MapPin, FileText, Clock, Building, Coffee } from "lucide-react"
import { TIMES_SETORES, CENTROS_CUSTO, validarRotaExtra } from "../../utils/validacoes-agendamento"

const RotaExtraForm = ({ dados, onChange, onError }) => {
    const [formData, setFormData] = useState({
        timeSetor: "",
        centroCusto: "",
        dia: "",
        dataInicio: null,
        dataFim: null,
        quantidadeTiangua: "",
        quantidadeUbajara: "",
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

        const agora = new Date()
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)
        const dataAgendamento = new Date(date)
        dataAgendamento.setHours(0, 0, 0, 0)

        // Se for sexta-feira, aplica a restrição de horário
        if (agora.getDay() === 5) {
            const limite = new Date(agora)
            limite.setHours(11, 0, 0, 0)

            // Verifica se a data é para o fim de semana atual
            const sabado = new Date(hoje)
            while (sabado.getDay() !== 6) {
                sabado.setDate(sabado.getDate() + 1)
            }
            const domingo = new Date(sabado)
            domingo.setDate(sabado.getDate() + 1)

            if ((dataAgendamento.getTime() === sabado.getTime() || dataAgendamento.getTime() === domingo.getTime()) && agora > limite) {
                onError(
                    "Horário limite excedido",
                    "Em sextas-feiras, agendamentos para o fim de semana atual devem ser feitos até às 11:00h."
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

        // Verifica se é fim de semana
        const diaSemana = date.getDay()
        if (diaSemana !== 0 && diaSemana !== 6) {
            onError("Data inválida", "A rota extra só pode ser agendada para sábados e domingos.")
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
                            <SelectItem value="B">B</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="selectRefeitorio" className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-600" />
                        Refeitório:
                    </Label>
                    <Select value={formData.refeitorio} onValueChange={(value) => handleInputChange("refeitorio", value)} required>
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
                    placeholder="Jantar e Ceia"
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
                    placeholder="Informações adicionais sobre a rota extra..."
                />
            </div>
        </div>
    )
}

export default RotaExtraForm
