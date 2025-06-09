import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Lock, Shield, User, Mail, Eye, EyeOff } from 'lucide-react';
import ErrorModal from '@/components/ErrorModal';

export default function Login() {
	const navigate = useNavigate();
	const { signIn } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorModalOpen, setErrorModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await signIn(email, password);
			navigate('/gerenciamento');
		} catch (error) {
			setErrorMessage('Email ou senha inválidos');
			setErrorModalOpen(true);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-700 to-emerald-900 p-4">
			<div className="w-full max-w-md">
				<div className="flex justify-start mb-4">
					<Link to="/">
						<Button variant="outline" className="text-emerald-700 border-emerald-700 hover:bg-emerald-50">
							Voltar para Agendamento
						</Button>
					</Link>
				</div>

				<Card className="mb-6 overflow-hidden">
					<div className="bg-emerald-50 border-b px-6 py-4">
						<div className="flex items-center justify-center">
							<div className="bg-emerald-100 border border-emerald-500 p-3 rounded-full mr-3">
								<Shield className="h-8 w-8 text-emerald-700" />
							</div>
							<div className="text-left">
								<h1 className="text-lg font-bold text-emerald-800">Sistema de Agendamento</h1>
								<p className="text-sm text-emerald-600">Painel Administrativo</p>
							</div>
						</div>
					</div>
				</Card>

				<Card className="overflow-hidden shadow-xl">
					<CardHeader className="bg-white border-b">
						<div className="flex flex-col items-center">
							<div className="bg-emerald-100 p-4 rounded-full mb-4">
								<Lock className="h-10 w-10 text-emerald-700" />
							</div>
							<h2 className="text-xl font-bold text-gray-900">Acesso Administrativo</h2>
							<p className="text-sm text-gray-600 text-center mt-2">
								Entre com as credenciais para acessar o sistema
							</p>
						</div>
					</CardHeader>

					<CardContent className="p-6 bg-white">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
									<Mail className="h-4 w-4 text-emerald-600" />
									Email
								</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="seu@email.com"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password" className="flex items-center gap-2 text-gray-700">
									<Lock className="h-4 w-4 text-emerald-600" />
									Senha
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										required
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4 text-gray-500" />
										) : (
											<Eye className="h-4 w-4 text-gray-500" />
										)}
									</Button>
								</div>
							</div>

							<Separator className="my-6" />

							<Button
								type="submit"
								className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 h-12 text-base font-medium"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-5 w-5 animate-spin" />
										Entrando...
									</>
								) : (
									<>
										<User className="mr-2 h-5 w-5" />
										Entrar no Sistema
									</>
								)}
							</Button>
						</form>

						<div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
							<p className="text-sm text-emerald-800 text-center">
								<strong>Acesso restrito</strong> apenas para administradores autorizados
							</p>
						</div>
					</CardContent>
				</Card>

				<div className="mt-6 text-center">
					<p className="text-white/80 text-sm">
						© Fazenda Amway Nutrilite Brasil
					</p>
				</div>
			</div>

			<ErrorModal
				isOpen={errorModalOpen}
				onClose={() => setErrorModalOpen(false)}
				title="Erro ao fazer login"
				message={errorMessage}
			/>
		</div>
	);
}
