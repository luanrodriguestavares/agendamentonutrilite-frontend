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
import { Loader2, LogOut, Check, X, Calendar, Filter, BarChart3, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Download, Eye, Settings,Utensils,} from "lucide-react"
import ErrorModal from "@/components/ErrorModal"
import AgendamentoDetailModal from "@/components/AgendamentoDetailModal"
import AdvancedFiltersModal from "@/components/AdvancedFiltersModal"
import { format, isAfter, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import * as XLSX from "xlsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge as UIBadge } from "@/components/ui/badge"

const ITEMS_PER_PAGE = 20

const normalizeDate = (dateInput) => {
  if (!dateInput) return null

  try {
    let date

    if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split("-").map(Number)
      date = new Date(year, month - 1, day)
    } else {
      date = new Date(dateInput)
    }

    if (isNaN(date.getTime())) {
      return null
    }

    date.setHours(0, 0, 0, 0)
    return date
  } catch (error) {
    console.warn("Erro ao normalizar data:", dateInput, error)
    return null
  }
}

const getMainAgendamentoDate = (agendamento) => {
  try {
    switch (agendamento.tipoAgendamento) {
      case "Home Office":
        return normalizeDate(agendamento.dataInicio)
      case "Agendamento para Time":
        return normalizeDate(agendamento.dataFeriado || agendamento.dataInicio)
      case "Administrativo - Lanche":
      case "Agendamento para Visitante":
        return normalizeDate(agendamento.data)
      case "Coffee Break":
        return normalizeDate(agendamento.dataCoffee)
      case "Rota Extra":
        return normalizeDate(agendamento.dataInicio)
      default:
        return normalizeDate(agendamento.createdAt)
    }
  } catch (error) {
    console.error("Erro ao obter data do agendamento:", error)
    return normalizeDate(agendamento.createdAt)
  }
}

function getDashboardStats(filteredAgendamentos, filters) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function getRefeicoesCount(ag) {
    switch (ag.tipoAgendamento) {
      case "Coffee Break":
        return Number(ag.quantidade) || 0
      case "Agendamento para Visitante":
        return Number(ag.quantidadeVisitantes) || 0
      case "Agendamento para Time":
        return (
          (Number(ag.quantidadeAlmocoLanche) || 0) +
          (Number(ag.quantidadeJantarCeia) || 0) +
          (Number(ag.quantidadeLancheExtra) || 0)
        )
      case "Home Office":
        if (Array.isArray(ag.refeicoes)) return ag.refeicoes.length
        if (typeof ag.refeicoes === "string" && ag.refeicoes.startsWith("[")) {
          try {
            const arr = JSON.parse(ag.refeicoes)
            return Array.isArray(arr) ? arr.length : 1
          } catch {
            return 1
          }
        }
        return ag.refeicoes ? 1 : 0
      case "Administrativo - Lanche":
        if (Array.isArray(ag.refeicoes)) return ag.refeicoes.length
        if (typeof ag.refeicoes === "string" && ag.refeicoes.startsWith("[")) {
          try {
            const arr = JSON.parse(ag.refeicoes)
            return Array.isArray(arr) ? arr.length : 1
          } catch {
            return 1
          }
        }
        return 1
      default:
        return 0
    }
  }

  function getTransportesCount(ag) {
    if (ag.tipoAgendamento === "Rota Extra") {
      return (Number(ag.quantidadeTiangua) || 0) + (Number(ag.quantidadeUbajara) || 0)
    }
    return 0
  }

  const tiposSelecionados =
    Array.isArray(filters.tiposAgendamento) && filters.tiposAgendamento.length > 0
      ? filters.tiposAgendamento
      : filteredAgendamentos.map((a) => a.tipoAgendamento)
  const tiposUnicos = [...new Set(tiposSelecionados)]
  const onlyRotaExtra = tiposUnicos.length === 1 && tiposUnicos[0] === "Rota Extra"
  const onlyRefeicoes = tiposUnicos.every((tipo) => tipo !== "Rota Extra")
  const misto = !onlyRotaExtra && !onlyRefeicoes

  const ags = filteredAgendamentos
  const totalAgendamentos = ags.length
  const totalRefeicoes = ags.reduce((acc, ag) => acc + getRefeicoesCount(ag), 0)
  const totalTransportes = ags.reduce((acc, ag) => acc + getTransportesCount(ag), 0)

  const agsHoje = ags.filter((ag) => {
    const d = getMainAgendamentoDate(ag)
    return d && d.toDateString() === today.toDateString()
  })
  const totalAgsHoje = agsHoje.length
  const totalRefeicoesHoje = agsHoje.reduce((acc, ag) => acc + getRefeicoesCount(ag), 0)
  const totalTransportesHoje = agsHoje.reduce((acc, ag) => acc + getTransportesCount(ag), 0)

  const cards = []

  cards.push({
    label: "Total Filtrado",
    value: totalAgendamentos,
    color: "emerald",
    icon: <BarChart3 className="h-4 w-4" />,
  })

  if (onlyRotaExtra) {
    cards.push({
      label: "Total de Transportes",
      value: totalTransportes,
      color: "blue",
      icon: <Utensils className="h-4 w-4" />,
    })
  } else if (onlyRefeicoes) {
    cards.push({
      label: "Total de Refeições",
      value: totalRefeicoes,
      color: "blue",
      icon: <Utensils className="h-4 w-4" />,
    })
  } else {
    cards.push({
      label: "Total de Refeições/Transportes",
      value: totalRefeicoes + totalTransportes,
      color: "blue",
      icon: <Utensils className="h-4 w-4" />,
    })
  }

  if (onlyRotaExtra && totalTransportesHoje > 0) {
    cards.push({
      label: "Transportes para Hoje",
      value: totalTransportesHoje,
      color: "orange",
      icon: <Calendar className="h-4 w-4" />,
    })
  } else if (onlyRefeicoes && totalRefeicoesHoje > 0) {
    cards.push({
      label: "Refeições para Hoje",
      value: totalRefeicoesHoje,
      color: "orange",
      icon: <Calendar className="h-4 w-4" />,
    })
  } else if (misto && totalRefeicoesHoje + totalTransportesHoje > 0) {
    cards.push({
      label: "Para Hoje",
      value: totalRefeicoesHoje + totalTransportesHoje,
      color: "orange",
      icon: <Calendar className="h-4 w-4" />,
    })
  }

  return cards.slice(0, 4)
}

function hasAdvancedFilters(filters) {
  return Object.entries(filters).some(([key, value]) => {
    if (key === "tipoAgendamento") return false // ignorar filtro rápido
    if (key === "tiposAgendamento") return Array.isArray(value) && value.length > 0
    if (Array.isArray(value)) return value.length > 0
    return value && value !== ""
  })
}

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
    dataInicio: "",
    dataFim: "",
    dataCoffee: "",
    dataLanche: "",
    dataVisitante: "",
    quantidadeMin: "",
    quantidadeMax: "",
    localEntrega: "",
    rateio: "",
    acompanhante: "",
    nomeVisitante: "",
    dia: "",
    isFeriado: "",
    refeicoes: "",
    tiposAgendamento: [],
    dataInicioRotaExtra: "",
    dataFimRotaExtra: "",
    periodoInicio: "",
    periodoFim: "",
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

  const getAgendamentoDate = (agendamento) => {
    return getMainAgendamentoDate(agendamento) || new Date()
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

    // Filtro por aba
    if (activeTab === "ativos") {
      filtered = filtered.filter((agendamento) => isAgendamentoAtivo(agendamento) && agendamento.status !== "cancelado")
    } else if (activeTab === "finalizados") {
      filtered = filtered.filter((agendamento) => !isAgendamentoAtivo(agendamento))
    } else if (activeTab !== "todos") {
      filtered = filtered.filter((agendamento) => agendamento.status === activeTab && isAgendamentoAtivo(agendamento))
    }

    // Filtro de busca por texto
    if (searchTerm) {
      filtered = filtered.filter(
        (agendamento) =>
          agendamento.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agendamento.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agendamento.tipoAgendamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agendamento.timeSetor?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // FILTRO POR PERÍODO GERAL - CORRIGIDO
    if (filters.periodoInicio || filters.periodoFim) {
      console.log("Aplicando filtro de período:", { inicio: filters.periodoInicio, fim: filters.periodoFim })

      filtered = filtered.filter((agendamento) => {
        const agendamentoDate = getMainAgendamentoDate(agendamento)

        if (!agendamentoDate) {
          console.log("Agendamento sem data válida:", agendamento.id)
          return false
        }

        let isInRange = true

        // Verifica data de início
        if (filters.periodoInicio) {
          const startDate = normalizeDate(filters.periodoInicio)
          if (startDate && agendamentoDate < startDate) {
            isInRange = false
          }
        }

        // Verifica data de fim
        if (filters.periodoFim) {
          const endDate = normalizeDate(filters.periodoFim)
          if (endDate && agendamentoDate > endDate) {
            isInRange = false
          }
        }

        if (isInRange) {
          console.log("Agendamento incluído no período:", {
            id: agendamento.id,
            tipo: agendamento.tipoAgendamento,
            data: agendamentoDate.toISOString().split("T")[0],
          })
        }

        return isInRange
      })
    }

    // Aplicar outros filtros
    Object.keys(filters).forEach((key) => {
      const value = filters[key]
      if (value && value !== "" && key !== "periodoInicio" && key !== "periodoFim") {
        if (key === "tiposAgendamento") {
          if (Array.isArray(value) && value.length > 0) {
            filtered = filtered.filter((agendamento) => value.includes(agendamento.tipoAgendamento))
          }
        } else if (key === "tipoAgendamento") {
          filtered = filtered.filter((agendamento) =>
            agendamento[key]?.toString().toLowerCase().includes(value.toLowerCase()),
          )
        } else if (key === "quantidadeMin") {
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
        } else if (key === "dataInicio" || key === "dataFim") {
          // Filtro específico para Time/Home Office
          if (filters.dataInicio || filters.dataFim) {
            filtered = filtered.filter((agendamento) => {
              if (
                agendamento.tipoAgendamento !== "Agendamento para Time" &&
                agendamento.tipoAgendamento !== "Home Office"
              ) {
                return false
              }

              let agendamentoDate = null
              if (agendamento.tipoAgendamento === "Agendamento para Time") {
                agendamentoDate = normalizeDate(agendamento.dataFeriado || agendamento.dataInicio)
              } else {
                agendamentoDate = normalizeDate(agendamento.dataInicio)
              }

              if (!agendamentoDate) return false

              if (filters.dataInicio) {
                const startDate = normalizeDate(filters.dataInicio)
                if (startDate && agendamentoDate < startDate) return false
              }

              if (filters.dataFim) {
                const endDate = normalizeDate(filters.dataFim)
                if (endDate && agendamentoDate > endDate) return false
              }

              return true
            })
          }
        } else if (key === "dataLanche") {
          // Filtro específico para Administrativo - Lanche
          if (value) {
            filtered = filtered.filter((agendamento) => {
              if (agendamento.tipoAgendamento !== "Administrativo - Lanche") return false
              const agendamentoDate = normalizeDate(agendamento.data)
              const filterDate = normalizeDate(value)
              return agendamentoDate && filterDate && agendamentoDate.getTime() === filterDate.getTime()
            })
          }
        } else if (key === "dataVisitante") {
          // Filtro específico para Visitante
          if (value) {
            filtered = filtered.filter((agendamento) => {
              if (agendamento.tipoAgendamento !== "Agendamento para Visitante") return false
              const agendamentoDate = normalizeDate(agendamento.data)
              const filterDate = normalizeDate(value)
              return agendamentoDate && filterDate && agendamentoDate.getTime() === filterDate.getTime()
            })
          }
        } else if (key === "dataCoffee") {
          // Filtro específico para Coffee Break
          if (value) {
            filtered = filtered.filter((agendamento) => {
              if (agendamento.tipoAgendamento !== "Coffee Break") return false
              const agendamentoDate = normalizeDate(agendamento.dataCoffee)
              const filterDate = normalizeDate(value)
              return agendamentoDate && filterDate && agendamentoDate.getTime() === filterDate.getTime()
            })
          }
        } else if (key === "dataInicioRotaExtra" || key === "dataFimRotaExtra") {
          // Filtro específico para Rota Extra
          if (filters.dataInicioRotaExtra || filters.dataFimRotaExtra) {
            filtered = filtered.filter((agendamento) => {
              if (agendamento.tipoAgendamento !== "Rota Extra") return false

              const agendamentoDate = normalizeDate(agendamento.dataInicio)
              if (!agendamentoDate) return false

              if (filters.dataInicioRotaExtra) {
                const startDate = normalizeDate(filters.dataInicioRotaExtra)
                if (startDate && agendamentoDate < startDate) return false
              }

              if (filters.dataFimRotaExtra) {
                const endDate = normalizeDate(filters.dataFimRotaExtra)
                if (endDate && agendamentoDate > endDate) return false
              }

              return true
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
        } else if (key === "turno") {
          // Filtro específico para turno - comparação exata
          filtered = filtered.filter((agendamento) => agendamento.turno === value)
        } else if (key === "refeitorio") {
          // Filtro específico para refeitório - comparação exata
          filtered = filtered.filter((agendamento) => agendamento.refeitorio === value)
        } else if (key === "status") {
          // Filtro específico para status - comparação exata
          filtered = filtered.filter((agendamento) => agendamento.status === value)
        } else if (key === "tipoServico") {
          // Filtro específico para tipo de serviço - comparação exata
          filtered = filtered.filter((agendamento) => agendamento.tipoServico === value)
        } else if (key === "centroCusto") {
          // Filtro específico para centro de custo - comparação exata
          filtered = filtered.filter((agendamento) => agendamento.centroCusto === value)
        } else if (key === "timeSetor") {
          // Filtro específico para time/setor - comparação exata
          filtered = filtered.filter((agendamento) => agendamento.timeSetor === value)
        } else {
          filtered = filtered.filter((agendamento) =>
            agendamento[key]?.toString().toLowerCase().includes(value.toLowerCase()),
          )
        }
      }
    })

    // Ordenação
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

    console.log("Agendamentos filtrados:", filtered.length)
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
      console.error("Erro ao confirmar agendamento:", error)

      let errorMessage = "Erro ao confirmar agendamento"
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        errorMessage =
          "Tempo limite excedido. O agendamento pode ter sido confirmado, mas o email pode demorar alguns minutos para ser enviado."
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      setErrorMessage(errorMessage)
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
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 hover:text-gray-900">
            {status}
          </Badge>
        )
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
      dataInicio: "",
      dataFim: "",
      dataCoffee: "",
      dataLanche: "",
      dataVisitante: "",
      quantidadeMin: "",
      quantidadeMax: "",
      localEntrega: "",
      rateio: "",
      acompanhante: "",
      nomeVisitante: "",
      dia: "",
      isFeriado: "",
      refeicoes: "",
      tiposAgendamento: [],
      dataInicioRotaExtra: "",
      dataFimRotaExtra: "",
      periodoInicio: "",
      periodoFim: "",
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

  // Campos base comuns a todos os tipos
  const baseCols = [
    "nome",
    "email",
    "tipoServico",
    "status",
    "tipoAgendamento",
    "observacao",
    "createdAt",
    "updatedAt",
    "motivoCancelamento",
    "actions",
  ]

  // Campos por tipo de agendamento (fiel ao backend/models/json)
  const typeSpecificCols = {
    "Coffee Break": [
      "nome",
      "email",
      "tipoServico",
      "status",
      "timeSetor",
      "turno",
      "cardapio",
      "quantidade",
      "centroCusto",
      "rateio",
      "dataCoffee",
      "horario",
      "localEntrega",
      "observacao",
      "createdAt",
      "updatedAt",
      "motivoCancelamento",
      "actions",
    ],
    "Agendamento para Visitante": [
      "nome",
      "email",
      "tipoServico",
      "status",
      "data",
      "refeitorio",
      "quantidadeVisitantes",
      "acompanhante",
      "centroCusto",
      "observacao",
      "createdAt",
      "updatedAt",
      "motivoCancelamento",
      "actions",
    ],
    "Agendamento para Time": [
      "nome",
      "email",
      "tipoServico",
      "status",
      "timeSetor",
      "centroCusto",
      "isFeriado",
      "dataInicio",
      "dataFim",
      "dataFeriado",
      "turno",
      "refeitorio",
      "quantidadeAlmocoLanche",
      "quantidadeJantarCeia",
      "quantidadeLancheExtra",
      "observacao",
      "createdAt",
      "updatedAt",
      "motivoCancelamento",
      "actions",
    ],
    "Administrativo - Lanche": [
      "nome",
      "email",
      "tipoServico",
      "status",
      "timeSetor",
      "data",
      "turno",
      "refeitorio",
      "refeicoes",
      "observacao",
      "createdAt",
      "updatedAt",
      "motivoCancelamento",
      "actions",
    ],
    "Home Office": [
      "nome",
      "email",
      "tipoServico",
      "status",
      "timeSetor",
      "dataInicio",
      "dataFim",
      "turno",
      "refeitorio",
      "refeicoes",
      "observacao",
      "createdAt",
      "updatedAt",
      "motivoCancelamento",
      "actions",
    ],
    "Rota Extra": [
      "nome",
      "email",
      "tipoServico",
      "status",
      "timeSetor",
      "centroCusto",
      "dia",
      "dataInicio",
      "dataFim",
      "quantidadeTiangua",
      "quantidadeUbajara",
      "observacao",
      "createdAt",
      "updatedAt",
      "motivoCancelamento",
      "actions",
    ],
  }

  const getVisibleColumns = () => {
    // Verificar se há filtro de tipos múltiplos
    const tiposSelecionados = filters.tiposAgendamento || []
    const tipoUnico = filters.tipoAgendamento || ""

    let columns = []

    // Se há tipos múltiplos selecionados
    if (tiposSelecionados.length > 0) {
      // Se apenas um tipo está selecionado, usar colunas específicas
      if (tiposSelecionados.length === 1 && typeSpecificCols[tiposSelecionados[0]]) {
        columns = [...typeSpecificCols[tiposSelecionados[0]]]
      } else {
        // Se múltiplos tipos, organizar por grupos temáticos
        const allRelevantCols = new Set()
        tiposSelecionados.forEach((tipo) => {
          if (typeSpecificCols[tipo]) {
            typeSpecificCols[tipo].forEach((col) => allRelevantCols.add(col))
          }
        })

        // Organizar colunas por grupos temáticos
        const gruposOrganizados = [
          // Grupo 1: Identificação básica
          "nome",
          "email",
          "tipoServico",
          "status",
          "tipoAgendamento",

          // Grupo 2: Organização/Estrutura
          "timeSetor",
          "centroCusto",
          "turno",
          "refeitorio",

          // Grupo 3: Datas (agrupadas)
          "dataInicio",
          "dataFim",
          "dataCoffee",
          "data",
          "dataFeriado",

          // Grupo 4: Quantidades (agrupadas)
          "quantidadeAlmocoLanche",
          "quantidadeJantarCeia",
          "quantidadeLancheExtra",
          "quantidadeVisitantes",
          "quantidadeTiangua",
          "quantidadeUbajara",
          "quantidade",

          // Grupo 5: Detalhes específicos
          "cardapio",
          "horario",
          "localEntrega",
          "rateio",
          "acompanhante",
          "nomeVisitante",
          "refeicoes",
          "isFeriado",
          "dia",

          // Grupo 6: Metadados
          "createdAt",
          "updatedAt",
          "motivoCancelamento",

          // Grupo 7: Finais (sempre por último)
          "observacao",
          "actions",
        ]

        // Filtrar apenas as colunas que existem nos tipos selecionados
        columns = gruposOrganizados.filter((col) => allRelevantCols.has(col))
      }
    } else if (tipoUnico && typeSpecificCols[tipoUnico]) {
      // Se há um tipo único selecionado no filtro rápido
      columns = [...typeSpecificCols[tipoUnico]]
    } else {
      // Colunas base (sem alteração)
      columns = [...baseCols]
    }

    // Reorganizar apenas tipoAgendamento para depois de status (mantém a lógica existente)
    const reorderedColumns = []
    const specialColumns = ["tipoAgendamento", "observacao", "actions"]

    columns.forEach((col) => {
      if (!specialColumns.includes(col)) {
        reorderedColumns.push(col)
      }
    })

    // Inserir tipoAgendamento depois de status
    const statusIndex = reorderedColumns.findIndex((col) => col === "status")
    if (statusIndex !== -1) {
      reorderedColumns.splice(statusIndex + 1, 0, "tipoAgendamento")
    } else {
      reorderedColumns.unshift("tipoAgendamento")
    }

    // Adicionar observacao e actions no final
    if (columns.includes("observacao")) {
      reorderedColumns.push("observacao")
    }
    if (columns.includes("actions")) {
      reorderedColumns.push("actions")
    }

    return reorderedColumns
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
    dataPrincipal: {
      label: "Data Principal",
      sortable: true,
      minWidth: "120px",
      cell: (ag) => {
        let dataTexto = "-"
        let dataValue = null

        switch (ag.tipoAgendamento) {
          case "Coffee Break":
            dataTexto = formatDate(ag.dataCoffee)
            dataValue = ag.dataCoffee
            break
          case "Agendamento para Visitante":
          case "Administrativo - Lanche":
            dataTexto = formatDate(ag.data)
            dataValue = ag.data
            break
          case "Agendamento para Time":
            const dataFeriado = ag.dataFeriado || ag.dataInicio
            dataTexto = formatDate(dataFeriado)
            dataValue = dataFeriado
            break
          case "Home Office":
          case "Rota Extra":
            if (ag.dataInicio && ag.dataFim) {
              const inicio = formatDate(ag.dataInicio)
              const fim = formatDate(ag.dataFim)
              dataTexto = inicio === fim ? inicio : `${inicio} - ${fim}`
            } else {
              dataTexto = formatDate(ag.dataInicio)
            }
            dataValue = ag.dataInicio
            break
          default:
            dataTexto = formatDate(ag.createdAt)
            dataValue = ag.createdAt
        }

        return <TableCell title={`Tipo: ${ag.tipoAgendamento} | Data: ${dataTexto}`}>{dataTexto}</TableCell>
      },
    },
    quantidadePrincipal: {
      label: "Quantidade",
      sortable: true,
      minWidth: "100px",
      cell: (ag) => {
        let quantidade = "-"
        let detalhes = ""

        switch (ag.tipoAgendamento) {
          case "Coffee Break":
            quantidade = ag.quantidade || "-"
            detalhes = "Geral"
            break
          case "Agendamento para Visitante":
            quantidade = ag.quantidadeVisitantes || "-"
            detalhes = "Visitantes"
            break
          case "Agendamento para Time":
            const total =
              (Number(ag.quantidadeAlmocoLanche) || 0) +
              (Number(ag.quantidadeJantarCeia) || 0) +
              (Number(ag.quantidadeLancheExtra) || 0)
            quantidade = total > 0 ? total : "-"
            detalhes = "Total Refeições"
            break
          case "Rota Extra":
            const totalTransporte = (Number(ag.quantidadeTiangua) || 0) + (Number(ag.quantidadeUbajara) || 0)
            quantidade = totalTransporte > 0 ? totalTransporte : "-"
            detalhes = "Total Transporte"
            break
          case "Home Office":
          case "Administrativo - Lanche":
            if (Array.isArray(ag.refeicoes)) {
              quantidade = ag.refeicoes.length
              detalhes = "Refeições"
            } else if (ag.refeicoes) {
              quantidade = 1
              detalhes = "Refeições"
            }
            break
          default:
            quantidade = "-"
        }

        return (
          <TableCell title={`${detalhes}: ${quantidade}`}>
            <div className="text-center">
              <div className="font-medium">{quantidade}</div>
              {detalhes && quantidade !== "-" && <div className="text-xs text-gray-500">{detalhes}</div>}
            </div>
          </TableCell>
        )
      },
    },
  }

  const visibleColumns = getVisibleColumns()

  const dashboardCards = getDashboardStats(filteredAgendamentos, filters)
  const gridCols =
    dashboardCards.length === 1
      ? "grid-cols-1"
      : dashboardCards.length === 2
        ? "grid-cols-2"
        : dashboardCards.length === 3
          ? "grid-cols-3"
          : "grid-cols-4"

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
                className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-28 pb-6 px-4 sm:px-6 lg:px-8">
        <div className={`grid ${gridCols} gap-4 mb-6`}>
          {dashboardCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div>{card.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                <Button
                  variant="outline"
                  onClick={() => exportToExcel(agendamentos)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar Todos ({agendamentos.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAdvancedFiltersOpen(true)}
                  className="flex items-center gap-2 relative"
                >
                  <Settings className="h-4 w-4" />
                  Filtros Avançados
                  {hasAdvancedFilters(filters) && (
                    <UIBadge variant="default" className="ml-2 px-2 py-0.5 text-xs">
                      Ativo
                    </UIBadge>
                  )}
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 py-4">
            <div className="flex w-full flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                  Buscar Agendamentos
                </Label>
                <Input
                  id="search"
                  placeholder="Buscar por nome, email, tipo de agendamento ou setor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="tipo-filter" className="text-sm font-medium mb-2 block">
                  Tipo de Agendamento
                </Label>
                <Select
                  value={filters.tipoAgendamento || "all"}
                  onValueChange={(value) => {
                    setFilters((prev) => ({ ...prev, tipoAgendamento: value === "all" ? "" : value }))
                    setCurrentPage(1)
                  }}
                  disabled={filters.tiposAgendamento && filters.tiposAgendamento.length > 0}
                >
                  <SelectTrigger id="tipo-filter">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {[...new Set(agendamentos.map((a) => a.tipoAgendamento).filter(Boolean))].sort().map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
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

          <TabsContent value={activeTab}>
            <Card>
              <CardContent className="p-0">
                {/* Indicador de filtros na tabela */}
                {(filters.tipoAgendamento || (filters.tiposAgendamento && filters.tiposAgendamento.length > 0)) && (
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Exibindo agendamentos filtrados:</span>
                        {filters.tipoAgendamento && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {filters.tipoAgendamento}
                          </Badge>
                        )}
                        {filters.tiposAgendamento && filters.tiposAgendamento.length > 0 && (
                          <div className="flex items-center gap-1">
                            {filters.tiposAgendamento.map((tipo) => (
                              <Badge key={tipo} variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                                {tipo}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {filteredAgendamentos.length} resultado{filteredAgendamentos.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
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
                                  {col.sortable &&
                                    sortConfig.key === colKey &&
                                    (sortConfig.direction === "asc" ? "↑" : "↓")}
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
