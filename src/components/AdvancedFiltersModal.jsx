import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, Calendar, Users, Building, Coffee, DollarSign, MapPin, Clock } from 'lucide-react'
import { DatePicker } from "@/components/ui/date-picker"

export default function AdvancedFiltersModal({ isOpen, onClose, filters, onFiltersChange, agendamentos }) {
	const [localFilters, setLocalFilters] = useState(filters)

	useEffect(() => {
		setLocalFilters(filters)
	}, [filters])

	const handleFilterChange = (key, value) => {
		setLocalFilters((prev) => ({ ...prev, [key]: value }))
	}

	const getTiposAgendamento = () => {
		return [...new Set(agendamentos.map((a) => a.tipoAgendamento).filter(Boolean))].sort()
	}

	const dateToString = (date) => {
		if (!date) return ""

		if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return date
		}

		if (typeof date === "string") {
			const dateObj = new Date(date)
			if (!isNaN(dateObj.getTime())) {
				return dateObj.toISOString().split("T")[0]
			}
			return ""
		}

		if (date instanceof Date && !isNaN(date.getTime())) {
			return date.toISOString().split("T")[0]
		}

		return ""
	}

	const stringToDate = (dateString) => {
		if (!dateString || dateString === "") return null

		try {
			if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
				const [year, month, day] = dateString.split("-").map(Number)
				return new Date(year, month - 1, day)
			}

			const date = new Date(dateString)
			if (!isNaN(date.getTime())) {
				return date
			}
		} catch (error) {
			console.warn("Erro ao converter data:", dateString, error)
		}

		return null
	}

	const getToday = () => {
		const today = new Date()
		const year = today.getFullYear()
		const month = String(today.getMonth() + 1).padStart(2, '0')
		const day = String(today.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const getWeekStart = () => {
		const today = new Date()
		const dayOfWeek = today.getDay()
		const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
		const monday = new Date(today)
		monday.setDate(diff)
		const year = monday.getFullYear()
		const month = String(monday.getMonth() + 1).padStart(2, '0')
		const day = String(monday.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const getWeekEnd = () => {
		const today = new Date()
		const dayOfWeek = today.getDay()
		const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7)
		const sunday = new Date(today)
		sunday.setDate(diff)
		const year = sunday.getFullYear()
		const month = String(sunday.getMonth() + 1).padStart(2, '0')
		const day = String(sunday.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const getMonthStart = () => {
		const today = new Date()
		const year = today.getFullYear()
		const month = String(today.getMonth() + 1).padStart(2, '0')
		return `${year}-${month}-01`
	}

	const getMonthEnd = () => {
		const today = new Date()
		const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
		const year = lastDay.getFullYear()
		const month = String(lastDay.getMonth() + 1).padStart(2, '0')
		const day = String(lastDay.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const applyQuickPeriodFilter = (type) => {
		switch (type) {
			case "today":
				handleFilterChange("periodoInicio", getToday())
				handleFilterChange("periodoFim", getToday())
				break
			case "week":
				handleFilterChange("periodoInicio", getWeekStart())
				handleFilterChange("periodoFim", getWeekEnd())
				break
			case "month":
				handleFilterChange("periodoInicio", getMonthStart())
				handleFilterChange("periodoFim", getMonthEnd())
				break
			case "clear":
				handleFilterChange("periodoInicio", "")
				handleFilterChange("periodoFim", "")
				break
		}
	}

	const applyFilters = () => {
		const processedFilters = { ...localFilters }

		const dateFields = [
			"dataInicio",
			"dataFim",
			"dataCoffee",
			"dataLanche",
			"dataVisitante",
			"dataInicioRotaExtra",
			"dataFimRotaExtra",
			"periodoInicio",
			"periodoFim",
		]

		dateFields.forEach((field) => {
			if (processedFilters[field]) {
				processedFilters[field] = dateToString(processedFilters[field])
			} else {
				processedFilters[field] = ""
			}
		})

		console.log("Filtros de quantidade antes do processamento:", {
			quantidadeMin: localFilters.quantidadeMin,
			quantidadeMax: localFilters.quantidadeMax
		})
		console.log("Filtros processados:", processedFilters)
		onFiltersChange(processedFilters)
		onClose()
	}

	const clearFilters = () => {
		const emptyFilters = {
			nome: "",
			email: "",
			tiposAgendamento: [],
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
			tipoRefeicao: "",
			dataInicioRotaExtra: "",
			dataFimRotaExtra: "",
			periodoInicio: "",
			periodoFim: "",
		}
		setLocalFilters(emptyFilters)
	}

	const getUniqueValues = (field) => {
		const values = agendamentos
			.map((a) => a[field])
			.filter((v) => v && v !== "")
			.filter((v, i, arr) => arr.indexOf(v) === i)
			.sort()
		return values
	}

	const getActiveFiltersCount = () => {
		let count = 0

		Object.entries(localFilters).forEach(([key, value]) => {
			if (key === 'tiposAgendamento') {
				if (Array.isArray(value) && value.length > 0) {
					count += value.length
				}
			} else if (Array.isArray(value)) {
				if (value.length > 0) {
					count += value.length
				}
			} else if (value && value !== "" && value !== null) {
				count += 1
			}
		})

		return count
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filtros Avançados
						{getActiveFiltersCount() > 0 && <Badge variant="secondary">{getActiveFiltersCount()} filtros ativos</Badge>}
					</DialogTitle>
				</DialogHeader>

				<Tabs defaultValue="geral" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="geral">Geral</TabsTrigger>
						<TabsTrigger value="datas">Datas</TabsTrigger>
						<TabsTrigger value="especificos">Específicos</TabsTrigger>
						<TabsTrigger value="quantidades">Quantidades</TabsTrigger>
					</TabsList>

					<TabsContent value="geral" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm flex items-center gap-2">
									<Users className="h-4 w-4" />
									Informações Pessoais
								</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Nome</Label>
									<Input
										placeholder="Filtrar por nome..."
										value={localFilters.nome}
										onChange={(e) => handleFilterChange("nome", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>Email</Label>
									<Input
										placeholder="Filtrar por email..."
										value={localFilters.email}
										onChange={(e) => handleFilterChange("email", e.target.value)}
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-sm flex items-center gap-2">
									<Building className="h-4 w-4" />
									Tipo e Status
								</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2 md:col-span-2">
									<Label>Tipos de Agendamento</Label>
									<div className="space-y-2">
										<div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] bg-white overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
											{(localFilters.tiposAgendamento || []).map((tipo) => (
												<Badge
													key={tipo}
													variant="secondary"
													className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
													onClick={() => {
														const newTipos = (localFilters.tiposAgendamento || []).filter(t => t !== tipo)
														setLocalFilters((prev) => ({
															...prev,
															tiposAgendamento: newTipos,
															tipoAgendamento: ""
														}))
													}}
												>
													{tipo} ×
												</Badge>
											))}
											{(localFilters.tiposAgendamento || []).length === 0 && (
												<span className="text-gray-400 text-sm">Nenhum tipo selecionado</span>
											)}
										</div>
										<div className="flex gap-2">
											<Select
												onValueChange={(value) => {
													if (value === "all") {
														setLocalFilters((prev) => ({
															...prev,
															tiposAgendamento: getTiposAgendamento(),
															tipoAgendamento: ""
														}))
													} else {
														const currentTipos = localFilters.tiposAgendamento || []
														if (!currentTipos.includes(value)) {
															const newTipos = [...currentTipos, value]
															setLocalFilters((prev) => ({
																...prev,
																tiposAgendamento: newTipos,
																tipoAgendamento: ""
															}))
														}
													}
												}}
											>
												<SelectTrigger className="flex-1">
													<SelectValue placeholder="Adicionar tipo..." />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">Selecionar todos os tipos</SelectItem>
													{getTiposAgendamento().map((tipo) => (
														<SelectItem
															key={tipo}
															value={tipo}
															disabled={(localFilters.tiposAgendamento || []).includes(tipo)}
														>
															{tipo}
															{(localFilters.tiposAgendamento || []).includes(tipo) && (
																<span className="ml-2 text-green-600">✓</span>
															)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{(localFilters.tiposAgendamento || []).length > 0 && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setLocalFilters((prev) => ({
															...prev,
															tiposAgendamento: [],
															tipoAgendamento: ""
														}))
													}}
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
												>
													Limpar
												</Button>
											)}
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<Label>Status</Label>
									<Select
										value={localFilters.status || "all"}
										onValueChange={(value) => handleFilterChange("status", value === "all" ? "" : value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Todos os status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos os status</SelectItem>
											<SelectItem value="pendente">Pendente</SelectItem>
											<SelectItem value="confirmado">Confirmado</SelectItem>
											<SelectItem value="cancelado">Cancelado</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Tipo de Serviço</Label>
									<Select
										value={localFilters.tipoServico || "all"}
										onValueChange={(value) => handleFilterChange("tipoServico", value === "all" ? "" : value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Todos os serviços" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos os serviços</SelectItem>
											{getUniqueValues("tipoServico").map((tipo) => (
												<SelectItem key={tipo} value={tipo}>
													{tipo}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="datas" className="space-y-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									Filtros por Data
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
									<Label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										Filtro por Período Geral
										<Badge variant="outline" className="text-xs">
											Todos os tipos de agendamento
										</Badge>
									</Label>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
										<div className="space-y-1">
											<Label className="text-xs">Data Início do Período</Label>
											<DatePicker
												date={stringToDate(localFilters.periodoInicio)}
												onChange={(date) => handleFilterChange("periodoInicio", dateToString(date))}
												disablePast={false}
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">Data Fim do Período</Label>
											<DatePicker
												date={stringToDate(localFilters.periodoFim)}
												onChange={(date) => handleFilterChange("periodoFim", dateToString(date))}
												disablePast={false}
											/>
										</div>
									</div>
									<div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => applyQuickPeriodFilter("today")}
											className="text-xs"
										>
											Hoje
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => applyQuickPeriodFilter("week")}
											className="text-xs"
										>
											Esta Semana
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => applyQuickPeriodFilter("month")}
											className="text-xs"
										>
											Este Mês
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => applyQuickPeriodFilter("clear")}
											className="text-xs text-gray-600 hover:text-gray-700"
										>
											Limpar Período
										</Button>
									</div>
									<p className="text-xs text-gray-600 mt-2">
										Este filtro considera a data principal de cada agendamento (data de início, data do evento, etc.)
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Card className="bg-white border border-gray-200">
										<CardHeader className="pb-2">
											<CardTitle className="text-xs flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												Agendamento para Time / Home Office
											</CardTitle>
										</CardHeader>
										<CardContent className="flex flex-col gap-3">
											<div className="space-y-1">
												<Label className="text-xs">Data Início</Label>
												<DatePicker
													date={stringToDate(localFilters.dataInicio)}
													onChange={(date) => handleFilterChange("dataInicio", dateToString(date))}
													disablePast={false}
												/>
											</div>
											<div className="space-y-1">
												<Label className="text-xs">Data Fim</Label>
												<DatePicker
													date={stringToDate(localFilters.dataFim)}
													onChange={(date) => handleFilterChange("dataFim", dateToString(date))}
													disablePast={false}
												/>
											</div>
										</CardContent>
									</Card>

									<Card className="bg-white border border-gray-200">
										<CardHeader className="pb-2">
											<CardTitle className="text-xs flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												Administrativo - Lanche
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-1">
												<Label className="text-xs">Data do Lanche</Label>
												<DatePicker
													date={stringToDate(localFilters.dataLanche)}
													onChange={(date) => handleFilterChange("dataLanche", dateToString(date))}
													disablePast={false}
												/>
											</div>
										</CardContent>
									</Card>

									<Card className="bg-white border border-gray-200">
										<CardHeader className="pb-2">
											<CardTitle className="text-xs flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												Agendamento para Visitante
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-1">
												<Label className="text-xs">Data da Visita</Label>
												<DatePicker
													date={stringToDate(localFilters.dataVisitante)}
													onChange={(date) => handleFilterChange("dataVisitante", dateToString(date))}
													disablePast={false}
												/>
											</div>
										</CardContent>
									</Card>

									<Card className="bg-white border border-gray-200">
										<CardHeader className="pb-2">
											<CardTitle className="text-xs flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												Coffee Break
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-1">
												<Label className="text-xs">Data do Coffee Break</Label>
												<DatePicker
													date={stringToDate(localFilters.dataCoffee)}
													onChange={(date) => handleFilterChange("dataCoffee", dateToString(date))}
													disablePast={false}
												/>
											</div>
										</CardContent>
									</Card>

									<Card className="bg-white border border-gray-200">
										<CardHeader className="pb-2">
											<CardTitle className="text-xs flex items-center gap-2">
												<Calendar className="h-4 w-4" />
												Rota Extra
											</CardTitle>
										</CardHeader>
										<CardContent className="flex flex-col gap-3">
											<div className="space-y-1">
												<Label className="text-xs">Data Início</Label>
												<DatePicker
													date={stringToDate(localFilters.dataInicioRotaExtra)}
													onChange={(date) => handleFilterChange("dataInicioRotaExtra", dateToString(date))}
													disablePast={false}
												/>
											</div>
											<div className="space-y-1">
												<Label className="text-xs">Data Fim</Label>
												<DatePicker
													date={stringToDate(localFilters.dataFimRotaExtra)}
													onChange={(date) => handleFilterChange("dataFimRotaExtra", dateToString(date))}
													disablePast={false}
												/>
											</div>
										</CardContent>
									</Card>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="especificos" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm flex items-center gap-2">
									<Clock className="h-4 w-4" />
									Configurações Específicas
								</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label>Turno</Label>
									<Select
										value={localFilters.turno || "all"}
										onValueChange={(value) => handleFilterChange("turno", value === "all" ? "" : value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Todos os turnos" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos os turnos</SelectItem>
											<SelectItem value="A">A</SelectItem>
											<SelectItem value="B">B</SelectItem>
											<SelectItem value="ADM">ADM</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Refeitório</Label>
									<Select
										value={localFilters.refeitorio || "all"}
										onValueChange={(value) => handleFilterChange("refeitorio", value === "all" ? "" : value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Todos os refeitórios" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos os refeitórios</SelectItem>
											<SelectItem value="Fazenda">Fazenda</SelectItem>
											<SelectItem value="Industria">Indústria</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>É Feriado</Label>
									<Select
										value={localFilters.isFeriado || "all"}
										onValueChange={(value) => handleFilterChange("isFeriado", value === "all" ? "" : value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Todos" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos</SelectItem>
											<SelectItem value="true">Sim</SelectItem>
											<SelectItem value="false">Não</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="quantidades" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm flex items-center gap-2">
									<Users className="h-4 w-4" />
									Filtros por Quantidade
								</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Quantidade Mínima</Label>
									<Input
										type="number"
										placeholder="Ex: 10"
										value={localFilters.quantidadeMin}
										onChange={(e) => handleFilterChange("quantidadeMin", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>Quantidade Máxima</Label>
									<Input
										type="number"
										placeholder="Ex: 100"
										value={localFilters.quantidadeMax}
										onChange={(e) => handleFilterChange("quantidadeMax", e.target.value)}
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<DialogFooter className="flex justify-between">
					<Button variant="outline" onClick={clearFilters}>
						Limpar Todos os Filtros
					</Button>
					<div className="flex gap-2">
						<Button variant="outline" onClick={onClose}>
							Cancelar
						</Button>
						<Button onClick={applyFilters}>Aplicar Filtros</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
