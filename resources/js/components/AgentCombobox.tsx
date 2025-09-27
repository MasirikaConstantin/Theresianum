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

interface Agent {
  id: number
  nom: string
  postnom: string
  prenom: string
  matricule?: string // Optionnel pour l'affichage
}

interface AgentComboboxProps {
  agents: Agent[]
  value: string
  onChange: (value: string) => void
}

export function AgentCombobox({ agents, value, onChange }: AgentComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Options avec recherche filtrée
  const filteredAgents = agents.filter(agent => {
    const fullName = `${agent.nom} ${agent.postnom} ${agent.prenom}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  const options = filteredAgents.map(agent => ({
    value: agent.id.toString(),
    label: `${agent.nom} ${agent.postnom} ${agent.prenom}`,
    fullText: `${agent.matricule ? agent.matricule + ' - ' : ''}${agent.nom} ${agent.postnom} ${agent.prenom}`.toLowerCase()
  }))

  const selectedAgent = agents.find(agent => agent.id.toString() === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedAgent 
            ? `${selectedAgent.nom} ${selectedAgent.postnom} ${selectedAgent.prenom}`
            : "Rechercher un agent..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Rechercher par nom..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>Aucun agent trouvé</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.fullText} // Utilisé pour la recherche
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value)
                    setOpen(false)
                    setSearchTerm("")
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
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