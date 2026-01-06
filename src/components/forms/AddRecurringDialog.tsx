"use client";

import { createRecurringExpense } from "@/app/actions/generic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function AddRecurringDialog() {
    const [open, setOpen] = useState(false);

    async function action(formData: FormData) {
        const res = await createRecurringExpense(formData);
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
                    <Plus className="h-4 w-4" /> Add Recurring
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Recurring Expense</DialogTitle>
                </DialogHeader>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Expense Name</Label>
                        <Input name="name" required placeholder="Rent, Netflix..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input name="amount" type="number" step="0.01" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Due Day (1-31)</Label>
                            <Input name="due_day" type="number" min="1" max="31" required />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Switch name="auto_post" id="auto_post" defaultChecked />
                        <Label htmlFor="auto_post">Auto-Post Monthly</Label>
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
