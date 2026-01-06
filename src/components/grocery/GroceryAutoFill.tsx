"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBasket } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner

interface GroceryAutoFillProps {
  isOpen: boolean;
  onClose: () => void;
  householdId: string;
}

export default function GroceryAutoFill({ isOpen, onClose, householdId }: GroceryAutoFillProps) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (isOpen && householdId) {
        fetchTemplates();
    }
  }, [isOpen, householdId]);

  async function fetchTemplates() {
    const { data } = await supabase
        .from('grocery_items_templates')
        .select('*')
        .eq('household_id', householdId);
    
    // Fallback Mock template if none exist (for demo purposes)
    if (!data || data.length === 0) {
        setTemplates([{
            id: 'mock-1',
            label: 'Standard Weekly Shop',
            items: [
                { name: 'Milk', qty: 2, unit: 'L' },
                { name: 'Bread', qty: 1, unit: 'loaf' },
                { name: 'Eggs', qty: 12, unit: 'pcs' },
                { name: 'Rice', qty: 5, unit: 'kg' }
            ]
        }]);
    } else {
        setTemplates(data);
    }
  }

  async function applyTemplate(template: any) {
    setLoading(true);

    // In a real scenario, we would map template items to inventory IDs.
    // Here we'll do a simple "Upsert by Name" logic for MVP.
    // Iterating one by one is slow but simpler for logic demonstration.
    
    for (const item of template.items) {
        // 1. Check if item exists
        const { data: existing } = await supabase
            .from('inventory')
            .select('id, quantity')
            .eq('household_id', householdId)
            .ilike('name', item.name)
            .single();

        if (existing) {
            // Update
            await supabase
                .from('inventory')
                .update({ quantity: existing.quantity + item.qty })
                .eq('id', existing.id);
        } else {
            // Insert
            await supabase
                .from('inventory')
                .insert({
                    household_id: householdId,
                    name: item.name,
                    quantity: item.qty,
                    unit: item.unit,
                    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default 1 week expiry
                });
        }
    }

    setLoading(false);
    onClose();
    // toast.success("Inventory updated!");
    alert("Inventory updated!");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Smart Restock</DialogTitle>
          <DialogDescription>
            You just bought groceries. Want to auto-fill your inventory?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
            {templates.map(t => (
                <Button 
                    key={t.id} 
                    variant="outline" 
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => applyTemplate(t)}
                    disabled={loading}
                >
                    <ShoppingBasket className="mr-3 h-5 w-5 text-primary" />
                    <div className="text-left">
                        <div className="font-semibold">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.items?.length || 0} items</div>
                    </div>
                </Button>
            ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Skip</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
