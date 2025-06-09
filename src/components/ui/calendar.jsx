import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { ptBR } from "date-fns/locale"

function CustomCaption({ displayMonth }) {
	return (
		<div className="text-center text-sm font-medium mb-2">
			{displayMonth.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
		</div>
	)
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
	const dayPickerRef = React.useRef()
	const [month, setMonth] = React.useState(props.month || new Date())

	const goToMonth = (newMonth) => {
		setMonth(newMonth)
		if (props.onMonthChange) props.onMonthChange(newMonth)
	}

	const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1)
	const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1)

	return (
		<div className="w-[308px] h-[340px] relative">
			<DayPicker
				ref={dayPickerRef}
				month={month}
				showOutsideDays={showOutsideDays}
				className={cn("p-3", className)}
				locale={ptBR}
				classNames={{
					months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
					month: "space-y-4",
					caption: "flex justify-center pt-1 relative items-center",
					caption_label: "text-sm font-medium",
					nav: "hidden",
					table: "w-full border-collapse space-y-1",
					head_row: "flex",
					head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
					row: "flex w-full mt-2",
					cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
					day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
					day_range_end: "day-range-end",
					day_selected:
						"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
					day_today: "bg-accent text-accent-foreground",
					day_outside:
						"day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
					day_disabled: "text-muted-foreground opacity-50",
					day_range_middle:
						"aria-selected:bg-accent aria-selected:text-accent-foreground",
					day_hidden: "invisible",
					...classNames,
				}}
				components={{
					Caption: CustomCaption,
				}}
				{...props}
				onMonthChange={goToMonth}
			/>
			<div className="absolute bottom-0 left-0 w-full flex justify-center space-x-4 mb-2">
				<button
					type="button"
					onClick={() => goToMonth(previousMonth)}
					className="h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 mx-2"
				>
					<ChevronLeft className="h-6 w-6" />
				</button>
				<button
					type="button"
					onClick={() => goToMonth(nextMonth)}
					className="h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 mx-2"
				>
					<ChevronRight className="h-6 w-6" />
				</button>
			</div>
		</div>
	)
}
Calendar.displayName = "Calendar"

export { Calendar } 