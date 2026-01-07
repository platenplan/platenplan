import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AddBudgetDialog from "@/components/forms/AddBudgetDialog";
import DeleteButton from "@/components/DeleteButton";
import EditBudgetDialog from "@/components/forms/EditBudgetDialog";
import SearchFilterBar from "@/components/SearchFilterBar";

export default async function BudgetPlanner({
    searchParams,
  }: {
    searchParams?: {
      q?: string
      page?: string
    }
  }) {
  const supabase = await createClient()

  // Fetch budgets with category names
  let query = supabase.from('budgets').select('*, categories(name)').order('created_at');
  
  if (searchParams?.q) {
      // NOTE: Filtering by related table field (categories.name) in Supabase is tricky with simple query builder
      // Typically needs !inner or textSearch.
      // For MVP, we will fetch all and filter in JS if needed, OR relies on client filter if list small.
      // But let's try to assume category name search is requested.
      // query = query.ilike('categories.name', ... ) -> DOES NOT WORK easily.
      // We will skip deep search for MVP to avoid 500s. We'll search by ID if we had it, or just show all.
  }

  const { data: budgets } = await query;

  // Manual Filter for MVP (Safe)
  let filteredBudgets = budgets || [];
  if (searchParams?.q) {
      const q = searchParams.q.toLowerCase();
      filteredBudgets = filteredBudgets.filter(b => b.categories?.name?.toLowerCase().includes(q));
  }

  // 1. Get first/last date of current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  // 2. Fetch expenses aggregated
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Planner</h1>
            <p className="text-muted-foreground">Track your monthly category limits.</p>
         </div>
         <AddBudgetDialog />
      </div>

      <SearchFilterBar />

      <div className="grid gap-4">
        {filteredBudgets.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">No budgets found.</p>
            </div>
        )}

        {filteredBudgets.map((b) => {
           const categoryName = b.categories?.name || 'Unknown';
           const spent = spendingMap.get(b.category_id) || 0;
           const limit = Number(b.monthly_limit);
           const percent = Math.min((spent / limit) * 100, 100);
           
           return (
            <Card key={b.id} className="relative group hover:shadow-md transition-shadow">
                <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-md backdrop-blur-sm border shadow-sm z-10 p-1">
                     <EditBudgetDialog budget={b} />
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
