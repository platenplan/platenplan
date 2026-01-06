import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RedirectType, redirect } from 'next/navigation';
import { Baby, GraduationCap, Utensils, HeartPulse } from "lucide-react";

export default async function KidsDashboard() {
  const supabase = await createClient()

  // 1. Auth & Profiles
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login');

  // 2. Fetch Aggregated Data
  const { data: insights, error } = await supabase
    .from('kids_cost_insights')
    .select('*')
    // In real app, filter by current month/year or household
    // .eq('household_id', userHouseholdId) 
    
  // 3. Fetch Child Names
  const { data: children } = await supabase
    .from('profiles')
    .select('id, full_name')
    // Ideally filter by role='child' or household, assuming all profiles in household are relevant for now
    
  if (error) {
     console.error(error);
     return <div className="p-6">Error loading analytics.</div>
  }

  // Group by Child ID (simple map for display)
  const childMap = new Map();
  children?.forEach(c => childMap.set(c.id, c.full_name));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
           <Baby className="h-8 w-8 text-primary" />
           Kids Cost Insights
      </h1>

      {insights && insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((stat, idx) => {
                const name = childMap.get(stat.child_id) || 'Unknown Child';
                return (
                    <Card key={`${stat.child_id}-${idx}`} className="shadow-lg">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-xl text-primary">{name}</CardTitle>
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                {new Date(stat.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric'})}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-end border-b pb-2">
                                <span className="text-sm font-medium text-muted-foreground">Total Cost</span>
                                <span className="text-2xl font-bold">AED {stat.total.toLocaleString()}</span>
                            </div>
                            
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-blue-500" /> Education
                                    </span>
                                    <span className="font-semibold">{stat.education > 0 ? `AED ${stat.education}` : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <Utensils className="h-4 w-4 text-orange-500" /> Food
                                    </span>
                                    <span className="font-semibold">{stat.eating_out > 0 ? `AED ${stat.eating_out}` : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <HeartPulse className="h-4 w-4 text-red-500" /> Health
                                    </span>
                                    <span className="font-semibold">{stat.health > 0 ? `AED ${stat.health}` : '-'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
          </div>
      ) : (
          <div className="text-muted-foreground text-center py-10 bg-muted/20 rounded-xl">
              No data recorded for kids yet. Add expenses tagged to them or check category names.
          </div>
      )}
    </div>
  );
}
