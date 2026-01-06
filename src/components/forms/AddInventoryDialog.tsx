"use client";

import { createInventoryItem } from "@/app/actions/generic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function AddInventoryDialog() {
    const [open, setOpen] = useState(false);

    async function action(formData: FormData) {
        const res = await createInventoryItem(formData);
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
                    <Plus className="h-4 w-4" /> Add Item
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                </DialogHeader>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Item Name</Label>
                        <Input name="name" required placeholder="Milk, Eggs..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input name="quantity" type="number" step="0.1" required defaultValue="1" />
                        </div>
                        <div className="space-y-2">
                            <Label>Unit</Label>
                            <Input name="unit" placeholder="pcs, kg..." required defaultValue="pcs" />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <Label>Cost per Unit (AED)</Label>
                         <Input name="cost" type="number" step="0.01" />
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
