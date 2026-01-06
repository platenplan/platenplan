'use client'

import { useActionState } from 'react' // React 19 hook
import { createTransaction } from '@/app/add/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const initialState = {
  message: '',
  error: false
}

interface TransactionFormProps {
  categories: any[]
  wallets: any[]
}

export function TransactionForm({ categories, wallets }: TransactionFormProps) {
  const [state, formAction, isPending] = useActionState(createTransaction, initialState)
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Reset form helper - simplistic approach, controlled inputs would be better for full reset
  // For now relying on server redirection or message
  
  return (
    <form action={formAction}>
      <CardContent className="space-y-4 pt-4">
        {state.message && (
            <div className={cn("p-3 rounded-md text-sm", state.error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800")}>
                {state.message}
            </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="amount">Amount (AED)</Label>
          <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="e.g. Weekly Groceries" required />
        </div>

        <div className="grid gap-2">
          <Label>Category</Label>
          <Select name="categoryId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Paid By</Label>
           <Select name="walletId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select Wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name} (AED {wallet.balance})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
            <Label>Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <input type="hidden" name="date" value={date ? date.toISOString() : ''} />
        </div>

      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Saving...' : 'Add Transaction'}
        </Button>
      </CardFooter>
    </form>
  )
}
