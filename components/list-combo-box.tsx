"use client"

import * as React from "react"

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
import { Plus } from "lucide-react"
import { useStore } from "@/lib/use-store"

type Status = {
  value: string
  label: string
}



type Option = {
  value: string;
  label: string
}
interface ComboBoxProps {
  shadowRoot?: ShadowRoot | HTMLElement;
  children: React.ReactNode
  onSelect: (listId: string | 'new-list') => void

}
export function ListComboBox({ children, shadowRoot, onSelect }: ComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const { lists, refetchLists } = useStore();
  const options = lists.data.map(l => ({ label: l.name, value: l.id }))

  useEffect(() => {
    refetchLists()
  }, [refetchLists])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent container={shadowRoot} className="p-0" side="bottom" align="start" >
        <Command>
          <CommandInput placeholder="Change status..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Where do you want to save this lead?">
              <CommandItem onSelect={() => { onSelect('new-list'); setOpen(false) }}>
                <Plus />
                <span>New list</span>
              </CommandItem>
              {options.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={(value) => {
                    onSelect(value)
                    setOpen(false)
                  }}
                >
                  {status.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
