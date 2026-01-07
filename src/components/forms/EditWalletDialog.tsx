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
import { updateWallet } from "@/app/actions/wallet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialState = {
  message: '',
}

export default function EditWalletDialog({ wallet }: { wallet: any }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(updateWallet, initialState)

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
          <DialogTitle>Edit Wallet</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={wallet.id} />
          
          <div className="grid gap-2">
            <Label htmlFor="name">Wallet Name</Label>
            <Input id="name" name="name" defaultValue={wallet.name} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue={wallet.type} required>
                <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="balance">Current Balance (AED)</Label>
            <Input id="balance" name="balance" type="number" step="0.01" defaultValue={wallet.balance} required />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
