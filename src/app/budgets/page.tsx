import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AddBudgetDialog from "@/components/forms/AddBudgetDialog";
import DeleteButton from "@/components/DeleteButton";

export default async function BudgetPlanner() {
  const supabase = await createClient()

  // Fetch budgets with category names
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(name)')
    .order('created_at');
    
  // For 'Spent' calculation, we would ideally aggregation expenses for this month/category
  // For MVP, we will fetch 'spent' dynamically properly.
  // OPTIMIZATION: We can do a second query to get sums by category for this month.
  
  // 1. Get first/last date of current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  // 2. Fetch expenses aggregated
  // Since we can't easily do complex group-by joined with the previous query in one go in simple client logic,
  // we'll fetch all expenses for this month and map them in JS for simplicity (MVP).
  // In a huge app, use an RPC or View.
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category_id')
    .gte('date', firstDay)
    .lte('date', lastDay);

  const spendingMap = new Map<number, number>();
  expenses?.forEach(e => {
      if(e.category_id) {
          const current = spendingMap.get(e.category_id) || 0;
          spendingMap.set(e.category_id, current + Number(e.amount));
      }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold">Budget Planner</h1>
         <AddBudgetDialog />
      </div>

      <div className="grid gap-4">
        {(!budgets || budgets.length === 0) && (
            <p className="text-muted-foreground">No budgets set. Click 'Add Budget' to start.</p>
        )}

        {budgets?.map((b) => {
           const categoryName = b.categories?.name || 'Unknown';
           const spent = spendingMap.get(b.category_id) || 0;
           const limit = Number(b.monthly_limit);
           const percent = Math.min((spent / limit) * 100, 100);
           
           return (
            <Card key={b.id} className="relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <DeleteButton table="budgets" id={b.id} path="/budgets" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{categoryName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between text-sm mb-2">
                        <span className={spent > limit ? "text-red-500 font-bold" : ""}>
                            Spent: AED {spent.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">Limit: AED {limit.toLocaleString()}</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                </CardContent>
            </Card>
           );
        })}
      </div>
    </div>
  );
}
