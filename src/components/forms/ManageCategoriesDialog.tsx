"use client";

import { createCategory, deleteCategory } from "@/app/actions/categories";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ManageCategoriesDialog() {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        if (open) fetchCategories();
    }, [open]);

    async function fetchCategories() {
        setLoading(true);
        const { data } = await supabase.from('categories').select('*').order('name');
        setCategories(data || []);
        setLoading(false);
    }

    async function handleAdd(formData: FormData) {
        await createCategory(formData);
        fetchCategories(); // Refresh list
    }

    async function handleDelete(id: string) {
        if(!confirm("Delete category?")) return;
        startTransition(async () => {
             await deleteCategory(id);
             fetchCategories();
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Manage</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                </DialogHeader>
                
                {/* Add Form */}
                <form action={handleAdd} className="flex gap-2 items-end mb-4 border-b pb-4">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="cat-name">New Category</Label>
                        <Input id="cat-name" name="name" placeholder="e.g. Pets" required />
                    </div>
                    <Button type="submit" size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>

                {/* List */}
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {loading ? (
                        <div className="text-center py-4"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></div>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.id} className="flex justify-between items-center p-2 bg-muted rounded-md pointer-events-none0">
                                <span className="font-medium">{cat.name}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(cat.id)}
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                    {!loading && categories.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm">No categories found.</p>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    )
}
