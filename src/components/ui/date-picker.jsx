import * as React from "react"
import { format, startOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ date, onChange, className, placeholder = "Selecione uma data", disabled }) {
	const [open, setOpen] = React.useState(false)

	const disabledDays = {
		before: startOfDay(new Date())
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-full justify-start text-left font-normal border-gray-300",
						!date && "text-muted-foreground",
						className
					)}
					disabled={disabled}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0 shadow-lg border-gray-300" align="start">
				<style>{`
          .rdp-day_disabled {
            color: rgba(156, 163, 175, 0.3) !important;
          }
        `}</style>
				<Calendar
					mode="single"
					selected={date}
					onSelect={(selected) => {
						setOpen(false)
						if (onChange) onChange(selected)
					}}
					initialFocus
					disabled={disabledDays}
					className={cn(
						"rounded-md border",
						"[&_.rdp-day_disabled]:cursor-not-allowed",
						"[&_.rdp-day_disabled]:bg-gray-500",
						"[&_.rdp-day_disabled:hover]:bg-transparent",
						"[&_.rdp-day_disabled:focus]:outline-none",
						"[&_.rdp-day_disabled:active]:bg-transparent",
						"[&_.rdp-day_disabled]:text-gray-400",
						"[&_.rdp-day_disabled]:opacity-30",
						"[&_.rdp-day_disabled]:line-through"
					)}
				/>
			</PopoverContent>
		</Popover>
	)
} 