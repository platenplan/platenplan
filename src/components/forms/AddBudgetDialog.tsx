"use client"

import { useState, useEffect } from "react"
import { useFormState } from "react-dom" 
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createBudget } from "@/app/actions/budget"
import { createBrowserClient } from "@supabase/ssr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialState = {
  message: '',
}

export default function AddBudgetDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(createBudget, initialState)
  const [categories, setCategories] = useState<any[]>([])

  // Client-side fetch for categories to populate dropdown
  useEffect(() => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    async function loadCats() {
        const { data } = await supabase.from('categories').select('*')
        if(data) setCategories(data)
    }
    if(open) loadCats()
  }, [open])

  useEffect(() => {
    if (state?.message === 'success') {
      setOpen(false)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select name="categoryId" required>
                <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="limit">Monthly Limit (AED)</Label>
            <Input id="limit" name="amount" type="number" step="0.01" required placeholder="e.g. 1500" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit">Save Budget</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
