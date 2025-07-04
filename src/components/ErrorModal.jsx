import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

const ErrorModal = ({ isOpen, onClose, title, message, variant = "error" }) => {
	const isSuccess = variant === "success"

	const isList = message && message.includes('\n')

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md z-[9999]">
				<DialogHeader>
					<DialogTitle className={`flex items-center gap-2 ${isSuccess ? "text-emerald-600" : "text-destructive"}`}>
						{isSuccess ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
						{title || (isSuccess ? "Sucesso" : "Atenção")}
					</DialogTitle>
					<DialogDescription className="pt-2 text-base text-foreground">
						{isList ? (
							<div className="space-y-2">
								{message.split('\n').filter(line => line.trim()).map((erro, index) => (
									<div key={index} className="flex items-start gap-2">
										<span className="text-red-500 mt-1">•</span>
										<span>{erro.trim()}</span>
									</div>
								))}
							</div>
						) : (
							message
						)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-center">
					<Button
						onClick={onClose}
						className={`w-full ${isSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-600 hover:bg-gray-700"}`}
					>
						Entendi
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default ErrorModal
