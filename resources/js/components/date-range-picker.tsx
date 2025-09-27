"use client"

import * as React from "react"
import { formatISO } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
export default function DateRangePicker({
  dateDebut,
  dateFin,
  setDateDebut,
  setDateFin,
  resetFilters
}: {
  dateDebut: string
  dateFin: string
  setDateDebut: (date: string) => void
  setDateFin: (date: string) => void
  resetFilters: () => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>Date de début</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal mt-1"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateDebut ? format(new Date(dateDebut + 'T00:00:00'), 'PPP', { locale: fr }) : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              locale={fr}
              selected={dateDebut ? new Date(dateDebut + 'T00:00:00') : undefined}
              onSelect={(date) => {
                if (!date) {
                  setDateDebut('')
                  return
                }
                const localDateStr = formatISO(date, { representation: 'date' })
                setDateDebut(localDateStr)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Date de fin</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal mt-1"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFin ? format(new Date(dateFin + 'T00:00:00'), 'PPP', { locale: fr }) : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              locale={fr}
              selected={dateFin ? new Date(dateFin + 'T00:00:00') : undefined}
              onSelect={(date) => {
                if (!date) {
                  setDateFin('')
                  return
                }
                const localDateStr = formatISO(date, { representation: 'date' })
                setDateFin(localDateStr)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-end">
        <Button variant="outline" onClick={resetFilters}>
          Réinitialiser
        </Button>
      </div>
    </div>
  )
}