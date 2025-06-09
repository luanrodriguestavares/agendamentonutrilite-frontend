import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Calendar, Building, Users, User, DollarSign, FileText } from "lucide-react"
import { CENTROS_CUSTO } from "../../utils/validacoes-agendamento"

const AgendamentoVisitanteForm = ({ dados, onChange, onError }) => {
    const [formData, setFormData] = useState({
        data: null,
        refeitorio: "",
        quantidadeVisitantes: "",
        acompanhante: "",
        centroCusto: "",
        observacao: "",
        ...dados,
    })

    useEffect(() => {
        onChange(formData)
    }, [formData, onChange])

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleDataChange = (date) => {
        if (!date) return

        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        if (date < hoje) {
            onError("Data inválida", "A data não pode ser anterior à data atual.")
            return
        }

        if (date.toDateString() === hoje.toDateString()) {
            const agora = new Date()
            const limite = new Date(agora)
            limite.setHours(7, 30, 0, 0)

            if (agora > limite) {
                onError(
                    "Horário limite excedido",
                    "Se o agendamento for realizado no mesmo dia da visita, ele só poderá ser feito até às 7h30 da manhã. Por favor, entre em contato com servicosnutriliteagendamento@gmail.com.",
                )
                return
            }
        }

        setFormData((prev) => ({ ...prev, data: date }))
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    Data da visita:
                </Label>
                <DatePicker date={formData.data} onChange={handleDataChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="space-y-2">
                    <Label htmlFor="quantidadeVisitantes" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        Quantidades de Visitantes:
                    </Label>
                    <Input
                        type="number"
                        id="quantidadeVisitantes"
                        value={formData.quantidadeVisitantes}
                        onChange={(e) => handleInputChange("quantidadeVisitantes", e.target.value)}
                        min="0"
                        className="w-full"
                        placeholder="Número de visitantes"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="acompanhante" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    Quem irá acompanhar?
                </Label>
                <Input
                    type="text"
                    id="acompanhante"
                    value={formData.acompanhante}
                    onChange={(e) => handleInputChange("acompanhante", e.target.value)}
                    className="w-full"
                    placeholder="Nome do acompanhante"
                />
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
                    placeholder="Informações adicionais sobre a visita..."
                />
            </div>
        </div>
    )
}

export default AgendamentoVisitanteForm
