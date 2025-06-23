import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { getAgendamentos, updateAgendamento, cancelAgendamento } from "../services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, LogOut, Check, X, Calendar, Filter, BarChart3, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Download, Eye, Settings } from "lucide-react"
import ErrorModal from "@/components/ErrorModal"
import AgendamentoDetailModal from "@/components/AgendamentoDetailModal"
import AdvancedFiltersModal from "@/components/AdvancedFiltersModal"
import { format, isAfter, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import * as XLSX from "xlsx"

const ITEMS_PER_PAGE = 20

export default function Admin() {
    const navigate = useNavigate()
    const { signOut } = useAuth()
    const [agendamentos, setAgendamentos] = useState([])
    const [filteredAgendamentos, setFilteredAgendamentos] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorModalOpen, setErrorModalOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [errorTitle, setErrorTitle] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedAgendamento, setSelectedAgendamento] = useState(null)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [activeTab, setActiveTab] = useState("ativos")
    const [loadingAction, setLoadingAction] = useState(null)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedAgendamentoForCancel, setSelectedAgendamentoForCancel] = useState(null)
    const [cancelReason, setCancelReason] = useState("")
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
    const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })

    const [filters, setFilters] = useState({
        nome: "",
        email: "",
        tipoAgendamento: "",
        status: "",
        tipoServico: "",
        timeSetor: "",
        centroCusto: "",
        turno: "",
        refeitorio: "",
        cardapio: "",
        dataInicio: null,
        dataFim: null,
        dataCoffee: null,
        data: null,
        quantidadeMin: "",
        quantidadeMax: "",
        localEntrega: "",
        rateio: "",
        acompanhante: "",
        nomeVisitante: "",
        dia: "",
        isFeriado: "",
        refeicoes: "",
    })

    useEffect(() => {
        loadAgendamentos()
    }, [])

    useEffect(() => {
        filterAndSortAgendamentos()
        setCurrentPage(1)
    }, [agendamentos, searchTerm, activeTab, filters, sortConfig])

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
            return isAfter(agendamentoDate, today) || format(agendamentoDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
        } catch (error) {
            return false
        }
    }

    const filterAndSortAgendamentos = () => {
        let filtered = agendamentos

        if (activeTab === "ativos") {
            filtered = filtered.filter((agendamento) => isAgendamentoAtivo(agendamento) && agendamento.status !== "cancelado")
        } else if (activeTab === "finalizados") {
            filtered = filtered.filter((agendamento) => !isAgendamentoAtivo(agendamento))
        } else if (activeTab !== "todos") {
            filtered = filtered.filter((agendamento) => agendamento.status === activeTab && isAgendamentoAtivo(agendamento))
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (agendamento) =>
                    agendamento.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    agendamento.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    agendamento.tipoAgendamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    agendamento.timeSetor?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        Object.keys(filters).forEach((key) => {
            const value = filters[key]
            if (value && value !== "") {
                if (key === "quantidadeMin") {
                    filtered = filtered.filter((agendamento) => {
                        const quantidade =
                            agendamento.quantidade ||
                            agendamento.quantidadeVisitantes ||
                            agendamento.quantidadeAlmocoLanche ||
                            agendamento.quantidadeJantarCeia ||
                            agendamento.quantidadeLancheExtra ||
                            agendamento.quantidadeTiangua ||
                            agendamento.quantidadeUbajara ||
                            0
                        return Number(quantidade) >= Number(value)
                    })
                } else if (key === "quantidadeMax") {
                    filtered = filtered.filter((agendamento) => {
                        const quantidade =
                            agendamento.quantidade ||
                            agendamento.quantidadeVisitantes ||
                            agendamento.quantidadeAlmocoLanche ||
                            agendamento.quantidadeJantarCeia ||
                            agendamento.quantidadeLancheExtra ||
                            agendamento.quantidadeTiangua ||
                            agendamento.quantidadeUbajara ||
                            0
                        return Number(quantidade) <= Number(value)
                    })
                } else if (key.includes("data") || key.includes("Data")) {
                    if (value instanceof Date) {
                        filtered = filtered.filter((agendamento) => {
                            const agendamentoDate = agendamento[key] ? new Date(agendamento[key]) : null
                            return agendamentoDate && agendamentoDate.toDateString() === value.toDateString()
                        })
                    }
                } else if (key === "isFeriado") {
                    filtered = filtered.filter((agendamento) => agendamento.isFeriado === (value === "true"))
                } else if (key === "refeicoes") {
                    filtered = filtered.filter((agendamento) => {
                        if (Array.isArray(agendamento.refeicoes)) {
                            return agendamento.refeicoes.some((r) => r.toLowerCase().includes(value.toLowerCase()))
                        }
                        return agendamento.refeicoes?.toLowerCase().includes(value.toLowerCase())
                    })
                } else {
                    filtered = filtered.filter((agendamento) =>
                        agendamento[key]?.toString().toLowerCase().includes(value.toLowerCase()),
                    )
                }
            }
        })

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key]
                let bValue = b[sortConfig.key]

                if (sortConfig.key.includes("data") || sortConfig.key.includes("Data") || sortConfig.key === "createdAt") {
                    aValue = new Date(aValue || 0)
                    bValue = new Date(bValue || 0)
                }

                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
                return 0
            })
        }

        setFilteredAgendamentos(filtered)
    }

    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
        }))
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
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 hover:text-yellow-900">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pendente
                    </Badge>
                )
            case "confirmado":
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:text-green-900">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirmado
                    </Badge>
                )
            case "cancelado":
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200 hover:text-red-900">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelado
                    </Badge>
                )
            default:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 hover:text-gray-900">{status}</Badge>
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

    const exportToExcel = (dataToExport = null) => {
        const data = dataToExport || filteredAgendamentos

        const exportData = data.map((agendamento) => ({
            ID: agendamento.id,
            Nome: agendamento.nome,
            Email: agendamento.email,
            "Tipo de Agendamento": agendamento.tipoAgendamento,
            "Tipo de Serviço": agendamento.tipoServico,
            Status: agendamento.status,
            "Time/Setor": agendamento.timeSetor,
            "Centro de Custo": agendamento.centroCusto,
            Turno: agendamento.turno,
            Refeitório: agendamento.refeitorio,
            "Data Início": agendamento.dataInicio ? format(new Date(agendamento.dataInicio), "dd/MM/yyyy") : "",
            "Data Fim": agendamento.dataFim ? format(new Date(agendamento.dataFim), "dd/MM/yyyy") : "",
            "Data Coffee": agendamento.dataCoffee ? format(new Date(agendamento.dataCoffee), "dd/MM/yyyy") : "",
            Data: agendamento.data ? format(new Date(agendamento.data), "dd/MM/yyyy") : "",
            "Data Feriado": agendamento.dataFeriado ? format(new Date(agendamento.dataFeriado), "dd/MM/yyyy") : "",
            Horário: agendamento.horario,
            Cardápio: agendamento.cardapio,
            "Qtd Almoço/Lanche": agendamento.quantidadeAlmocoLanche,
            "Qtd Jantar/Ceia": agendamento.quantidadeJantarCeia,
            "Qtd Lanche Extra": agendamento.quantidadeLancheExtra,
            "Qtd Visitantes": agendamento.quantidadeVisitantes,
            "Qtd Tianguá": agendamento.quantidadeTiangua,
            "Qtd Ubajara": agendamento.quantidadeUbajara,
            "Qtd Geral": agendamento.quantidade,
            "Local Entrega": agendamento.localEntrega,
            Rateio: agendamento.rateio,
            Acompanhante: agendamento.acompanhante,
            "Nome Visitante": agendamento.nomeVisitante,
            Refeições: Array.isArray(agendamento.refeicoes) ? agendamento.refeicoes.join(", ") : agendamento.refeicoes,
            "É Feriado": agendamento.isFeriado ? "Sim" : "Não",
            "Categoria Dia": agendamento.dia,
            Observação: agendamento.observacao,
            "Motivo Cancelamento": agendamento.motivoCancelamento,
            "Data Criação": format(new Date(agendamento.createdAt), "dd/MM/yyyy HH:mm"),
            "Última Atualização": format(new Date(agendamento.updatedAt), "dd/MM/yyyy HH:mm"),
        }))

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Agendamentos")

        const fileName = `agendamentos_${format(new Date(), "dd-MM-yyyy_HH-mm")}.xlsx`
        XLSX.writeFile(wb, fileName)
    }

    const clearFilters = () => {
        setFilters({
            nome: "",
            email: "",
            tipoAgendamento: "",
            status: "",
            tipoServico: "",
            timeSetor: "",
            centroCusto: "",
            turno: "",
            refeitorio: "",
            cardapio: "",
            dataInicio: null,
            dataFim: null,
            dataCoffee: null,
            data: null,
            quantidadeMin: "",
            quantidadeMax: "",
            localEntrega: "",
            rateio: "",
            acompanhante: "",
            nomeVisitante: "",
            dia: "",
            isFeriado: "",
            refeicoes: "",
        })
        setSearchTerm("")
    }

    const formatDate = (dateString) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
        } catch {
            return "-"
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
        } catch {
            return "-"
        }
    }

    const formatRefeicoes = (refeicoes) => {
        if (!refeicoes) return "-"
        if (Array.isArray(refeicoes)) {
            return refeicoes.join(", ")
        }
        if (typeof refeicoes === "string" && refeicoes.startsWith("[")) {
            try {
                const parsed = JSON.parse(refeicoes)
                return Array.isArray(parsed) ? parsed.join(", ") : refeicoes
            } catch {
                return refeicoes
            }
        }
        return refeicoes
    }

    const totalPages = Math.ceil(filteredAgendamentos.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentAgendamentos = filteredAgendamentos.slice(startIndex, endIndex)
    const stats = getStats()

    const getVisibleColumns = () => {
        const baseCols = ["nome", "email", "tipoAgendamento", "status"]
        const actionCols = ["actions"]

        const typeSpecificCols = {
            "Agendamento para Time": [
                "timeSetor",
                "centroCusto",
                "turno",
                "dataInicio",
                "dataFim",
                "dataFeriado",
                "isFeriado",
                "quantidadeAlmocoLanche",
                "quantidadeJantarCeia",
                "quantidadeLancheExtra",
                "observacao",
            ],
            "Home Office": ["timeSetor", "dataInicio", "dataFim", "turno", "refeitorio", "refeicoes", "observacao"],
            "Administrativo - Lanche": ["timeSetor", "data", "turno", "refeitorio", "refeicoes", "observacao"],
            "Agendamento para Visitante": [
                "nomeVisitante",
                "data",
                "refeitorio",
                "quantidadeVisitantes",
                "acompanhante",
                "centroCusto",
                "observacao",
                "turno",
            ],
            "Coffee Break": [
                "timeSetor",
                "cardapio",
                "quantidade",
                "centroCusto",
                "rateio",
                "dataCoffee",
                "horario",
                "localEntrega",
                "observacao",
                "turno",
            ],
            "Rota Extra": [
                "timeSetor",
                "centroCusto",
                "dia",
                "dataInicio",
                "dataFim",
                "quantidadeTiangua",
                "quantidadeUbajara",
                "observacao",
            ],
        }

        const { tipoAgendamento } = filters
        if (tipoAgendamento && typeSpecificCols[tipoAgendamento]) {
            return [...baseCols, ...typeSpecificCols[tipoAgendamento], "createdAt", ...actionCols]
        }

        // Default columns when no specific type is selected
        return [
            ...baseCols,
            "timeSetor",
            "centroCusto",
            "turno",
            "dataInicio",
            "dataFim",
            "dataCoffee",
            "data",
            "dataFeriado",
            "quantidade",
            "createdAt",
            ...actionCols,
        ]
    }

    const allColumns = {
        nome: {
            label: "Nome",
            sortable: true,
            minWidth: "150px",
            cell: (ag) => <TableCell className="font-medium">{ag.nome || "-"}</TableCell>,
        },
        email: {
            label: "Email",
            sortable: true,
            minWidth: "200px",
            cell: (ag) => <TableCell>{ag.email || "-"}</TableCell>,
        },
        tipoAgendamento: {
            label: "Tipo de Agendamento",
            sortable: true,
            minWidth: "180px",
            cell: (ag) => (
                <TableCell>
                    <Badge variant="outline" className="text-xs">
                        {ag.tipoAgendamento || "-"}
                    </Badge>
                </TableCell>
            ),
        },
        tipoServico: {
            label: "Tipo Serviço",
            sortable: true,
            minWidth: "120px",
            cell: (ag) => <TableCell>{ag.tipoServico || "-"}</TableCell>,
        },
        status: {
            label: "Status",
            sortable: true,
            minWidth: "100px",
            cell: (ag) => <TableCell>{getStatusBadge(ag.status)}</TableCell>,
        },
        timeSetor: {
            label: "Time/Setor",
            sortable: true,
            minWidth: "120px",
            cell: (ag) => <TableCell>{ag.timeSetor || "-"}</TableCell>,
        },
        centroCusto: {
            label: "Centro de Custo",
            minWidth: "150px",
            cell: (ag) => <TableCell className="text-xs">{ag.centroCusto || "-"}</TableCell>,
        },
        turno: { label: "Turno", minWidth: "80px", cell: (ag) => <TableCell>{ag.turno || "-"}</TableCell> },
        refeitorio: {
            label: "Refeitório",
            minWidth: "100px",
            cell: (ag) => <TableCell>{ag.refeitorio || "-"}</TableCell>,
        },
        dataInicio: {
            label: "Data Início",
            minWidth: "100px",
            cell: (ag) => <TableCell>{formatDate(ag.dataInicio)}</TableCell>,
        },
        dataFim: {
            label: "Data Fim",
            minWidth: "100px",
            cell: (ag) => <TableCell>{formatDate(ag.dataFim)}</TableCell>,
        },
        dataCoffee: {
            label: "Data Coffee",
            minWidth: "100px",
            cell: (ag) => <TableCell>{formatDate(ag.dataCoffee)}</TableCell>,
        },
        data: { label: "Data", minWidth: "100px", cell: (ag) => <TableCell>{formatDate(ag.data)}</TableCell> },
        dataFeriado: {
            label: "Data Feriado",
            minWidth: "100px",
            cell: (ag) => <TableCell>{formatDate(ag.dataFeriado)}</TableCell>,
        },
        horario: { label: "Horário", minWidth: "80px", cell: (ag) => <TableCell>{ag.horario || "-"}</TableCell> },
        cardapio: { label: "Cardápio", minWidth: "120px", cell: (ag) => <TableCell>{ag.cardapio || "-"}</TableCell> },
        quantidadeAlmocoLanche: {
            label: "Qtd Almoço/Lanche",
            minWidth: "180px",
            cell: (ag) => <TableCell>{ag.quantidadeAlmocoLanche || "-"}</TableCell>,
        },
        quantidadeJantarCeia: {
            label: "Qtd Jantar/Ceia",
            minWidth: "180px",
            cell: (ag) => <TableCell>{ag.quantidadeJantarCeia || "-"}</TableCell>,
        },
        quantidadeLancheExtra: {
            label: "Qtd Lanche Extra",
            minWidth: "180px",
            cell: (ag) => <TableCell>{ag.quantidadeLancheExtra || "-"}</TableCell>,
        },
        quantidadeVisitantes: {
            label: "Qtd Visitantes",
            minWidth: "150px",
            cell: (ag) => <TableCell>{ag.quantidadeVisitantes || "-"}</TableCell>,
        },
        quantidadeTiangua: {
            label: "Qtd Tianguá",
            minWidth: "150px",
            cell: (ag) => <TableCell>{ag.quantidadeTiangua || "-"}</TableCell>,
        },
        quantidadeUbajara: {
            label: "Qtd Ubajara",
            minWidth: "150px",
            cell: (ag) => <TableCell>{ag.quantidadeUbajara || "-"}</TableCell>,
        },
        quantidade: {
            label: "Quantidade Geral",
            minWidth: "150px",
            cell: (ag) => <TableCell>{ag.quantidade || "-"}</TableCell>,
        },
        localEntrega: {
            label: "Local Entrega",
            minWidth: "120px",
            cell: (ag) => <TableCell>{ag.localEntrega || "-"}</TableCell>,
        },
        rateio: { label: "Rateio", minWidth: "80px", cell: (ag) => <TableCell>{ag.rateio || "-"}</TableCell> },
        acompanhante: {
            label: "Acompanhante",
            minWidth: "120px",
            cell: (ag) => <TableCell>{ag.acompanhante || "-"}</TableCell>,
        },
        nomeVisitante: {
            label: "Nome Visitante",
            minWidth: "120px",
            cell: (ag) => <TableCell>{ag.nomeVisitante || "-"}</TableCell>,
        },
        refeicoes: {
            label: "Refeições",
            minWidth: "150px",
            cell: (ag) => (
                <TableCell className="max-w-[150px] truncate" title={formatRefeicoes(ag.refeicoes)}>
                    {formatRefeicoes(ag.refeicoes)}
                </TableCell>
            ),
        },
        isFeriado: {
            label: "Feriado",
            minWidth: "80px",
            cell: (ag) => <TableCell>{ag.isFeriado ? "Sim" : "Não"}</TableCell>,
        },
        dia: { label: "Categoria Dia", minWidth: "100px", cell: (ag) => <TableCell>{ag.dia || "-"}</TableCell> },
        observacao: {
            label: "Observação",
            minWidth: "200px",
            cell: (ag) => (
                <TableCell className="max-w-[200px] truncate" title={ag.observacao}>
                    {ag.observacao || "-"}
                </TableCell>
            ),
        },
        createdAt: {
            label: "Criado em",
            sortable: true,
            minWidth: "120px",
            cell: (ag) => <TableCell>{formatDateTime(ag.createdAt)}</TableCell>,
        },
        updatedAt: {
            label: "Atualizado em",
            minWidth: "120px",
            cell: (ag) => <TableCell>{formatDateTime(ag.updatedAt)}</TableCell>,
        },
        actions: {
            label: "Ações",
            minWidth: "120px",
            sticky: true,
            cell: (ag) => (
                <TableCell className="sticky right-0 bg-white rounded-r-lg">
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDetailModal(ag)}>
                            <Eye className="h-3 w-3" />
                        </Button>
                        {ag.status === "pendente" && isAgendamentoAtivo(ag) && (
                            <>
                                <Button
                                    size="sm"
                                    onClick={() => handleConfirm(ag.id, ag.tipoAgendamento)}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={loadingAction === ag.id}
                                >
                                    {loadingAction === ag.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Check className="h-3 w-3" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleCancelClick(ag)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={loadingAction === ag.id}
                                >
                                    {loadingAction === ag.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                                </Button>
                            </>
                        )}
                    </div>
                </TableCell>
            ),
        },
    }

    const visibleColumns = getVisibleColumns()

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
            <header className="bg-white shadow-lg border-b fixed top-0 w-full z-50">
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

            <main className="max-w-7xl mx-auto pt-28 pb-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Calendar className="h-4 w-4 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-emerald-600">Ativos</p>
                                    <p className="text-2xl font-bold text-emerald-700">{stats.ativos}</p>
                                </div>
                                <Calendar className="h-4 w-4 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-yellow-600">Pendentes</p>
                                    <p className="text-2xl font-bold text-yellow-700">{stats.pendentes}</p>
                                </div>
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-green-600">Confirmados</p>
                                    <p className="text-2xl font-bold text-green-700">{stats.confirmados}</p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-red-600">Cancelados</p>
                                    <p className="text-2xl font-bold text-red-700">{stats.cancelados}</p>
                                </div>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-blue-600">Finalizados</p>
                                    <p className="text-2xl font-bold text-blue-700">{stats.finalizados}</p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-6">
                    <CardHeader className="bg-emerald-50 border-b rounded-t-lg">
                        <div className="flex items-center justify-between flex-wrap gap-y-2">
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-emerald-600" />
                                <CardTitle className="text-emerald-800">Filtros e Busca</CardTitle>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button variant="default" onClick={() => exportToExcel()} className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Exportar Filtrados ({filteredAgendamentos.length})
                                </Button>
                                <Button variant="outline" onClick={() => exportToExcel(agendamentos)} className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Exportar Todos ({agendamentos.length})
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setAdvancedFiltersOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Settings className="h-4 w-4" />
                                    Filtros Avançados
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Limpar Filtros
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Buscar por nome, email, tipo de agendamento ou setor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
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

                    <TabsContent value={activeTab}>
                        <Card>
                            <CardContent className="p-0">
                                {currentAgendamentos.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
                                        <p className="text-gray-600">Não há agendamentos que correspondam aos filtros selecionados.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {visibleColumns.map((colKey) => {
                                                            const col = allColumns[colKey]
                                                            if (!col) return null
                                                            return (
                                                                <TableHead
                                                                    key={colKey}
                                                                    className={`${col.sortable ? "cursor-pointer" : ""} ${
                                                                        col.sticky ? "sticky right-0 bg-white rounded-r-lg" : ""
                                                                    }`}
                                                                    style={{ minWidth: col.minWidth }}
                                                                    onClick={() => col.sortable && handleSort(colKey)}
                                                                >
                                                                    {col.label}{" "}
                                                                    {col.sortable && sortConfig.key === colKey && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                                                </TableHead>
                                                            )
                                                        })}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {currentAgendamentos.map((agendamento) => (
                                                        <TableRow key={agendamento.id} className="hover:bg-gray-50">
                                                            {visibleColumns.map((colKey) => {
                                                                const col = allColumns[colKey]
                                                                return col ? col.cell(agendamento) : null
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between p-4 border-t">
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
                                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                            let pageNum
                                                            if (totalPages <= 5) {
                                                                pageNum = i + 1
                                                            } else if (currentPage <= 3) {
                                                                pageNum = i + 1
                                                            } else if (currentPage >= totalPages - 2) {
                                                                pageNum = totalPages - 4 + i
                                                            } else {
                                                                pageNum = currentPage - 2 + i
                                                            }

                                                            return (
                                                                <Button
                                                                    key={pageNum}
                                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => setCurrentPage(pageNum)}
                                                                    className="w-8 h-8 p-0"
                                                                >
                                                                    {pageNum}
                                                                </Button>
                                                            )
                                                        })}
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
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <AgendamentoDetailModal
                agendamento={selectedAgendamento}
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
            />

            <AdvancedFiltersModal
                isOpen={advancedFiltersOpen}
                onClose={() => setAdvancedFiltersOpen(false)}
                filters={filters}
                onFiltersChange={setFilters}
                agendamentos={agendamentos}
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
