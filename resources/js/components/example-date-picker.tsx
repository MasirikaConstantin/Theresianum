"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface DatePickerProps {
  label?: string
  value?: Date | string
  onChange?: (date: string | undefined) => void
  className?: string
  buttonClassName?: string
  placeholder?: string
  required?: boolean
}

export function MonDatePicker({
  label = "Date",
  value,
  onChange,
  className,
  buttonClassName,
  placeholder = "Sélectionner une date",
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  const handleSelect = (date: Date | undefined) => {
    setInternalDate(date)
    // Formatte en YYYY-MM-DD sans problèmes de fuseau horaire
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : undefined
    onChange?.(formattedDate)
    setOpen(false)
  }

  React.useEffect(() => {
    setInternalDate(value ? new Date(value) : undefined)
  }, [value])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Label htmlFor="date-picker" className="px-1 mb-0">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen} >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker"
            className={cn("w-48 justify-between font-normal mt-0", buttonClassName)}
          >
            {internalDate ? (
              format(internalDate, 'PPP', { locale: fr })
            ) : (
              placeholder
            )}
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 mt-0" align="start">
          <Calendar
            mode="single"
            selected={internalDate}
            onSelect={handleSelect}
            initialFocus
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear() + 10}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}