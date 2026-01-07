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
import { Pencil } from "lucide-react"
import { updateBudget } from "@/app/actions/budget"

const initialState = {
  message: '',
}

export default function EditBudgetDialog({ budget }: { budget: any }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(updateBudget, initialState)

  useEffect(() => {
    if (state?.message === 'success') {
      setOpen(false)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget ({budget.categories?.name})</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={budget.id} />
          
          <div className="grid gap-2">
            <Label htmlFor="limit">Monthly Limit (AED)</Label>
            <Input id="limit" name="amount" type="number" step="0.01" defaultValue={budget.monthly_limit} required />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
