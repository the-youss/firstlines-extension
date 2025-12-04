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

type Status = {
  value: string
  label: string
}



type Option = {
  value: string;
  label: string
}
interface ComboBoxProps {
  options: Array<Option>;
  shadowRoot?: ShadowRoot | HTMLElement;
  children: ({ selectedOption }: { selectedOption?: Option }) => React.ReactNode
}
export function ComboBox({ children, options, shadowRoot }: ComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Option>()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children({ selectedOption: selected })}
      </PopoverTrigger>
      <PopoverContent container={shadowRoot} className="p-0" side="right" align="start" >
        <Command>
          <CommandInput placeholder="Change status..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={(value) => {
                    setSelected(
                      options.find((priority) => priority.value === value)
                    )
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
