import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, MapPin, Coffee, Building, FileText, Mail, AlertCircle, CheckCircle, XCircle, DollarSign, User, Briefcase, CalendarClock, Utensils, Info, Bus } from "lucide-react"

export default function AgendamentoDetailModal({ agendamento, isOpen, onClose }) {
	if (!agendamento) return null

	const adjustDate = (dateString) => {
		if (!dateString) return null
		const date = new Date(dateString)
		return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
	}

	const getStatusBadge = (status) => {
		if (!status) return null
		switch (status) {
			case "pendente":
				return (
					<Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
						<AlertCircle className="h-3 w-3 mr-1" />
						Pendente
					</Badge>
				)
			case "confirmado":
				return (
					<Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
						<CheckCircle className="h-3 w-3 mr-1" />
						Confirmado
					</Badge>
				)
			case "cancelado":
				return (
					<Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
						<XCircle className="h-3 w-3 mr-1" />
						Cancelado
					</Badge>
				)
			default:
				return (
					<Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-50">
						<AlertCircle className="h-3 w-3 mr-1" />
						{status}
					</Badge>
				)
		}
	}

	const getTipoIcon = (tipo) => {
		if (!tipo) return <Calendar className="h-5 w-5 text-gray-600" />
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
		if (!tipo) return "gray"
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

	const formatRefeicoes = (refeicoes) => {
		if (!refeicoes) return null

		if (typeof refeicoes === "string" && refeicoes.startsWith("[")) {
			try {
				const arr = JSON.parse(refeicoes)
				if (Array.isArray(arr)) return arr.join(", ")
				return arr.toString()
			} catch {
				return refeicoes
			}
		}

		if (Array.isArray(refeicoes)) {
			if (refeicoes.length === 1) return refeicoes[0]
			const limp = refeicoes.map(r => r.trim())
			if (limp.includes("Almoço") && limp.includes("Lanche")) return "Almoço/Lanche"
			if (limp.includes("Jantar") && limp.includes("Ceia")) return "Jantar/Ceia"
			return limp.join(", ")
		}

		// Se for string simples
		if (typeof refeicoes === "string") return refeicoes

		return null
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

	const generateResumo = () => {
		if (!agendamento || !agendamento.tipoAgendamento) {
			return "Informações do agendamento não disponíveis"
		}

		let resumo = `${agendamento.nome || "Nome não informado"} (${agendamento.email || "Email não informado"}) solicitou um agendamento do tipo ${agendamento.tipoAgendamento}`

		switch (agendamento.tipoAgendamento) {
			case "Agendamento para Time":
				const dataInicio = agendamento.dataInicio
					? format(adjustDate(agendamento.dataInicio), "dd/MM/yyyy", { locale: ptBR })
					: "Data não informada"
				const dataFim = agendamento.dataFim
					? format(adjustDate(agendamento.dataFim), "dd/MM/yyyy", { locale: ptBR })
					: "Data não informada"

				resumo += ` para o time ${agendamento.timeSetor || "não informado"}`

				if (agendamento.isFeriado && agendamento.dataFeriado) {
					resumo += ` para o feriado do dia ${format(adjustDate(agendamento.dataFeriado), "dd/MM/yyyy", { locale: ptBR })}`
				} else if (agendamento.dataInicio && agendamento.dataFim) {
					resumo += ` de ${dataInicio} até ${dataFim}`
				}

				if (agendamento.turno) {
					resumo += `, turno ${agendamento.turno}`
				}

				if (agendamento.centroCusto) {
					resumo += `, centro de custo ${agendamento.centroCusto}`
				}

				if (agendamento.refeitorio) {
					resumo += `, no refeitório da ${agendamento.refeitorio}`
				}

				resumo += "."
				break

			case "Home Office":
				const dataInicioHO = agendamento.dataInicio
					? format(adjustDate(agendamento.dataInicio), "dd/MM/yyyy", { locale: ptBR })
					: "Data não informada"
				const dataFimHO = agendamento.dataFim
					? format(adjustDate(agendamento.dataFim), "dd/MM/yyyy", { locale: ptBR })
					: "Data não informada"

				resumo += ` para o time ${agendamento.timeSetor || "não informado"}`

				if (dataInicioHO === dataFimHO) {
					resumo += ` para o dia ${dataInicioHO}`
				} else {
					resumo += ` de ${dataInicioHO} até ${dataFimHO}`
				}

				if (agendamento.refeitorio) {
					resumo += `, no refeitório da ${agendamento.refeitorio}`
				}
				if (agendamento.turno) {
					resumo += `, turno ${agendamento.turno}`
				}
				if (agendamento.refeicoes && Array.isArray(agendamento.refeicoes) && agendamento.refeicoes.length > 0) {
					resumo += `, para as refeições: ${agendamento.refeicoes.join(", ")}`
				}
				resumo += "."
				break

			case "Administrativo - Lanche":
				const dataLanche = agendamento.data
					? format(adjustDate(agendamento.data), "dd/MM/yyyy", { locale: ptBR })
					: "Data não informada"
				resumo += ` para o time ${agendamento.timeSetor || "não informado"} para o dia ${dataLanche}`

				if (agendamento.turno) {
					resumo += `, turno ${agendamento.turno}`
				}

				if (agendamento.refeitorio) {
					resumo += `, no refeitório da ${agendamento.refeitorio}`
				}

				resumo += `, solicitando ${agendamento.refeicoes || "Lanche Individual"}.`
				break

			case "Agendamento para Visitante":
				const dataVisita = agendamento.data
					? format(adjustDate(agendamento.data), "dd/MM/yyyy", { locale: ptBR })
					: "Data não informada"
				resumo += ` para o dia ${dataVisita}, com ${agendamento.quantidadeVisitantes || "quantidade não informada"} visitantes`
				if (agendamento.refeitorio) {
					resumo += ` no refeitório da ${agendamento.refeitorio}`
				}
				if (agendamento.acompanhante) {
					resumo += `, acompanhados por ${agendamento.acompanhante}`
				}
				if (agendamento.centroCusto) {
					resumo += `, centro de custo ${agendamento.centroCusto}`
				}
				resumo += "."
				break

			case "Coffee Break":
				const dataCoffee = agendamento.dataCoffee
					? format(adjustDate(agendamento.dataCoffee), "dd/MM/yyyy", { locale: ptBR })
					: "Data não informada"
				resumo += ` para o time ${agendamento.timeSetor || "não informado"} para o dia ${dataCoffee}`
				if (agendamento.turno) {
					resumo += `, turno ${agendamento.turno}`
				}
				if (agendamento.horario) {
					resumo += ` às ${agendamento.horario}`
				}
				if (agendamento.cardapio) {
					resumo += `, cardápio: ${agendamento.cardapio}`
				}
				if (agendamento.quantidade) {
					resumo += `, para ${agendamento.quantidade} pessoas`
				}
				if (agendamento.centroCusto) {
					resumo += `, centro de custo ${agendamento.centroCusto}`
				}
				if (agendamento.localEntrega) {
					resumo += `, local de entrega: ${agendamento.localEntrega}`
				}
				resumo += "."
				break

			case "Rota Extra":
				const dataInicioRota = agendamento.dataInicio
					? format(adjustDate(agendamento.dataInicio), "dd/MM/yyyy", { locale: ptBR })
					: "Data não informada"
				const dataFimRota = agendamento.dataFim
					? format(adjustDate(agendamento.dataFim), "dd/MM/yyyy", { locale: ptBR })
					: "Data não informada"

				resumo += ` para o time ${agendamento.timeSetor || "não informado"} de ${dataInicioRota} até ${dataFimRota}`
				if (agendamento.dia) {
					resumo += `, categoria: ${agendamento.dia}`
				}
				if (agendamento.centroCusto) {
					resumo += `, centro de custo ${agendamento.centroCusto}`
				}
				if (agendamento.quantidadeTiangua || agendamento.quantidadeUbajara) {
					resumo += `, com ${agendamento.quantidadeTiangua || 0} pessoas em Tianguá e ${agendamento.quantidadeUbajara || 0} pessoas em Ubajara`
				}
				resumo += "."
				break

			default:
				resumo += ". Detalhes não disponíveis."
				break
		}

		return resumo
	}

	const tipoColor = getTipoColor(agendamento.tipoAgendamento)

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
				<DialogHeader className="space-y-4 p-6">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className={`bg-${tipoColor}-100 p-3 rounded-lg`}>{getTipoIcon(agendamento.tipoAgendamento)}</div>
							<div>
								<DialogTitle className="text-xl font-semibold">
									{agendamento.tipoAgendamento || "Tipo não informado"}
								</DialogTitle>
								<p className="text-sm text-gray-500 mt-1">
									Solicitado em{" "}
									{agendamento.createdAt
										? format(new Date(agendamento.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
											locale: ptBR,
										})
										: "Data não disponível"}
								</p>
							</div>
						</div>
						{getStatusBadge(agendamento.status)}
					</div>

					<div className={`bg-${tipoColor}-50 border border-${tipoColor}-200 p-4 rounded-lg`}>
						<div className="flex items-start gap-2">
							<Info className={`h-5 w-5 text-${tipoColor}-600 mt-0.5 flex-shrink-0`} />
							<div>
								<h3 className={`text-sm font-medium text-${tipoColor}-800 mb-1`}>Resumo do Agendamento</h3>
								<p className={`text-sm text-${tipoColor}-700 leading-relaxed`}>{generateResumo()}</p>
							</div>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
							<User className="h-5 w-5 text-gray-600" />
							Solicitante
						</h3>
						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center gap-3">
									<User className="h-4 w-4 text-gray-500" />
									<div>
										<span className="text-xs text-gray-500 uppercase tracking-wide">Nome</span>
										<p className="font-medium">{agendamento.nome}</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<Mail className="h-4 w-4 text-gray-500" />
									<div>
										<span className="text-xs text-gray-500 uppercase tracking-wide">Email</span>
										<p className="font-medium">{agendamento.email}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<Separator />

					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
							{getTipoIcon(agendamento.tipoAgendamento)}
							Detalhes do Agendamento
						</h3>

						{agendamento.tipoAgendamento === "Agendamento para Time" && (
							<div className="space-y-4">
								<div className="bg-emerald-50 p-4 rounded-lg">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex items-center gap-3">
											<Briefcase className="h-4 w-4 text-emerald-600" />
											<div>
												<span className="text-xs text-emerald-600 uppercase tracking-wide">Time/Setor</span>
												<p className="font-medium">{agendamento.timeSetor}</p>
											</div>
										</div>
										{agendamento.centroCusto && (
											<div className="flex items-center gap-3">
												<DollarSign className="h-4 w-4 text-emerald-600" />
												<div>
													<span className="text-xs text-emerald-600 uppercase tracking-wide">Centro de Custo</span>
													<p className="font-medium">{agendamento.centroCusto}</p>
												</div>
											</div>
										)}
										{agendamento.turno && (
											<div className="flex items-center gap-3">
												<Clock className="h-4 w-4 text-emerald-600" />
												<div>
													<span className="text-xs text-emerald-600 uppercase tracking-wide">Turno</span>
													<p className="font-medium">{agendamento.turno}</p>
												</div>
											</div>
										)}
										{agendamento.refeitorio && (
											<div className="flex items-center gap-3">
												<Building className="h-4 w-4 text-emerald-600" />
												<div>
													<span className="text-xs text-emerald-600 uppercase tracking-wide">Refeitório</span>
													<p className="font-medium">{agendamento.refeitorio}</p>
												</div>
											</div>
										)}
										{agendamento.isFeriado && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-emerald-600" />
												<div>
													<span className="text-xs text-emerald-600 uppercase tracking-wide">Tipo</span>
													<p className="font-medium">Feriado</p>
												</div>
											</div>
										)}
										{agendamento.dataFeriado && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-emerald-600" />
												<div>
													<span className="text-xs text-emerald-600 uppercase tracking-wide">Data do Feriado</span>
													<p className="font-medium">
														{format(adjustDate(agendamento.dataFeriado), "dd/MM/yyyy", { locale: ptBR })}
													</p>
												</div>
											</div>
										)}
										{agendamento.dataInicio && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-emerald-600" />
												<div>
													<span className="text-xs text-emerald-600 uppercase tracking-wide">Data Início</span>
													<p className="font-medium">
														{format(adjustDate(agendamento.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
													</p>
												</div>
											</div>
										)}
										{agendamento.dataFim && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-emerald-600" />
												<div>
													<span className="text-xs text-emerald-600 uppercase tracking-wide">Data Fim</span>
													<p className="font-medium">
														{format(adjustDate(agendamento.dataFim), "dd/MM/yyyy", { locale: ptBR })}
													</p>
												</div>
											</div>
										)}
									</div>
								</div>

								{(agendamento.quantidadeAlmocoLanche ||
									agendamento.quantidadeJantarCeia ||
									agendamento.quantidadeLancheExtra) && (
										<div className="bg-white border border-emerald-200 p-4 rounded-lg">
											<h4 className="text-sm font-medium text-emerald-800 mb-3">Quantidade de Refeições</h4>
											<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
												{agendamento.quantidadeAlmocoLanche > 0 && (
													<div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
														<div className="flex items-center gap-2">
															<Utensils className="h-4 w-4 text-emerald-600" />
															<span className="text-sm font-medium">Almoço/Lanche</span>
														</div>
														<span className="text-lg font-bold text-emerald-700">
															{agendamento.quantidadeAlmocoLanche}
														</span>
													</div>
												)}
												{agendamento.quantidadeJantarCeia > 0 && (
													<div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
														<div className="flex items-center gap-2">
															<Utensils className="h-4 w-4 text-emerald-600" />
															<span className="text-sm font-medium">Jantar/Ceia</span>
														</div>
														<span className="text-lg font-bold text-emerald-700">{agendamento.quantidadeJantarCeia}</span>
													</div>
												)}
												{agendamento.quantidadeLancheExtra > 0 && (
													<div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
														<div className="flex items-center gap-2">
															<Utensils className="h-4 w-4 text-emerald-600" />
															<span className="text-sm font-medium">Lanche Extra</span>
														</div>
														<span className="text-lg font-bold text-emerald-700">
															{agendamento.quantidadeLancheExtra}
														</span>
													</div>
												)}
											</div>
										</div>
									)}
							</div>
						)}

						{agendamento.tipoAgendamento === "Home Office" && (
							<div className="space-y-4">
								{console.log("Home Office - Refeições:", agendamento.refeicoes, "Tipo:", typeof agendamento.refeicoes)}
								<div className="bg-blue-50 p-4 rounded-lg">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex items-center gap-3">
											<Briefcase className="h-4 w-4 text-blue-600" />
											<div>
												<span className="text-xs text-blue-600 uppercase tracking-wide">Time/Setor</span>
												<p className="font-medium">{agendamento.timeSetor}</p>
											</div>
										</div>
										{agendamento.dataInicio && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-blue-600" />
												<div>
													<span className="text-xs text-blue-600 uppercase tracking-wide">Data Início</span>
													<p className="font-medium">
														{format(adjustDate(agendamento.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
													</p>
												</div>
											</div>
										)}
										{agendamento.dataFim && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-blue-600" />
												<div>
													<span className="text-xs text-blue-600 uppercase tracking-wide">Data Fim</span>
													<p className="font-medium">
														{format(adjustDate(agendamento.dataFim), "dd/MM/yyyy", { locale: ptBR })}
													</p>
												</div>
											</div>
										)}
										{agendamento.refeitorio && (
											<div className="flex items-center gap-3">
												<Building className="h-4 w-4 text-blue-600" />
												<div>
													<span className="text-xs text-blue-600 uppercase tracking-wide">Refeitório</span>
													<p className="font-medium">{agendamento.refeitorio}</p>
												</div>
											</div>
										)}
										{agendamento.turno && (
											<div className="flex items-center gap-3">
												<Clock className="h-4 w-4 text-blue-600" />
												<div>
													<span className="text-xs text-blue-600 uppercase tracking-wide">Turno</span>
													<p className="font-medium">{agendamento.turno}</p>
												</div>
											</div>
										)}
									</div>
								</div>

								{formatRefeicoes(agendamento.refeicoes) && (
									<div className="bg-white border border-blue-200 p-4 rounded-lg">
										<h4 className="text-sm font-medium text-blue-800 mb-3">Refeições Solicitadas</h4>
										<div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
											<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
												<div className="flex items-center gap-2">
													<Utensils className="h-4 w-4 text-blue-600" />
													<span className="text-sm font-medium">{formatRefeicoes(agendamento.refeicoes)}</span>
												</div>
												<span className="text-lg font-bold text-blue-700">1</span>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{agendamento.tipoAgendamento === "Administrativo - Lanche" && (
							<div className="bg-orange-50 p-4 rounded-lg">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="flex items-center gap-3">
										<Briefcase className="h-4 w-4 text-orange-600" />
										<div>
											<span className="text-xs text-orange-600 uppercase tracking-wide">Time/Setor</span>
											<p className="font-medium">{agendamento.timeSetor}</p>
										</div>
									</div>
									{agendamento.data && (
										<div className="flex items-center gap-3">
											<Calendar className="h-4 w-4 text-orange-600" />
											<div>
												<span className="text-xs text-orange-600 uppercase tracking-wide">Data Solicitada</span>
												<p className="font-medium">
													{format(adjustDate(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}
												</p>
											</div>
										</div>
									)}
									{agendamento.turno && (
										<div className="flex items-center gap-3">
											<Clock className="h-4 w-4 text-orange-600" />
											<div>
												<span className="text-xs text-orange-600 uppercase tracking-wide">Turno</span>
												<p className="font-medium">{agendamento.turno}</p>
											</div>
										</div>
									)}
									{agendamento.refeitorio && (
										<div className="flex items-center gap-3">
											<Building className="h-4 w-4 text-orange-600" />
											<div>
												<span className="text-xs text-orange-600 uppercase tracking-wide">Refeitório</span>
												<p className="font-medium">{agendamento.refeitorio}</p>
											</div>
										</div>
									)}
									<div className="flex items-center gap-3">
										<Coffee className="h-4 w-4 text-orange-600" />
										<div>
											<span className="text-xs text-orange-600 uppercase tracking-wide">Tipo de Refeição</span>
											<p className="font-medium">{agendamento.refeicoes || "Lanche Individual"}</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{agendamento.tipoAgendamento === "Agendamento para Visitante" && (
							<div className="bg-purple-50 p-4 rounded-lg">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{agendamento.data && (
										<div className="flex items-center gap-3">
											<Calendar className="h-4 w-4 text-purple-600" />
											<div>
												<span className="text-xs text-purple-600 uppercase tracking-wide">Data da Visita</span>
												<p className="font-medium">
													{format(adjustDate(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}
												</p>
											</div>
										</div>
									)}
									{agendamento.refeitorio && (
										<div className="flex items-center gap-3">
											<Building className="h-4 w-4 text-purple-600" />
											<div>
												<span className="text-xs text-purple-600 uppercase tracking-wide">Refeitório</span>
												<p className="font-medium">{agendamento.refeitorio}</p>
											</div>
										</div>
									)}
									{agendamento.quantidadeVisitantes !== undefined && agendamento.quantidadeVisitantes !== null && (
										<div className="flex items-center gap-3">
											<Users className="h-4 w-4 text-purple-600" />
											<div>
												<span className="text-xs text-purple-600 uppercase tracking-wide">Visitantes</span>
												<p className="font-medium">{agendamento.quantidadeVisitantes} pessoas</p>
											</div>
										</div>
									)}
									{agendamento.acompanhante && (
										<div className="flex items-center gap-3">
											<User className="h-4 w-4 text-purple-600" />
											<div>
												<span className="text-xs text-purple-600 uppercase tracking-wide">Acompanhante</span>
												<p className="font-medium">{agendamento.acompanhante}</p>
											</div>
										</div>
									)}
									{agendamento.centroCusto && (
										<div className="flex items-center gap-3">
											<DollarSign className="h-4 w-4 text-purple-600" />
											<div>
												<span className="text-xs text-purple-600 uppercase tracking-wide">Centro de Custo</span>
												<p className="font-medium">{agendamento.centroCusto}</p>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{agendamento.tipoAgendamento === "Coffee Break" && (
							<div className="space-y-4">
								<div className="bg-pink-50 p-4 rounded-lg">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex items-center gap-3">
											<Briefcase className="h-4 w-4 text-pink-600" />
											<div>
												<span className="text-xs text-pink-600 uppercase tracking-wide">Time/Setor</span>
												<p className="font-medium">{agendamento.timeSetor}</p>
											</div>
										</div>
										{agendamento.dataCoffee && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-pink-600" />
												<div>
													<span className="text-xs text-pink-600 uppercase tracking-wide">Data do Coffee Break</span>
													<p className="font-medium">
														{format(adjustDate(agendamento.dataCoffee), "dd/MM/yyyy", { locale: ptBR })}
													</p>
												</div>
											</div>
										)}
										{agendamento.turno && (
											<div className="flex items-center gap-3">
												<Clock className="h-4 w-4 text-pink-600" />
												<div>
													<span className="text-xs text-pink-600 uppercase tracking-wide">Turno</span>
													<p className="font-medium">{agendamento.turno}</p>
												</div>
											</div>
										)}
										{agendamento.horario && (
											<div className="flex items-center gap-3">
												<Clock className="h-4 w-4 text-pink-600" />
												<div>
													<span className="text-xs text-pink-600 uppercase tracking-wide">Horário</span>
													<p className="font-medium">{agendamento.horario}</p>
												</div>
											</div>
										)}
										{agendamento.cardapio && (
											<div className="flex items-center gap-3">
												<Coffee className="h-4 w-4 text-pink-600" />
												<div>
													<span className="text-xs text-pink-600 uppercase tracking-wide">Cardápio</span>
													<p className="font-medium">{agendamento.cardapio}</p>
												</div>
											</div>
										)}
										{agendamento.quantidade && (
											<div className="flex items-center gap-3">
												<Users className="h-4 w-4 text-pink-600" />
												<div>
													<span className="text-xs text-pink-600 uppercase tracking-wide">Quantidade</span>
													<p className="font-medium">{agendamento.quantidade} pessoas</p>
												</div>
											</div>
										)}
										{agendamento.centroCusto && (
											<div className="flex items-center gap-3">
												<DollarSign className="h-4 w-4 text-pink-600" />
												<div>
													<span className="text-xs text-pink-600 uppercase tracking-wide">Centro de Custo</span>
													<p className="font-medium">{agendamento.centroCusto}</p>
												</div>
											</div>
										)}
										{agendamento.rateio && (
											<div className="flex items-center gap-3">
												<DollarSign className="h-4 w-4 text-pink-600" />
												<div>
													<span className="text-xs text-pink-600 uppercase tracking-wide">Rateio</span>
													<p className="font-medium">{agendamento.rateio}</p>
												</div>
											</div>
										)}
										{agendamento.localEntrega && (
											<div className="flex items-center gap-3">
												<MapPin className="h-4 w-4 text-pink-600" />
												<div>
													<span className="text-xs text-pink-600 uppercase tracking-wide">Local de Entrega</span>
													<p className="font-medium">{agendamento.localEntrega}</p>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{agendamento.tipoAgendamento === "Rota Extra" && (
							<div className="space-y-4">
								<div className="bg-indigo-50 p-4 rounded-lg">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex items-center gap-3">
											<Briefcase className="h-4 w-4 text-indigo-600" />
											<div>
												<span className="text-xs text-indigo-600 uppercase tracking-wide">Time/Setor</span>
												<p className="font-medium">{agendamento.timeSetor}</p>
											</div>
										</div>
										{agendamento.centroCusto && (
											<div className="flex items-center gap-3">
												<DollarSign className="h-4 w-4 text-indigo-600" />
												<div>
													<span className="text-xs text-indigo-600 uppercase tracking-wide">Centro de Custo</span>
													<p className="font-medium">{agendamento.centroCusto}</p>
												</div>
											</div>
										)}
										{agendamento.dia && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-indigo-600" />
												<div>
													<span className="text-xs text-indigo-600 uppercase tracking-wide">Categoria do Dia</span>
													<p className="font-medium">{agendamento.dia}</p>
												</div>
											</div>
										)}
										{agendamento.dataInicio && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-indigo-600" />
												<div>
													<span className="text-xs text-indigo-600 uppercase tracking-wide">Data Início</span>
													<p className="font-medium">
														{format(adjustDate(agendamento.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
													</p>
												</div>
											</div>
										)}
										{agendamento.dataFim && (
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-indigo-600" />
												<div>
													<span className="text-xs text-indigo-600 uppercase tracking-wide">Data Fim</span>
													<p className="font-medium">
														{format(adjustDate(agendamento.dataFim), "dd/MM/yyyy", { locale: ptBR })}
													</p>
												</div>
											</div>
										)}
									</div>
								</div>

								{(agendamento.quantidadeTiangua || agendamento.quantidadeUbajara) && (
									<div className="bg-white border border-indigo-200 p-4 rounded-lg">
										<h4 className="text-sm font-medium text-indigo-800 mb-3">Quantidade por Cidade</h4>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											{agendamento.quantidadeTiangua > 0 && (
												<div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
													<div className="flex items-center gap-2">
														<MapPin className="h-4 w-4 text-indigo-600" />
														<span className="text-sm font-medium">Tianguá</span>
													</div>
													<span className="text-lg font-bold text-indigo-700">{agendamento.quantidadeTiangua}</span>
												</div>
											)}
											{agendamento.quantidadeUbajara > 0 && (
												<div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
													<div className="flex items-center gap-2">
														<MapPin className="h-4 w-4 text-indigo-600" />
														<span className="text-sm font-medium">Ubajara</span>
													</div>
													<span className="text-lg font-bold text-indigo-700">{agendamento.quantidadeUbajara}</span>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					{agendamento.observacao && (
						<>
							<Separator />
							<div>
								<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
									<FileText className="h-5 w-5 text-gray-600" />
									Observações
								</h3>
								<div className="bg-gray-50 p-4 rounded-lg">
									<p className="text-gray-700 leading-relaxed">{agendamento.observacao}</p>
								</div>
							</div>
						</>
					)}

					{agendamento.status === "cancelado" && (
						<>
							<Separator />
							<div>
								<h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
									<XCircle className="h-5 w-5 text-red-600" />
									Cancelamento
								</h3>
								<div className="bg-red-50 border border-red-200 p-4 rounded-lg">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{agendamento.motivoCancelamento ? (
											<div className="flex items-center gap-3">
												<FileText className="h-4 w-4 text-red-600" />
												<div>
													<span className="text-xs text-red-600 uppercase tracking-wide">Motivo</span>
													<p className="font-medium">{agendamento.motivoCancelamento}</p>
												</div>
											</div>
										) : (
											<span className="text-red-700 text-sm">Este agendamento foi cancelado.</span>
										)}
									</div>
								</div>
							</div>
						</>
					)}

					<Separator />
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
							<CalendarClock className="h-5 w-5 text-gray-600" />
							Informações do Sistema
						</h3>
						<div className="bg-gray-50 p-4 rounded-lg">
							<div className="flex items-center gap-3">
								<Calendar className="h-4 w-4 text-gray-500" />
								<div>
									<span className="text-xs text-gray-500 uppercase tracking-wide">Data de Criação</span>
									<p className="font-medium">
										{format(new Date(agendamento.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
