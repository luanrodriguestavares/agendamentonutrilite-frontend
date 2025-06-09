"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const TimeInput = React.forwardRef(({ className, value, onChange, placeholder = "00:00", disabled, ...props }, ref) => {
    const [time, setTime] = React.useState(value || "")

    const formatTime = (input) => {
        // Remove tudo que não é número
        const numbers = input.replace(/\D/g, "")

        if (numbers.length === 0) return ""
        if (numbers.length <= 2) return numbers
        if (numbers.length <= 4) {
            const hours = numbers.slice(0, 2)
            const minutes = numbers.slice(2, 4)
            return `${hours}:${minutes}`
        }

        // Limita a 4 dígitos
        const hours = numbers.slice(0, 2)
        const minutes = numbers.slice(2, 4)
        return `${hours}:${minutes}`
    }

    const validateTimeRealTime = (timeString) => {
        if (!timeString) return timeString

        // If we have at least 2 characters, validate hours
        if (timeString.length >= 2) {
            const hours = timeString.slice(0, 2)
            const hoursNum = Number.parseInt(hours)

            // If hours exceed 23, cap at 23
            if (hoursNum > 23) {
                const remaining = timeString.slice(2)
                return `23${remaining}`
            }
        }

        // If we have the full format HH:MM, validate minutes too
        if (timeString.length === 5 && timeString.includes(":")) {
            const [hours, minutes] = timeString.split(":")
            const h = Math.min(23, Math.max(0, Number.parseInt(hours) || 0))
            const m = Math.min(59, Math.max(0, Number.parseInt(minutes) || 0))
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
        }

        return timeString
    }

    const validateTime = (timeString) => {
        if (!timeString || timeString.length < 5) return timeString

        const [hours, minutes] = timeString.split(":")
        const h = Math.min(23, Math.max(0, Number.parseInt(hours) || 0))
        const m = Math.min(59, Math.max(0, Number.parseInt(minutes) || 0))

        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    }

    const handleChange = (e) => {
        const formatted = formatTime(e.target.value)
        // Add real-time validation for hours
        const validated = validateTimeRealTime(formatted)
        setTime(validated)
        onChange?.(validated)
    }

    const handleBlur = (e) => {
        const validated = validateTime(time)
        setTime(validated)
        onChange?.(validated)
    }

    React.useEffect(() => {
        if (value !== undefined) {
            setTime(value)
        }
    }, [value])

    return (
        <div className="relative">
            <input
                ref={ref}
                type="text"
                inputMode="numeric"
                value={time}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "flex h-12 w-full rounded-lg border border-gray-300 bg-background px-4 py-3 pr-12 text-base ring-offset-background",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-colors hover:bg-accent/50",
                    "touch-manipulation font-mono tracking-wider",
                    "md:h-10 md:px-3 md:py-2 md:pr-10 md:text-sm",
                    className,
                )}
                {...props}
            />
            <Clock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground md:right-3 md:h-4 md:w-4" />
        </div>
    )
})
TimeInput.displayName = "TimeInput"

const TimePicker = React.forwardRef(({ className, value, onChange, disabled, ...props }, ref) => {
    const [hours, setHours] = React.useState("")
    const [minutes, setMinutes] = React.useState("")

    React.useEffect(() => {
        if (value) {
            const [h, m] = value.split(":")
            setHours(h || "")
            setMinutes(m || "")
        }
    }, [value])

    const handleHoursChange = (e) => {
        let h = e.target.value.replace(/\D/g, "").slice(0, 2)

        // Validate hours in real-time
        if (h.length === 1 && Number.parseInt(h) > 2) {
            h = "2" // If first digit > 2, set to 2
        } else if (h.length === 2) {
            const hoursNum = Number.parseInt(h)
            if (hoursNum > 23) h = "23"
            if (hoursNum < 0) h = "00"
        }

        setHours(h)

        const timeValue = `${h.padStart(2, "0")}:${minutes.padStart(2, "0")}`
        onChange?.(timeValue)
    }

    const handleMinutesChange = (e) => {
        let m = e.target.value.replace(/\D/g, "").slice(0, 2)

        // Validate minutes in real-time
        if (m.length === 1 && Number.parseInt(m) > 5) {
            m = "5" // If first digit > 5, set to 5
        } else if (m.length === 2) {
            const minutesNum = Number.parseInt(m)
            if (minutesNum > 59) m = "59"
            if (minutesNum < 0) m = "00"
        }

        setMinutes(m)

        const timeValue = `${hours.padStart(2, "0")}:${m.padStart(2, "0")}`
        onChange?.(timeValue)
    }

    return (
        <div className={cn("flex items-center gap-2", className)} ref={ref} {...props}>
            <div className="relative flex-1">
                <input
                    type="text"
                    inputMode="numeric"
                    value={hours}
                    onChange={handleHoursChange}
                    placeholder="00"
                    disabled={disabled}
                    maxLength={2}
                    className={cn(
                        "flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-center ring-offset-background",
                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-colors hover:bg-accent/50",
                        "touch-manipulation font-mono tracking-wider",
                        "md:h-10 md:px-3 md:py-2 md:text-sm",
                    )}
                />
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground md:bottom-0.5">
                    horas
                </span>
            </div>

            <span className="text-2xl font-bold text-muted-foreground md:text-xl">:</span>

            <div className="relative flex-1">
                <input
                    type="text"
                    inputMode="numeric"
                    value={minutes}
                    onChange={handleMinutesChange}
                    placeholder="00"
                    disabled={disabled}
                    maxLength={2}
                    className={cn(
                        "flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-center ring-offset-background",
                        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-colors hover:bg-accent/50",
                        "touch-manipulation font-mono tracking-wider",
                        "md:h-10 md:px-3 md:py-2 md:text-sm",
                    )}
                />
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground md:bottom-0.5">
                    minutos
                </span>
            </div>
        </div>
    )
})
TimePicker.displayName = "TimePicker"

const NativeTimeInput = React.forwardRef(({ className, ...props }, ref) => (
    <input
        ref={ref}
        type="time"
        className={cn(
            "flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors hover:bg-accent/50",
            "touch-manipulation",
            "md:h-10 md:px-3 md:py-2 md:text-sm",
            "[&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100",
            className,
        )}
        {...props}
    />
))
NativeTimeInput.displayName = "NativeTimeInput"

export { TimeInput, TimePicker, NativeTimeInput }
