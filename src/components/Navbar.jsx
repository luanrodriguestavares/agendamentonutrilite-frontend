import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CalendarClock, Menu } from "lucide-react"
import { useState } from "react"

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	return (
		<nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center space-x-4">
						<div className="relative h-12 w-auto overflow-hidden">
							<img
								src="/logo-nutrilite-ts.png"
								alt="Logo Nutrilite"
								className="h-full w-auto object-contain max-w-[120px] sm:max-w-[150px] md:max-w-[180px]"
							/>
						</div>
						<div className="relative h-12 w-auto overflow-hidden">
							<img
								src="/logo-nutribotanica-ts.png"
								alt="Logo Nutribotânica"
								className="h-full w-auto object-contain max-w-[120px] sm:max-w-[150px] md:max-w-[180px]"
							/>
						</div>
					</div>
					<div className="hidden md:flex items-center space-x-2">
						<Link to="/login">
							<Button variant="outline" className="text-emerald-700 border-emerald-700 hover:bg-emerald-50">
								Painel de Agendamentos
							</Button>
						</Link>
					</div>
					<button
						className="md:hidden p-2"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
					>
						<Menu className="h-6 w-6 text-gray-600" />
					</button>
				</div>
				<div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-20' : 'max-h-0'}`}>
					<div className="py-2 border-t">
						<Link to="/login" className="block px-4 py-2">
							<Button variant="outline" className="w-full text-emerald-700 border-emerald-700 hover:bg-emerald-50">
								Painel de Agendamentos
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
