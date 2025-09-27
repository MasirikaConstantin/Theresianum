"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const MONTHS = [
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
] as const
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i)

interface MonthYearPickerProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function MonthYearPicker({ value, onChange, className }: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalMonth, setInternalMonth] = React.useState("")
  const [internalYear, setInternalYear] = React.useState("")

  // Synchronise avec la valeur externe
  React.useEffect(() => {
    if (value) {
      const [year, month] = value.split('-')
      setInternalMonth(month)
      setInternalYear(year)
    } else {
      setInternalMonth("")
      setInternalYear("")
    }
  }, [value])

  const handleMonthChange = (month: string) => {
    setInternalMonth(month)
    if (internalYear) {
      onChange?.(`${internalYear}-${month}`)
      setOpen(false)
    }
  }

  const handleYearChange = (year: string) => {
    setInternalYear(year)
    if (internalMonth) {
      onChange?.(`${year}-${internalMonth}`)
      setOpen(false)
    }
  }

  const displayText = internalMonth && internalYear 
    ? `${MONTHS.find(m => m.value === internalMonth)?.label} ${internalYear}`
    : "Sélectionner mois & année"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-[250px] justify-between ${className}`}
          aria-label="Sélectionner un mois et une année"
        >
          {displayText}
          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-3 space-y-2">
        <Select value={internalMonth} onValueChange={handleMonthChange} >
          <SelectTrigger>
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={internalYear} onValueChange={handleYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  )
}