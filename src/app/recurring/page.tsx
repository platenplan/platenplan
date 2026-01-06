"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCcw } from "lucide-react";
import AddRecurringDialog from "@/components/forms/AddRecurringDialog";
import DeleteButton from "@/components/DeleteButton";

export default function RecurringPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data } = await supabase
      .from("recurring_expenses")
      .select("*")
      .order("due_day");
    setItems(data || []);
    setLoading(false);
  }

  async function toggleAutoPost(id: string, current: boolean) {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, auto_post: !current } : i));
    
    await supabase.from("recurring_expenses").update({ auto_post: !current }).eq("id", id);
  }

  async function runAutomation() {
      // Manually trigger the automation API
      setProcessing(true);
      try {
        const res = await fetch('/api/cron/process-recurring', { method: 'POST' });
        const result = await res.json();
        alert(`Processed: ${result.processedCount} items.`);
        fetchItems(); // Refresh last_posted_at
      } catch (err) {
          alert("Error processing expenses");
      }
      setProcessing(false);
  }

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h1 className="text-2xl font-bold">Recurring Expenses</h1>
         <div className="flex items-center gap-2">
            <AddRecurringDialog />
            <Button onClick={runAutomation} disabled={processing} variant="outline" size="sm">
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                Run Now
            </Button>
         </div>
      </div>

      <div className="grid gap-4">
        {items.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No recurring expenses set up.</p>
        )}

        {items.map(item => (
            <Card key={item.id} className={cn("transition-colors relative group", item.auto_post ? "border-primary/50" : "opacity-80")}>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <DeleteButton table="recurring_expenses" id={item.id} path="/recurring" />
                </div>
                <CardContent className="flex items-center justify-between p-4">
                    <div>
                        <div className="font-semibold text-lg">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                            Due: Day {item.due_day} • AED {item.amount}
                        </div>
                        {item.last_posted_at && (
                            <div className="text-xs text-muted-foreground mt-1">
                                Last Posted: {new Date(item.last_posted_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Auto-Post</span>
                        <Switch 
                            checked={item.auto_post} 
                            onCheckedChange={() => toggleAutoPost(item.id, item.auto_post)}
                        />
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
