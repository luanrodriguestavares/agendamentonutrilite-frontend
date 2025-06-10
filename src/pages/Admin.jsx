import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { getAgendamentos, updateAgendamento, cancelAgendamento, exportAgendamentosXLSX } from "../services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, LogOut, Check, X, Calendar, Users, MapPin, Coffee, Building, Search, Filter, BarChart3, CheckCircle, XCircle, AlertCircle, FileText, ChevronLeft, ChevronRight, Grid3X3, List, Clock, Utensils, Bus, DollarSign, Sheet, User } from "lucide-react"
import ErrorModal from "@/components/ErrorModal"
import AgendamentoDetailModal from "@/components/AgendamentoDetailModal"
import { format, isAfter, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const ITEMS_PER_PAGE = 9

export default function Admin() {
    const navigate = useNavigate()
    const { signOut } = useAuth()
    const [agendamentos, setAgendamentos] = useState([])
    const [filteredAgendamentos, setFilteredAgendamentos] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorModalOpen, setErrorModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [tipoFilter, setTipoFilter] = useState("todos")
    const [centroCustoFilter, setCentroCustoFilter] = useState("todos")
    const [selectedAgendamento, setSelectedAgendamento] = useState(null)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [activeTab, setActiveTab] = useState("ativos")
    const [viewMode, setViewMode] = useState("grid")
    const [formData, setFormData] = useState({})
    const [errorTitle, setErrorTitle] = useState("")
    const [loadingAction, setLoadingAction] = useState(null)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedAgendamentoForCancel, setSelectedAgendamentoForCancel] = useState(null)
    const [cancelReason, setCancelReason] = useState("")
    const [exportLoading, setExportLoading] = useState(false)

    useEffect(() => {
        loadAgendamentos()
    }, [])

    useEffect(() => {
        filterAgendamentos()
        setCurrentPage(1)
    }, [agendamentos, searchTerm, tipoFilter, activeTab, centroCustoFilter])

    const loadAgendamentos = async () => {
        try {
            const response = await getAgendamentos()
            setAgendamentos(response.data)
        } catch (error) {
            setErrorMessage("Erro ao carregar agendamentos")
            setErrorModalOpen(true)
        } finally {
            setLoading(false)
        }
    }

    const adjustDate = (dateString) => {
        if (!dateString) return null
        const date = new Date(dateString)
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    }

    const getAgendamentoDate = (agendamento) => {
        try {
            switch (agendamento.tipoAgendamento) {
                case "Home Office":
                    if (agendamento.dataInicio) {
                        const date = adjustDate(agendamento.dataInicio)
                        if (date && !isNaN(date.getTime())) return date
                    }
                    if (agendamento.dataFim) {
                        const date = adjustDate(agendamento.dataFim)
                        if (date && !isNaN(date.getTime())) return date
                    }
                    break
                case "Agendamento para Time":
                    if (agendamento.dataFeriado) {
                        const date = adjustDate(agendamento.dataFeriado)
                        if (date && !isNaN(date.getTime())) return date
                    }
                    if (agendamento.dataInicio) {
                        const date = adjustDate(agendamento.dataInicio)
                        if (date && !isNaN(date.getTime())) return date
                    }
                    break
                case "Administrativo - Lanche":
                    if (agendamento.data) {
                        const date = adjustDate(agendamento.data)
                        if (date && !isNaN(date.getTime())) return date
                    }
                    break
                case "Agendamento para Visitante":
                    if (agendamento.data) {
                        const date = adjustDate(agendamento.data)
                        if (date && !isNaN(date.getTime())) return date
                    }
                    break
                case "Coffee Break":
                    if (agendamento.dataCoffee) {
                        const date = adjustDate(agendamento.dataCoffee)
                        if (date && !isNaN(date.getTime())) return date
                    }
                    break
                case "Rota Extra":
                    if (agendamento.dataInicio) {
                        const date = adjustDate(agendamento.dataInicio)
                        if (date && !isNaN(date.getTime())) return date
                    }
                    break
            }

            // Fallbacks gerais
            if (agendamento.createdAt) {
                const date = adjustDate(agendamento.createdAt)
                if (date && !isNaN(date.getTime())) return date
            }
            return new Date()
        } catch (error) {
            console.error("Error parsing date:", error)
            return new Date()
        }
    }

    const isAgendamentoAtivo = (agendamento) => {
        try {
            const agendamentoDate = getAgendamentoDate(agendamento)
            const today = startOfDay(new Date())

            if (isNaN(agendamentoDate.getTime()) || isNaN(today.getTime())) {
                return false
            }

            return isAfter(agendamentoDate, today) || format(agendamentoDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
        } catch (error) {
            console.error("Error checking if agendamento is active:", error)
            return false
        }
    }

    const filterAgendamentos = () => {
        let filtered = agendamentos

        if (activeTab === "ativos") {
            // Ativos = agendamentos que ainda não passaram da data E que não estão cancelados
            filtered = filtered.filter((agendamento) => isAgendamentoAtivo(agendamento) && agendamento.status !== "cancelado")
        } else if (activeTab === "finalizados") {
            filtered = filtered.filter((agendamento) => !isAgendamentoAtivo(agendamento))
        } else if (activeTab !== "todos") {
            filtered = filtered.filter((agendamento) => agendamento.status === activeTab && isAgendamentoAtivo(agendamento))
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (agendamento) =>
                    agendamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    agendamento.email.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        if (tipoFilter !== "todos") {
            filtered = filtered.filter((agendamento) => agendamento.tipoAgendamento === tipoFilter)
        }

        if (centroCustoFilter !== "todos") {
            filtered = filtered.filter((agendamento) => agendamento.centroCusto === centroCustoFilter)
        }

        setFilteredAgendamentos(filtered)
    }

    const handleConfirm = async (id, tipo) => {
        try {
            setLoadingAction(id)
            await updateAgendamento(id, { tipoAgendamento: tipo, status: "confirmado" })
            await loadAgendamentos()
        } catch (error) {
            setErrorMessage("Erro ao confirmar agendamento")
            setErrorModalOpen(true)
        } finally {
            setLoadingAction(null)
        }
    }

    const handleCancelClick = (agendamento) => {
        setSelectedAgendamentoForCancel(agendamento)
        setCancelModalOpen(true)
    }

    const handleCancelConfirm = async () => {
        if (!selectedAgendamentoForCancel) return

        try {
            setLoadingAction(selectedAgendamentoForCancel.id)
            await cancelAgendamento(selectedAgendamentoForCancel.id, {
                tipo: selectedAgendamentoForCancel.tipoAgendamento,
                motivo: cancelReason,
                origem: "admin",
            })
            await loadAgendamentos()
            setCancelModalOpen(false)
            setCancelReason("")
            setSelectedAgendamentoForCancel(null)
        } catch (error) {
            setErrorTitle("Erro ao cancelar agendamento")
            setErrorMessage(error.response?.data?.details || error.response?.data?.error || "Erro ao cancelar agendamento")
            setErrorModalOpen(true)
        } finally {
            setLoadingAction(null)
        }
    }

    const handleLogout = () => {
        signOut()
        navigate("/login")
    }

    const openDetailModal = (agendamento) => {
        setSelectedAgendamento(agendamento)
        setDetailModalOpen(true)
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "pendente":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pendente
                    </Badge>
                )
            case "confirmado":
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirmado
                    </Badge>
                )
            case "cancelado":
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelado
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {status}
                    </Badge>
                )
        }
    }

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case "Agendamento para Time":
                return <Users className="h-5 w-5 text-emerald-600" />
            case "Home Office":
                return <Building className="h-5 w-5 text-blue-600" />
            case "Administrativo - Lanche":
                return <Coffee className="h-5 w-5 text-orange-600" />
            case "Agendamento para Visitante":
                return <MapPin className="h-5 w-5 text-purple-600" />
            case "Coffee Break":
                return <Coffee className="h-5 w-5 text-pink-600" />
            case "Rota Extra":
                return <Bus className="h-5 w-5 text-indigo-600" />
            default:
                return <Calendar className="h-5 w-5 text-gray-600" />
        }
    }

    const getTipoColor = (tipo) => {
        switch (tipo) {
            case "Agendamento para Time":
                return "emerald"
            case "Home Office":
                return "blue"
            case "Administrativo - Lanche":
                return "orange"
            case "Agendamento para Visitante":
                return "purple"
            case "Coffee Break":
                return "pink"
            case "Rota Extra":
                return "indigo"
            default:
                return "gray"
        }
    }

    const getStats = () => {
        const ativos = agendamentos.filter((a) => isAgendamentoAtivo(a) && a.status !== "cancelado")
        const finalizados = agendamentos.filter((a) => !isAgendamentoAtivo(a))
        const pendentesAtivos = ativos.filter((a) => a.status === "pendente")
        const confirmadosAtivos = ativos.filter((a) => a.status === "confirmado")
        const canceladosAtivos = agendamentos.filter((a) => a.status === "cancelado" && isAgendamentoAtivo(a))

        return {
            total: agendamentos.length,
            ativos: ativos.length,
            finalizados: finalizados.length,
            pendentes: pendentesAtivos.length,
            confirmados: confirmadosAtivos.length,
            cancelados: canceladosAtivos.length,
        }
    }

    const getAgendamentoDisplayDate = (agendamento) => {
        try {
            switch (agendamento.tipoAgendamento) {
                case "Home Office":
                    const dataInicio = agendamento.dataInicio
                        ? format(adjustDate(agendamento.dataInicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : null
                    const dataFim = agendamento.dataFim
                        ? format(adjustDate(agendamento.dataFim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : null

                    if (dataInicio && dataFim) {
                        if (dataInicio === dataFim) {
                            return dataInicio
                        }
                        return `${dataInicio} até ${dataFim}`
                    }
                    if (dataInicio) return dataInicio
                    if (dataFim) return dataFim
                    break
                case "Agendamento para Time":
                    if (agendamento.dataFeriado) {
                        return format(adjustDate(agendamento.dataFeriado), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    }
                    if (agendamento.dataInicio) {
                        return format(adjustDate(agendamento.dataInicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    }
                    break
                case "Administrativo - Lanche":
                    if (agendamento.data) {
                        return format(adjustDate(agendamento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    }
                    break
                case "Agendamento para Visitante":
                    if (agendamento.data) {
                        return format(adjustDate(agendamento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    }
                    break
                case "Coffee Break":
                    if (agendamento.dataCoffee) {
                        return format(adjustDate(agendamento.dataCoffee), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    }
                    break
                case "Rota Extra":
                    const rotaInicio = agendamento.dataInicio
                        ? format(adjustDate(agendamento.dataInicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : null
                    const rotaFim = agendamento.dataFim
                        ? format(adjustDate(agendamento.dataFim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : null

                    if (rotaInicio && rotaFim) {
                        if (rotaInicio === rotaFim) {
                            return rotaInicio
                        }
                        return `${rotaInicio} até ${rotaFim}`
                    }
                    if (rotaInicio) return rotaInicio
                    if (rotaFim) return rotaFim
                    break
            }

            return format(adjustDate(agendamento.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        } catch (error) {
            console.error("Error formatting date:", error)
            return "Data não disponível"
        }
    }

    const renderAgendamentoCard = (agendamento) => {
        const tipo = agendamento.tipoAgendamento
        const tipoColor = getTipoColor(tipo)
        const isCanceled = agendamento.status === "cancelado"

        return (
            <Card
                key={agendamento.id}
                className="cursor-pointer transition-all hover:shadow-lg relative"
                onClick={() => openDetailModal(agendamento)}
            >
                <CardHeader className={`p-4 rounded-t-lg bg-${tipoColor}-50 border-b`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`bg-${tipoColor}-100 p-2 rounded-full`}>{getTipoIcon(tipo)}</div>
                            <div>
                                <h3 className={`text-${tipoColor}-800 font-medium text-sm`}>{tipo}</h3>
                                <p className="text-xs text-gray-500">{agendamento.nome}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {agendamento.status === "pendente" && isAgendamentoAtivo(agendamento) && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleConfirm(agendamento.id, tipo)
                                        }}
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={loadingAction === agendamento.id}
                                    >
                                        {loadingAction === agendamento.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Check className="h-3 w-3" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleCancelClick(agendamento)
                                        }}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={loadingAction === agendamento.id}
                                    >
                                        {loadingAction === agendamento.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <X className="h-3 w-3" />
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-3 pb-16">{renderAgendamentoDetails(agendamento)}</CardContent>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white flex justify-end items-center gap-2 rounded-b-lg">
                    {getStatusBadge(agendamento.status)}
                </div>
            </Card>
        )
    }

    const renderAgendamentoDetails = (agendamento) => {
        const tipo = agendamento.tipoAgendamento
        const tipoColor = getTipoColor(tipo)

        switch (tipo) {
            case "Agendamento para Time":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{getAgendamentoDisplayDate(agendamento)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{agendamento.timeSetor}</span>
                        </div>
                        {agendamento.turno && (
                            <div className="flex items-center gap-2">
                                <Clock className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">Turno {agendamento.turno}</span>
                            </div>
                        )}
                        {agendamento.isFeriado && (
                            <div className="flex items-center gap-2">
                                <Calendar className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">Feriado</span>
                            </div>
                        )}
                        {agendamento.centroCusto && (
                            <div className="flex items-center gap-2">
                                <DollarSign className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">{agendamento.centroCusto}</span>
                            </div>
                        )}
                        {(agendamento.quantidadeAlmocoLanche ||
                            agendamento.quantidadeJantarCeia ||
                            agendamento.quantidadeLancheExtra) && (
                                <div className="flex flex-col gap-1">
                                    {agendamento.quantidadeAlmocoLanche > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Utensils className={`h-4 w-4 text-${tipoColor}-600`} />
                                            <span className="text-sm">{agendamento.quantidadeAlmocoLanche} pessoas (Almoço/Lanche)</span>
                                        </div>
                                    )}
                                    {agendamento.quantidadeJantarCeia > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Utensils className={`h-4 w-4 text-${tipoColor}-600`} />
                                            <span className="text-sm">{agendamento.quantidadeJantarCeia} pessoas (Jantar/Ceia)</span>
                                        </div>
                                    )}
                                    {agendamento.quantidadeLancheExtra > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Coffee className={`h-4 w-4 text-${tipoColor}-600`} />
                                            <span className="text-sm">{agendamento.quantidadeLancheExtra} pessoas (Lanche Extra)</span>
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>
                )

            case "Home Office":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{getAgendamentoDisplayDate(agendamento)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{agendamento.timeSetor}</span>
                        </div>
                        {agendamento.turno && (
                            <div className="flex items-center gap-2">
                                <Clock className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">Turno {agendamento.turno}</span>
                            </div>
                        )}
                        {agendamento.refeitorio && (
                            <div className="flex items-center gap-2">
                                <Building className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">Refeitório {agendamento.refeitorio}</span>
                            </div>
                        )}
                        {agendamento.refeicoes && Array.isArray(agendamento.refeicoes) && agendamento.refeicoes.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Utensils className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">{agendamento.refeicoes.join(", ")}</span>
                            </div>
                        )}
                    </div>
                )

            case "Administrativo - Lanche":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{getAgendamentoDisplayDate(agendamento)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{agendamento.timeSetor}</span>
                        </div>
                        {agendamento.turno && (
                            <div className="flex items-center gap-2">
                                <Clock className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">Turno {agendamento.turno}</span>
                            </div>
                        )}
                        {agendamento.refeitorio && (
                            <div className="flex items-center gap-2">
                                <Building className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">Refeitório {agendamento.refeitorio}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Coffee className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{agendamento.refeicoes || "Lanche Individual"}</span>
                        </div>
                    </div>
                )

            case "Agendamento para Visitante":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{getAgendamentoDisplayDate(agendamento)}</span>
                        </div>
                        {agendamento.refeitorio && (
                            <div className="flex items-center gap-2">
                                <Building className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">Refeitório {agendamento.refeitorio}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Users className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{agendamento.quantidadeVisitantes} visitantes</span>
                        </div>
                        {agendamento.acompanhante && (
                            <div className="flex items-center gap-2">
                                <User className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">Acompanhante: {agendamento.acompanhante}</span>
                            </div>
                        )}
                        {agendamento.centroCusto && (
                            <div className="flex items-center gap-2">
                                <DollarSign className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">{agendamento.centroCusto}</span>
                            </div>
                        )}
                    </div>
                )

            case "Coffee Break":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{getAgendamentoDisplayDate(agendamento)}</span>
                        </div>
                        {agendamento.horario && (
                            <div className="flex items-center gap-2">
                                <Clock className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">{agendamento.horario}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Users className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{agendamento.quantidade} pessoas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Coffee className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{agendamento.cardapio}</span>
                        </div>
                        {agendamento.timeSetor && (
                            <div className="flex items-center gap-2">
                                <Users className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">{agendamento.timeSetor}</span>
                            </div>
                        )}
                        {agendamento.localEntrega && (
                            <div className="flex items-center gap-2">
                                <MapPin className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">{agendamento.localEntrega}</span>
                            </div>
                        )}
                    </div>
                )

            case "Rota Extra":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{getAgendamentoDisplayDate(agendamento)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">{agendamento.timeSetor}</span>
                        </div>
                        {agendamento.dia && (
                            <div className="flex items-center gap-2">
                                <Calendar className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">{agendamento.dia}</span>
                            </div>
                        )}
                        {agendamento.centroCusto && (
                            <div className="flex items-center gap-2">
                                <DollarSign className={`h-4 w-4 text-${tipoColor}-600`} />
                                <span className="text-sm">{agendamento.centroCusto}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <MapPin className={`h-4 w-4 text-${tipoColor}-600`} />
                            <span className="text-sm">
                                {agendamento.quantidadeTiangua && `${agendamento.quantidadeTiangua} pessoas (Tianguá)`}
                                {agendamento.quantidadeTiangua && agendamento.quantidadeUbajara && " | "}
                                {agendamento.quantidadeUbajara && `${agendamento.quantidadeUbajara} pessoas (Ubajara)`}
                            </span>
                        </div>
                    </div>
                )

            default:
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">{getAgendamentoDisplayDate(agendamento)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">Tipo não reconhecido</span>
                        </div>
                    </div>
                )
        }
    }

    const handleExportXLSX = async () => {
        try {
            setExportLoading(true)

            const blob = await exportAgendamentosXLSX()

            const url = window.URL.createObjectURL(
                new Blob([blob], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                }),
            )

            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `agendamentos_${format(new Date(), "dd-MM-yyyy_HH-mm")}.xlsx`)
            document.body.appendChild(link)
            link.click()

            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)

            console.log("Exportação realizada com sucesso")
        } catch (error) {
            console.error("Erro ao exportar agendamentos:", error)
            setErrorTitle("Erro na exportação")
            setErrorMessage(`Não foi possível exportar os agendamentos: ${error.message}`)
            setErrorModalOpen(true)
        } finally {
            setExportLoading(false)
        }
    }

    const totalPages = Math.ceil(filteredAgendamentos.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentAgendamentos = filteredAgendamentos.slice(startIndex, endIndex)

    const stats = getStats()

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-emerald-700 to-emerald-900 flex items-center justify-center">
                <Card className="p-8">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                        <p className="text-gray-600">Carregando agendamentos...</p>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-700 to-emerald-900">
            <header className="bg-white shadow-lg border-b">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-100 border border-emerald-500 p-3 rounded-full">
                                <BarChart3 className="h-8 w-8 text-emerald-700" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
                                <p className="text-sm text-gray-600">Sistema de Agendamentos - Nutrilite</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="default"
                                onClick={handleExportXLSX}
                                disabled={exportLoading}
                                className="flex items-center gap-2"
                            >
                                {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sheet className="h-4 w-4" />}
                                {exportLoading ? "Exportando Planilha..." : "Exportar Planilha"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Sair
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <Calendar className="h-4 w-4 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-emerald-600">Ativos</p>
                                    <p className="text-2xl font-bold text-emerald-700">{stats.ativos}</p>
                                </div>
                                <div className="bg-emerald-100 p-2 rounded-full">
                                    <Calendar className="h-4 w-4 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-yellow-600">Pendentes</p>
                                    <p className="text-2xl font-bold text-yellow-700">{stats.pendentes}</p>
                                </div>
                                <div className="bg-yellow-100 p-2 rounded-full">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-green-600">Confirmados</p>
                                    <p className="text-2xl font-bold text-green-700">{stats.confirmados}</p>
                                </div>
                                <div className="bg-green-100 p-2 rounded-full">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-blue-600">Finalizados</p>
                                    <p className="text-2xl font-bold text-blue-700">{stats.finalizados}</p>
                                </div>
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-6">
                    <CardHeader className="bg-emerald-50 border-b rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-emerald-600" />
                                <h3 className="text-lg font-semibold text-emerald-800">Filtros</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className="h-8 w-8 p-0"
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className="h-8 w-8 p-0"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Search className="h-4 w-4 text-emerald-600" />
                                    Buscar
                                </label>
                                <Input
                                    placeholder="Nome ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-emerald-600" />
                                    Tipo
                                </label>
                                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos os tipos</SelectItem>
                                        <SelectItem value="Agendamento para Time">Agendamento para Time</SelectItem>
                                        <SelectItem value="Home Office">Home Office</SelectItem>
                                        <SelectItem value="Administrativo - Lanche">Administrativo - Lanche</SelectItem>
                                        <SelectItem value="Agendamento para Visitante">Agendamento para Visitante</SelectItem>
                                        <SelectItem value="Coffee Break">Coffee Break</SelectItem>
                                        <SelectItem value="Rota Extra">Rota Extra</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                    Centro de Custo
                                </label>
                                <Select value={centroCustoFilter} onValueChange={setCentroCustoFilter}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos os centros de custo</SelectItem>
                                        <SelectItem value="101002-SUPPLY">101002-SUPPLY</SelectItem>
                                        <SelectItem value="101003-SUPPLY">101003-SUPPLY</SelectItem>
                                        <SelectItem value="101004-RH">101004-RH</SelectItem>
                                        <SelectItem value="101005-OPEX">101005-OPEX</SelectItem>
                                        <SelectItem value="101007-OPEX">101007-OPEX</SelectItem>
                                        <SelectItem value="101009-SUPPLY">101009-SUPPLY</SelectItem>
                                        <SelectItem value="101010-ENGENHARIA">101010-ENGENHARIA</SelectItem>
                                        <SelectItem value="101011-ENGENHARIA">101011-ENGENHARIA</SelectItem>
                                        <SelectItem value="102000-PESQUISA">102000-PESQUISA</SelectItem>
                                        <SelectItem value="201001-MANUFATURA">201001-MANUFATURA</SelectItem>
                                        <SelectItem value="201002-MANUFATURA">201002-MANUFATURA</SelectItem>
                                        <SelectItem value="201003-MANUFATURA">201003-MANUFATURA</SelectItem>
                                        <SelectItem value="201004-MANUFATURA">201004-MANUFATURA</SelectItem>
                                        <SelectItem value="201006-MANUFATURA">201006-MANUFATURA</SelectItem>
                                        <SelectItem value="201007-MANUTENÇÃO">201007-MANUTENÇÃO</SelectItem>
                                        <SelectItem value="201008-SUPPLY">201008-SUPPLY</SelectItem>
                                        <SelectItem value="201009-SUPPLY">201009-SUPPLY</SelectItem>
                                        <SelectItem value="201011-GPM">201011-GPM</SelectItem>
                                        <SelectItem value="201012-QUALIDADE">201012-QUALIDADE</SelectItem>
                                        <SelectItem value="201013-QUALIDADE">201013-QUALIDADE</SelectItem>
                                        <SelectItem value="301001-AGRO">301001-AGRO</SelectItem>
                                        <SelectItem value="301002-AGRO">301002-AGRO</SelectItem>
                                        <SelectItem value="301006-AGRO">301006-AGRO</SelectItem>
                                        <SelectItem value="301007-MANUTENÇÃO">301007-MANUTENÇÃO</SelectItem>
                                        <SelectItem value="301009-AGRO">301009-AGRO</SelectItem>
                                        <SelectItem value="401001-OPEX">401001-OPEX</SelectItem>
                                        <SelectItem value="401003-OPEX">401003-OPEX</SelectItem>
                                        <SelectItem value="401004-MANUTENÇÃO">401004-MANUTENÇÃO</SelectItem>
                                        <SelectItem value="401005-AGRO">401005-AGRO</SelectItem>
                                        <SelectItem value="401006-AGRO">401006-AGRO</SelectItem>
                                        <SelectItem value="401007-MANUTENÇÃO">401007-MANUTENÇÃO</SelectItem>
                                        <SelectItem value="401009-MANUTENÇÃO">401009-MANUTENÇÃO</SelectItem>
                                        <SelectItem value="401010-OPEX">401010-OPEX</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5 bg-white">
                        <TabsTrigger
                            value="ativos"
                            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800"
                        >
                            Ativos ({stats.ativos})
                        </TabsTrigger>
                        <TabsTrigger
                            value="pendente"
                            className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800"
                        >
                            Pendentes ({stats.pendentes})
                        </TabsTrigger>
                        <TabsTrigger
                            value="confirmado"
                            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
                        >
                            Confirmados ({stats.confirmados})
                        </TabsTrigger>
                        <TabsTrigger value="cancelado" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
                            Cancelados ({stats.cancelados})
                        </TabsTrigger>
                        <TabsTrigger
                            value="finalizados"
                            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
                        >
                            Finalizados ({stats.finalizados})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="space-y-4">
                        {currentAgendamentos.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
                                    <p className="text-gray-600">Não há agendamentos que correspondam aos filtros selecionados.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <div
                                    className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}
                                >
                                    {currentAgendamentos.map(renderAgendamentoCard)}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAgendamentos.length)} de{" "}
                                            {filteredAgendamentos.length} agendamentos
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Anterior
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Próximo
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            <AgendamentoDetailModal
                agendamento={selectedAgendamento}
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
            />

            <ErrorModal
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title={errorTitle}
                message={errorMessage}
            />

            <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar Agendamento</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancelReason" className="mb-2 block">
                            Motivo do Cancelamento
                        </Label>
                        <Textarea
                            id="cancelReason"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Digite o motivo do cancelamento..."
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCancelModalOpen(false)
                                setCancelReason("")
                                setSelectedAgendamentoForCancel(null)
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700">
                            Confirmar Cancelamento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
