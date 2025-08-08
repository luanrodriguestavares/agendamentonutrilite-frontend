
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Loader2, User, Mail, FileText, Utensils } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

import AgendamentoTimeForm from "./forms/AgendamentoTimeForm"
import HomeOfficeForm from "./forms/HomeOfficeForm"
import SolicitacaoLancheForm from "./forms/SolicitacaoLancheForm"
import AgendamentoVisitanteForm from "./forms/AgendamentoVisitanteForm"
import CoffeeBreakForm from "./forms/CoffeeBreakForm"
import RotaExtraForm from "./forms/RotaExtraForm"
import ErrorModal from "./ErrorModal"
import Alertas from "./Alertas"
import { validarFormulario } from "@/utils/validacoes-formulario"

const FormularioAgendamento = ({ formData, setFormData, onSubmit }) => {
	const { toast } = useToast()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errorModalOpen, setErrorModalOpen] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const [errorTitle, setErrorTitle] = useState("")
	const [dadosEspecificos, setDadosEspecificos] = useState({})
	const [errosValidacao, setErrosValidacao] = useState([])
	const [mensagemSucesso, setMensagemSucesso] = useState("")

	const tiposAgendamentoPorServico = {
		Refeição: [
			{ value: "Home Office", label: "Agendamento Home Office/Individual" },
			{ value: "Administrativo - Lanche", label: "Solicitação Lanche" },
			{ value: "Agendamento para Time", label: "Agendamento para Time" },
			{ value: "Agendamento para Visitante", label: "Agendamento para Visitante" },
		],
		Transporte: [{ value: "Rota Extra", label: "Rota Extra" }],
		"Serviço Serlares": [{ value: "Coffee Break", label: "Solicitação de Coffee Break" }],
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleTipoServicoChange = (value) => {
		setFormData((prev) => ({
			...prev,
			tipoServico: value,
			tipoAgendamento: "",
		}))
		setDadosEspecificos({})
		setErrosValidacao([])
		setMensagemSucesso("")
	}

	const handleTipoAgendamentoChange = (value) => {
		setFormData((prev) => ({
			...prev,
			tipoAgendamento: value,
		}))
		setDadosEspecificos({})
		setErrosValidacao([])
		setMensagemSucesso("")
	}

	const handleDadosEspecificosChange = (dados) => {
		setDadosEspecificos(dados)
	}

	const showError = (title, message) => {
		setErrorTitle(title)
		setErrorMessage(message)
		setErrorModalOpen(true)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setIsSubmitting(true)
		setErrosValidacao([])
		setMensagemSucesso("")

		const dadosCompletos = {
			...formData,
			...dadosEspecificos,
		}

		const resultadoValidacao = validarFormulario(dadosCompletos)

		if (!resultadoValidacao.valido) {
			setErrosValidacao(resultadoValidacao.erros)

			const mensagemFormatada = resultadoValidacao.erros.join('\n')
			showError("Erro de Validação", mensagemFormatada)

			setIsSubmitting(false)
			return
		}

		try {
			const payload = {
				nome: formData.nome,
				email: formData.email,
				tipoServico: formData.tipoServico,
				tipoAgendamento: formData.tipoAgendamento,
				...dadosEspecificos,
			}

			await onSubmit(payload)
			setMensagemSucesso("Formulário enviado com sucesso!")
		} catch (error) {
			console.error("Erro ao enviar formulário:", error)
			setErrosValidacao(["Erro ao enviar formulário. Tente novamente."])
			showError("Erro no Envio", "Ocorreu um erro ao enviar o formulário. Tente novamente.")
		} finally {
			setIsSubmitting(false)
		}
	}

	const renderFormularioEspecifico = () => {
		const props = {
			dados: dadosEspecificos,
			onChange: handleDadosEspecificosChange,
			onError: showError,
		}

		switch (formData.tipoAgendamento) {
			case "Agendamento para Time":
				return <AgendamentoTimeForm {...props} />
			case "Home Office":
				return <HomeOfficeForm {...props} />
			case "Administrativo - Lanche":
				return <SolicitacaoLancheForm {...props} />
			case "Agendamento para Visitante":
				return <AgendamentoVisitanteForm {...props} />
			case "Coffee Break":
				return <CoffeeBreakForm {...props} />
			case "Rota Extra":
				return <RotaExtraForm {...props} />
			default:
				return null
		}
	}

	const getOpcoesAgendamento = () => {
		if (!formData.tipoServico) return []
		return tiposAgendamentoPorServico[formData.tipoServico] || []
	}

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-4xl px-4 mx-auto">
			<h1 className="text-2xl md:text-3xl font-bold text-center text-emerald-700 mb-4">
				Agendamento de Refeições e Transporte
			</h1>
			<Separator className="mb-6 bg-gray-300" />

			{mensagemSucesso && (
				<Alertas
					tipo="sucesso"
					mensagens={mensagemSucesso}
					onClose={() => setMensagemSucesso("")}
				/>
			)}

<			Card className="mb-8 overflow-hidden">
				<div className="bg-emerald-50 border-b px-4 py-3">
					<h5 className="text-lg font-semibold text-emerald-800">Prazos de Agendamentos e Cancelamentos</h5>
				</div>
				<div className="p-4 pt-5 bg-white">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
						<div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
							<p className="text-sm font-medium flex items-start gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
								<span>
									<strong>ALMOÇO</strong> do dia solicitado:
								</span>
							</p>
							<p className="text-sm ml-4 mt-1"><strong>Agendamento:</strong> Até 07:30h do mesmo dia</p>
							<p className="text-sm ml-4 mt-1"><strong>Cancelamento:</strong> Até 07:35h do mesmo dia</p>
						</div>

						<div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
							<p className="text-sm font-medium flex items-start gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
								<span>
									<strong>ALMOÇO</strong> do dia seguinte:
								</span>
							</p>
							<p className="text-sm ml-4 mt-1"><strong>Agendamento:</strong> Qualquer horário do dia anterior</p>
							<p className="text-sm ml-4 mt-1"><strong>Cancelamento:</strong> Qualquer horário do dia anterior</p>
						</div>

						<div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
							<p className="text-sm font-medium flex items-start gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
								<span>
									<strong>LANCHE DAS 16h</strong> do dia solicitado:
								</span>
							</p>
							<p className="text-sm ml-4 mt-1"><strong>Agendamento:</strong> Até 09:00h do mesmo dia</p>
							<p className="text-sm ml-4 mt-1"><strong>Cancelamento:</strong> Até 09:05h do mesmo dia</p>
						</div>

						<div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
							<p className="text-sm font-medium flex items-start gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
								<span>
									<strong>LANCHE DAS 16h</strong> do dia seguinte:
								</span>
							</p>
							<p className="text-sm ml-4 mt-1"><strong>Agendamento:</strong> Qualquer horário do dia anterior</p>
							<p className="text-sm ml-4 mt-1"><strong>Cancelamento:</strong> Qualquer horário do dia anterior</p>
						</div>

						<div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
							<p className="text-sm font-medium flex items-start gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
								<span>
									<strong>JANTAR e CEIA</strong> do dia solicitado:
								</span>
							</p>
							<p className="text-sm ml-4 mt-1"><strong>Agendamento:</strong> Até 07:30h do mesmo dia</p>
							<p className="text-sm ml-4 mt-1"><strong>Cancelamento:</strong> Até 09:05h do mesmo dia</p>
						</div>

						<div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
							<p className="text-sm font-medium flex items-start gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
								<span>
									<strong>JANTAR e CEIA</strong> do dia seguinte:
								</span>
							</p>
							<p className="text-sm ml-4 mt-1"><strong>Agendamento:</strong> Qualquer horário do dia anterior</p>
							<p className="text-sm ml-4 mt-1"><strong>Cancelamento:</strong> Qualquer horário do dia anterior</p>
						</div>

						<div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
							<p className="text-sm font-medium flex items-start gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
								<span>
									<strong>COFFEE BREAK</strong>:
								</span>
							</p>
							<p className="text-sm ml-4 mt-1"><strong>Agendamento:</strong> Até 12:00h do dia anterior</p>
							<p className="text-sm ml-4 mt-1"><strong>Cancelamento:</strong> Até 12:00h do dia anterior</p>
						</div>

						<div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
							<p className="text-sm font-medium flex items-start gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
								<span>
									<strong>ROTA EXTRA</strong>:
								</span>
							</p>
							<p className="text-sm ml-4 mt-1"><strong>Agendamento Dia Útil:</strong> Qualquer horário do dia anterior</p>
							<p className="text-sm ml-4 mt-1"><strong>Agendamento Fim de Semana:</strong> Até sexta-feira às 11:00h</p>
							<p className="text-sm ml-4 mt-1"><strong>Cancelamento:</strong> Até sexta-feira às 11:00h</p>
						</div>

						<div className="bg-gray-50 border border-gray-200 p-3 rounded-md md:col-span-2">
							<p className="text-sm font-medium flex items-start gap-2">
								<span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
								<span>
									<strong>PROGRAMAÇÃO DE FINAL DE SEMANA</strong>:
								</span>
							</p>
							<p className="text-sm ml-4 mt-1">Sexta-feira até às 09:00h</p>
						</div>
					</div>

					<div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
						<p className="text-sm font-medium text-emerald-800 mb-2">
							<strong>REGRAS ESPECÍFICAS DE CANCELAMENTO:</strong>
						</p>
						<div className="space-y-2 text-sm text-emerald-800">
							<p><strong>• Fins de semana/Feriado - Almoço:</strong> Cancelamento até 13:30h do dia anterior</p>
							<p><strong>• Fins de semana/Feriado - Jantar e Ceia:</strong> Cancelamento até 12:00h do dia solicitado</p>
							<p><strong>• Fins de semana/Feriado - Lanche:</strong> Cancelamento até 12:00h do dia solicitado</p>
						</div>
					</div>

					<div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
						<p className="text-sm font-medium text-amber-800">
							<strong>ATENÇÃO:</strong>
						</p>
						<p className="text-sm text-amber-800 mt-1">
							O sistema permite apenas um agendamento por turno. Para agendar mais de um turno, faça um agendamento por
							vez.
						</p>
						<p className="text-sm text-amber-700 mt-2">
							Em caso de dúvidas, por gentileza, entre em contato com <b>servicosnutriliteagendamento@gmail.com</b>.
						</p>
					</div>
				</div>
			</Card>

			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="inputNome" className="flex items-center gap-2">
							<User className="h-4 w-4 text-emerald-600" />
							Nome Completo:
						</Label>
						<Input
							type="text"
							id="inputNome"
							name="nome"
							value={formData.nome}
							onChange={handleInputChange}
							className="w-full"
							placeholder="Digite seu nome completo"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="inputEmail" className="flex items-center gap-2">
							<Mail className="h-4 w-4 text-emerald-600" />
							Seu Email:
						</Label>
						<Input
							type="email"
							id="inputEmail"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							className="w-full"
							placeholder="nome@email.com"
							required
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="selectTipoServico" className="flex items-center gap-2">
							<Utensils className="h-4 w-4 text-emerald-600" />
							Tipo de Serviço:
						</Label>
						<Select name="tipoServico" value={formData.tipoServico || ""} onValueChange={handleTipoServicoChange}>
							<SelectTrigger id="selectTipoServico" className="w-full">
								<SelectValue placeholder="Selecione" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Refeição">Refeição</SelectItem>
								<SelectItem value="Transporte">Transporte</SelectItem>
								<SelectItem value="Serviço Serlares">Serviço Serlares</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="tipoAgendamento" className="flex items-center gap-2">
							<FileText className="h-4 w-4 text-emerald-600" />
							Tipo de Agendamento:
						</Label>
						<Select
							name="tipoAgendamento"
							value={formData.tipoAgendamento}
							onValueChange={handleTipoAgendamentoChange}
							disabled={!formData.tipoServico}
						>
							<SelectTrigger id="tipoAgendamento" className="w-full">
								<SelectValue
									placeholder={
										!formData.tipoServico ? "Primeiro selecione o tipo de serviço" : "Selecione o tipo de agendamento"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{getOpcoesAgendamento().map((opcao) => (
									<SelectItem key={opcao.value} value={opcao.value}>
										{opcao.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{formData.tipoAgendamento && <div className="mt-6">{renderFormularioEspecifico()}</div>}

				<Button
					type="submit"
					className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 py-6 text-base"
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-5 w-5 animate-spin" />
							Enviando...
						</>
					) : (
						"Enviar Solicitação"
					)}
				</Button>
			</div>
			<ErrorModal
				isOpen={errorModalOpen}
				onClose={() => setErrorModalOpen(false)}
				title={errorTitle}
				message={errorMessage}
			/>
		</form>
	)
}

export default FormularioAgendamento

