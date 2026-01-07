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
import { Edit, Pencil } from "lucide-react"
import { updateInventory } from "@/app/actions/inventory"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialState = {
  message: '',
}

export default function EditInventoryDialog({ item }: { item: any }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(updateInventory, initialState)

  useEffect(() => {
    if (state?.message === 'success') {
      setOpen(false)
    }
  }, [state])

  // Simple units list
  const units = ['kg', 'g', 'litre', 'ml', 'piece', 'pack', 'box', 'other']

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={item.id} />
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input id="name" name="item_name" defaultValue={item.item_name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" name="quantity" type="number" step="0.01" defaultValue={item.quantity} required />
            </div>
            <div className="grid gap-2">
                <Label>Unit</Label>
                 <Select name="unit" defaultValue={item.unit} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {units.map(u => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expiry">Expiry Date (Optional)</Label>
            <Input id="expiry" name="expiry_date" type="date" defaultValue={item.expiry_date} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
