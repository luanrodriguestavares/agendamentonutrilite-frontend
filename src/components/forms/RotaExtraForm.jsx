import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar, Users, DollarSign, MapPin, FileText } from "lucide-react"
import { TIMES_SETORES, CENTROS_CUSTO, validarRotaExtra, verificarRegrasFimDeSemana } from "../../utils/validacoes-agendamento"

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
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleDataChange = (field, date) => {
        if (!date) return

        const verificarFimDeSemana = verificarRegrasFimDeSemana(date)
        if (!verificarFimDeSemana.permitido) {
            onError("Agendamento não permitido", verificarFimDeSemana.mensagem)
            return
        }

        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        if (date < hoje) {
            onError("Data inválida", "A data não pode ser anterior à data atual.")
            return
        }

        if (field === "dataInicio") {
            const resultado = validarRotaExtra(formData)
            if (!resultado.permitido) {
                onError("Horário limite excedido", resultado.mensagem)
                return
            }
        }

        setFormData((prev) => ({ ...prev, [field]: date }))
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

            <div className="space-y-2">
                <Label htmlFor="selectDia" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    Dia:
                </Label>
                <Select value={formData.dia} onValueChange={(value) => handleInputChange("dia", value)}>
                    <SelectTrigger id="selectDia" className="w-full">
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Feriado">Feriado</SelectItem>
                        <SelectItem value="Sabado">Sábado</SelectItem>
                        <SelectItem value="Domingo">Domingo</SelectItem>
                        <SelectItem value="Dia Util">Dia útil</SelectItem>
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
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataFim" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        Data Fim:
                    </Label>
                    <DatePicker date={formData.dataFim} onChange={(date) => handleDataChange("dataFim", date)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="quantidadeTiangua" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        Quantidade de Pessoas Tianguá:
                    </Label>
                    <Input
                        type="number"
                        id="quantidadeTiangua"
                        value={formData.quantidadeTiangua}
                        onChange={(e) => handleInputChange("quantidadeTiangua", e.target.value)}
                        min="0"
                        className="w-full"
                        placeholder="Número de pessoas"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quantidadeUbajara" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        Quantidade de Pessoas Ubajara:
                    </Label>
                    <Input
                        type="number"
                        id="quantidadeUbajara"
                        value={formData.quantidadeUbajara}
                        onChange={(e) => handleInputChange("quantidadeUbajara", e.target.value)}
                        min="0"
                        className="w-full"
                        placeholder="Número de pessoas"
                    />
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
                    placeholder="Informações adicionais sobre a rota extra..."
                />
            </div>
        </div>
    )
}

export default RotaExtraForm
