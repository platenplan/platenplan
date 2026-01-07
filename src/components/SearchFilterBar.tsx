"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Filter } from "lucide-react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { toast } from "sonner"

export default function SearchFilterBar({ 
    onExport, 
    filterOptions = [] 
}: { 
    onExport?: () => void,
    filterOptions?: { label: string, key: string, options: string[] }[]
}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleFilter = (key: string, value: string, checked: boolean) => {
      // Simple toggle logic for now, or unified param update
      // For MVP, we can just reload page with param?
      // Or keep local state. Let's do URL params for persistent filtering.
      const params = new URLSearchParams(searchParams)
      let current = params.get(key)?.split(',') || []
      
      if (checked) {
          if(!current.includes(value)) current.push(value)
      } else {
          current = current.filter(c => c !== value)
      }

      if (current.length > 0) {
          params.set(key, current.join(','))
      } else {
          params.delete(key)
      }
      replace(`${pathname}?${params.toString()}`)
  }

  const doExport = () => {
      if(onExport) onExport();
      else {
           // Default CSV export of current view
           toast("Exporting data...", { description: "Your download will start shortly." })
           // In a real app, this would hit an API.
           // For now, we simulate.
      }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between bg-muted/30 p-2 rounded-lg border">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          className="pl-8 bg-background"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('q')?.toString()}
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {filterOptions.length > 0 && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {filterOptions.map(group => (
                    <div key={group.key}>
                        <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {group.options.map(opt => {
                            const isActive = (searchParams.get(group.key)?.split(',') || []).includes(opt);
                            return (
                                <DropdownMenuCheckboxItem 
                                    key={opt}
                                    checked={isActive}
                                    onCheckedChange={(c) => handleFilter(group.key, opt, c)}
                                >
                                    {opt}
                                </DropdownMenuCheckboxItem>
                            )
                        })}
                    </div>
                ))}
            </DropdownMenuContent>
            </DropdownMenu>
        )}
        <Button size="sm" variant="outline" className="h-9 gap-1" onClick={doExport}>
          <Download className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Export
          </span>
        </Button>
      </div>
    </div>
  )
}
