"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface SelectOption {
  value: string
  label: string
  searchableText?: string // Pour la recherche étendue
  originalData?: any // Pour garder les données originales
}

interface RecherchePopoverProps {
  options: SelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  onValueChange?: (value: string, originalData?: any) => void
  value?: string
}

export function RecherchePopover({
  options,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat trouvé.",
  className,
  onValueChange,
  value: controlledValue
}: RecherchePopoverProps) {
  const [open, setOpen] = React.useState(false)
  
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = React.useState("")
  
  const value = isControlled ? controlledValue : internalValue

  const handleValueChange = (newValue: string) => {
    const selectedOption = options.find(opt => opt.value === newValue)
    
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue, selectedOption?.originalData)
    setOpen(false)
  }

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.searchableText || option.label} // Utilise searchableText si fourni
                  onSelect={() => {
                    handleValueChange(option.value === value ? "" : option.value)
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}