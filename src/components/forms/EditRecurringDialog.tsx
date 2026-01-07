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
import { updateRecurring } from "@/app/actions/recurring"

const initialState = {
  message: '',
}

export default function EditRecurringDialog({ item, onUpdate }: { item: any, onUpdate?: () => void }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(updateRecurring, initialState)

  useEffect(() => {
    if (state?.message === 'success') {
      setOpen(false)
      if (onUpdate) onUpdate()
    }
  }, [state, onUpdate])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Recurring Expense</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={item.id} />
          
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={item.name} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (AED)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" defaultValue={item.amount} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="day">Due Day (1-31)</Label>
            <Input id="day" name="due_day" type="number" min="1" max="31" defaultValue={item.due_day} required />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
