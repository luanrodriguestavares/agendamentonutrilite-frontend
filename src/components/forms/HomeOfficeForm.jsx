import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar, Clock, Building, Utensils, FileText, Users } from "lucide-react"
import { TIMES_SETORES, validarHomeOffice } from "../../utils/validacoes-agendamento"

const HomeOfficeForm = ({ dados, onChange, onError }) => {
    const [formData, setFormData] = useState({
        timeSetor: "",
        dataInicio: null,
        dataFim: null,
        turno: "",
        refeitorio: "",
        refeicoes: [],
        observacao: "",
        ...dados,
    })

    useEffect(() => {
        onChange(formData)
    }, [formData, onChange])

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
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

        const dadosValidacao = { ...formData, [field]: date }
        const resultado = validarHomeOffice(dadosValidacao)

        if (!resultado.permitido) {
            onError("Horário limite excedido", resultado.mensagem)
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="dataInicio" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        Data Início:
                    </Label>
                    <DatePicker date={formData.dataInicio} onChange={(date) => handleDataChange("dataInicio", date)} />
                    {formData.dataInicio && (
                        <p className="text-xs text-gray-500">{getCategoriaDia(formData.dataInicio)}</p>
                    )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="space-y-2">
                    <Label htmlFor="selectRefeitorio" className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-600" />
                        Refeitório:
                    </Label>
                    <Select value={formData.refeitorio} onValueChange={(value) => handleInputChange("refeitorio", value)}>
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

            {formData.turno && (
                <div className="space-y-3 animate-in fade-in-50 duration-300">
                    <Label className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-emerald-600" />
                        Refeições:
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                        {getRefeicoesPorTurno().map((refeicao) => (
                            <div key={refeicao} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`checkbox${refeicao}`}
                                    checked={formData.refeicoes.includes(refeicao)}
                                    onCheckedChange={(checked) => handleRefeicaoChange(refeicao, checked)}
                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                                <Label htmlFor={`checkbox${refeicao}`} className="cursor-pointer">
                                    {refeicao}
                                </Label>
                            </div>
                        ))}
                    </div>
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

export default HomeOfficeForm
