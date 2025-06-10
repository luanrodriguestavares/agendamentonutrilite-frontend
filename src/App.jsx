import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "./components/Navbar"
import FormularioAgendamento from "./components/FormularioAgendamento"
import Footer from "./components/Footer"
import ErrorModal from "./components/ErrorModal"
import { CalendarClock } from "lucide-react"
import { createAgendamento } from "./services/api"
import { format } from "date-fns"
import Login from "./pages/Login"
import Admin from "./pages/Admin"
import { useAuth } from "@/contexts/AuthContext"
import CancelarAgendamento from "./pages/CancelarAgendamento"

function PrivateRoute({ children }) {
	const { signed, loading } = useAuth()

	if (loading) {
		return <div>Carregando...</div>
	}

	if (!signed) {
		return <Navigate to="/login" />
	}

	return children
}

function App() {
	const { toast } = useToast()
	const [formData, setFormData] = useState({
		nome: "",
		email: "",
		tipoAgendamento: "",
		tipoServico: "",
	})

	const [successModalOpen, setSuccessModalOpen] = useState(false)
	const [successMessage, setSuccessMessage] = useState("")

	const handleFormSubmit = async (data) => {
		try {
			const dadosFormatados = {
				...data,
				dataFeriado: data.dataFeriado,
				dataInicio: data.dataInicio,
				dataFim: data.dataFim,
				dataVisita: data.dataVisita,
			}

			await createAgendamento(dadosFormatados)
			setSuccessMessage("Seu agendamento foi registrado no sistema.")
			setSuccessModalOpen(true)
			setFormData({
				nome: "",
				email: "",
				tipoAgendamento: "",
				tipoServico: "",
			})
		} catch (error) {
			toast({
				title: "Erro no envio de dados",
				description: error.response?.data?.message || error.response?.data?.error || "Ocorreu um erro ao processar seu agendamento. Tente novamente.",
				variant: "destructive",
			})
			console.error("Erro no envio:", error)
		}
	}

	return (
		<Router>
			<AuthProvider>
				<div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-700 to-emerald-900">
					<Routes>
						<Route
							path="/"
							element={
								<>
									<Navbar />
									<main className="flex-grow container mx-auto px-4 py-8">
										<div className="flex justify-center my-20">
											<div className="bg-white rounded-2xl shadow-xl p-2 sm:p-4 md:p-8 lg:p-12">
												<div className="flex flex-col items-center mb-8">
													<div className="bg-emerald-100 p-3 rounded-full mb-4">
														<CalendarClock className="h-8 w-8 text-emerald-700" />
													</div>
													<FormularioAgendamento formData={formData} setFormData={setFormData} onSubmit={handleFormSubmit} />
												</div>
											</div>
										</div>
									</main>
									<Footer />
								</>
							}
						/>
						<Route path="/login" element={<Login />} />
						<Route
							path="/gerenciamento"
							element={
								<PrivateRoute>
									<Admin />
								</PrivateRoute>
							}
						/>
						<Route path="/cancelar-agendamento/:id" element={<CancelarAgendamento />} />
					</Routes>
					<Toaster />

					<ErrorModal
						isOpen={successModalOpen}
						onClose={() => {
							setSuccessModalOpen(false)
							window.location.reload()
						}}
						title="Agendamento realizado com sucesso!"
						message={successMessage}
						variant="success"
					/>
				</div>
			</AuthProvider>
		</Router>
	)
}

export default App
