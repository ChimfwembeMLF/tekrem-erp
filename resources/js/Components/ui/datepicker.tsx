import * as React from "react"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { format } from "date-fns"

export interface DatePickerProps {
  label?: string
  value?: string | Date
  onChange?: (date: string) => void
  error?: string
  required?: boolean
}

export function DatePicker({ label, value, onChange, error, required }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  React.useEffect(() => {
    if (value && typeof value === "string") {
      setSelected(new Date(value))
    }
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    setSelected(date)
    setOpen(false)
    if (onChange && date) {
      onChange(date.toISOString().slice(0, 10))
    }
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`w-full px-3 py-2 border rounded-md text-left bg-white dark:bg-gray-900 ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
            }`}
            onClick={() => setOpen(!open)}
          >
            {selected ? format(selected, "yyyy-MM-dd") : <span className="text-gray-400">Pick a date</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
