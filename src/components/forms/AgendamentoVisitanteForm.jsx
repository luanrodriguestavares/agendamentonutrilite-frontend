import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar, Building, Users, User, FileText, Clock, Coffee, DollarSign, AlertCircle } from "lucide-react"
import { verificarRegrasFimDeSemana, CENTROS_CUSTO } from "../../utils/validacoes-agendamento"

const AgendamentoVisitanteForm = ({ dados, onChange, onError }) => {
    const [formData, setFormData] = useState({
        data: null,
        refeitorio: "",
        quantidadeVisitantes: "",
        acompanhante: "",
        centroCusto: "",
        rateio: "",
        observacao: "",
        turno: "",
        refeicoes: "Almoço",
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
        const amanha = new Date(hoje)
        amanha.setDate(amanha.getDate() + 1)

        if (date.getTime() === hoje.getTime()) {
            const limite = new Date(hoje)
            limite.setHours(7, 30, 0, 0)

            if (agora > limite) {
                onError("Horário limite excedido", "O horário limite para agendamento de visitante no mesmo dia é até 07:30h.")
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
                <Label htmlFor="nomeAcompanhante" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    Nome do Acompanhante:
                </Label>
                <Input
                    id="nomeAcompanhante"
                    value={formData.acompanhante}
                    onChange={(e) => handleInputChange("acompanhante", e.target.value)}
                    className="w-full"
                    placeholder="Digite o nome do acompanhante"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="quantidadeVisitantes" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    Quantidade de Visitantes:
                </Label>
                <Input
                    id="quantidadeVisitantes"
                    type="number"
                    min="1"
                    value={formData.quantidadeVisitantes}
                    onChange={(e) => handleInputChange("quantidadeVisitantes", e.target.value)}
                    className="w-full"
                    placeholder="Digite a quantidade de visitantes"
                    required
                />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="selectCentroCusto" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        Centro de Custo:
                    </Label>
                    <Select
                        value={formData.centroCusto}
                        onValueChange={(value) => handleInputChange("centroCusto", value)}
                        required
                    >
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

                <div className="space-y-2">
                    <Label htmlFor="selectRateio" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        Haverá rateio?
                    </Label>
                    <Select
                        value={formData.rateio}
                        onValueChange={(value) => handleInputChange("rateio", value)}
                        required
                    >
                        <SelectTrigger id="selectRateio" className="w-full">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Sim">Sim</SelectItem>
                            <SelectItem value="Não">Não</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {formData.rateio === "Sim" && (
                <p className="text-sm bg-green-100 border border-green-900/30 rounded-lg p-3 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    Por favor, informe os centros de custo para rateio no campo de observações.
                </p>
            )}

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
                    placeholder="Almoço (fixo para visitantes)"
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
                    placeholder={formData.rateio === "Sim" ? "Informe os centros de custo para rateio..." : "Informações adicionais sobre o visitante..."}
                    required={formData.rateio === "Sim"}
                />
            </div>
        </div>
    )
}

export default AgendamentoVisitanteForm
