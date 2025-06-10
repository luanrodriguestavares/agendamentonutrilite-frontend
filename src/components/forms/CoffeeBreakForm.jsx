import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { TimeInput } from "@/components/ui/time-input"
import { Calendar, Clock, Coffee, Users, DollarSign, MapPin, FileText, AlertCircle, Building } from "lucide-react"
import { TIMES_SETORES, CENTROS_CUSTO, validarCoffeeBreak } from "../../utils/validacoes-agendamento"

const CoffeeBreakForm = ({ dados, onChange, onError }) => {
    const [formData, setFormData] = useState({
        timeSetor: "",
        cardapio: "",
        quantidade: "",
        centroCusto: "",
        rateio: "",
        dataCoffee: null,
        horario: "",
        localEntrega: "",
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
                dataCoffee: null,
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

        const diffTime = dataAgendamento.getTime() - hoje.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            onError(
                "Data inválida",
                "Não é possível agendar coffee break para o mesmo dia. O agendamento deve ser feito até às 12:00h do dia anterior."
            )
            return false
        }
        else if (diffDays === 1) {
            const limite = new Date()
            limite.setHours(12, 0, 0, 0)

            if (agora > limite) {
                onError(
                    "Horário limite excedido",
                    "O horário limite para agendamento de coffee break é até 12:00h do dia anterior."
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

        setFormData((prev) => ({
            ...prev,
            dataCoffee: date
        }))
    }

    const cardapios = ["Coffe Tipo 01", "Coffe Tipo 02", "Coffe Tipo 03", "Coffe Tipo 04", "Coffe Tipo 05"]

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
                    <Label htmlFor="selectCardapio" className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-emerald-600" />
                        Cardápio:
                    </Label>
                    <Select value={formData.cardapio} onValueChange={(value) => handleInputChange("cardapio", value)} required>
                        <SelectTrigger id="selectCardapio" className="w-full">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {cardapios.map((cardapio) => (
                                <SelectItem key={cardapio} value={cardapio}>
                                    {cardapio}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="quantidade" className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        Quantidade:
                    </Label>
                    <Input
                        type="number"
                        id="quantidade"
                        value={formData.quantidade}
                        onChange={(e) => handleInputChange("quantidade", e.target.value)}
                        min="0"
                        className="w-full"
                        placeholder="Número de pessoas"
                        required
                    />
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

            <div className="space-y-2">
                <Label htmlFor="selectRateio" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    Haverá rateio?
                </Label>
                <Select value={formData.rateio} onValueChange={(value) => handleInputChange("rateio", value)} required>
                    <SelectTrigger id="selectRateio" className="w-full">
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Sim">Sim</SelectItem>
                        <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {formData.rateio === "Sim" && (
                <p className="text-sm bg-green-100 border border-green-900/30 rounded-lg p-3 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    Por favor, informe os centros de custo para rateio no campo de observações.
                </p>
            )}

            <div className="space-y-2">
                <Label htmlFor="dataCoffee" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    Data:
                </Label>
                <DatePicker date={formData.dataCoffee} onChange={handleDataChange} />
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
                    placeholder="Coffee Break"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="localEntrega" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    Local de entrega:
                </Label>
                <Input
                    type="text"
                    id="localEntrega"
                    value={formData.localEntrega}
                    onChange={(e) => handleInputChange("localEntrega", e.target.value)}
                    className="w-full"
                    placeholder="Informe o local de entrega"
                    required
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
                    placeholder="Informações adicionais sobre o coffee break..."
                />
            </div>
        </div>
    )
}

export default CoffeeBreakForm
