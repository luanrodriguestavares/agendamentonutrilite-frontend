import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Switch } from "@/components/ui/switch"
import { Users, Calendar, Clock, FileText, DollarSign, AlertTriangle } from "lucide-react"
import { TIMES_SETORES, CENTROS_CUSTO, validarAgendamentoTime } from "../../utils/validacoes-agendamento"

const AgendamentoTimeForm = ({ dados, onChange, onError }) => {
    const [formData, setFormData] = useState({
        timeSetor: "",
        centroCusto: "",
        isFeriado: false,
        dataInicio: null,
        dataFim: null,
        dataFeriado: null,
        turno: "",
        quantidadeAlmocoLanche: "",
        quantidadeJantarCeia: "",
        quantidadeLancheExtra: "",
        observacao: "",
        ...dados,
    })

    useEffect(() => {
        onChange(formData)
    }, [formData, onChange])

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
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

    const handleDataChange = (field, date) => {
        if (!date) return

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
                    <Select value={formData.timeSetor} onValueChange={(value) => handleInputChange("timeSetor", value)}>
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
                    <Select value={formData.centroCusto} onValueChange={(value) => handleInputChange("centroCusto", value)}>
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

            <div className="space-y-2">
                <Label htmlFor="selectTurno" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    Turno:
                </Label>
                <Select value={formData.turno} onValueChange={(value) => handleInputChange("turno", value)}>
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

            {formData.turno === "A" && (
                <div className="space-y-2 animate-in fade-in-50 duration-300">
                    <Label htmlFor="quantidadeAlmocoLanche" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        Quantidade Almoço e Lanche:
                    </Label>
                    <Input
                        type="number"
                        id="quantidadeAlmocoLanche"
                        value={formData.quantidadeAlmocoLanche}
                        onChange={(e) => handleInputChange("quantidadeAlmocoLanche", e.target.value)}
                        min="0"
                        className="w-full"
                        placeholder="Número de pessoas"
                    />
                </div>
            )}

            {formData.turno === "B" && (
                <div className="space-y-2 animate-in fade-in-50 duration-300">
                    <Label htmlFor="quantidadeJantarCeia" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        Quantidade Jantar e Ceia:
                    </Label>
                    <Input
                        type="number"
                        id="quantidadeJantarCeia"
                        value={formData.quantidadeJantarCeia}
                        onChange={(e) => handleInputChange("quantidadeJantarCeia", e.target.value)}
                        min="0"
                        className="w-full"
                        placeholder="Número de pessoas"
                    />
                </div>
            )}

            {formData.turno === "ADM" && (
                <div className="space-y-2 animate-in fade-in-50 duration-300">
                    <Label htmlFor="quantidadeLancheExtra" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        Quantidade Lanche Extra:
                    </Label>
                    <Input
                        type="number"
                        id="quantidadeLancheExtra"
                        value={formData.quantidadeLancheExtra}
                        onChange={(e) => handleInputChange("quantidadeLancheExtra", e.target.value)}
                        min="0"
                        className="w-full"
                        placeholder="Número de pessoas"
                    />
                </div>
            )}

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
