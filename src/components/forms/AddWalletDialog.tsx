"use client";

import { createWallet } from "@/app/actions/generic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function AddWalletDialog() {
    const [open, setOpen] = useState(false);

    async function action(formData: FormData) {
        const res = await createWallet(formData);
        if (res?.success) {
            setOpen(false);
        } else {
            alert(res?.message || "Error");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Wallet
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Wallet</DialogTitle>
                </DialogHeader>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Wallet Name</Label>
                        <Input name="name" required placeholder="My Bank, Cash..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select name="type" defaultValue="personal">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="personal">Personal</SelectItem>
                                <SelectItem value="shared">Shared</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Initial Balance</Label>
                        <Input name="balance" type="number" step="0.01" defaultValue="0" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
