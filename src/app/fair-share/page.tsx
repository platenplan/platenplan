import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RedirectType, redirect } from 'next/navigation';

export default async function FairContribution() {
  const supabase = await createClient()

  // 1. Auth Check (optional if Middleware covers it)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login');

  // 2. Fetch from View
  const { data: shares, error } = await supabase
    .from('fair_contribution_view')
    .select('*')
  
  if (error) {
      console.error(error)
      return <div className="p-6">Error loading contribution data.</div>
  }

  // Find "You" (current user) and "Partner" (others)
  // This logic assumes 2 main people for simplicity in display, but data is generic.
  const you = shares?.find(s => s.user_id === user.id)
  const others = shares?.filter(s => s.user_id !== user.id) || []

  // If "You" are not in the profiles table yet (only auth), handle gracefully
  if (!you && others.length === 0) {
      return (
        <div className="p-6 text-center text-muted-foreground">
            No family data found. Please complete profile setup.
        </div>
      )
  }

  // Calculate generic Net for display
  // Note: View returns 'total_paid' and 'total_benefited'
  const youPaid = you?.total_paid || 0;
  const youBenefited = you?.total_benefited || 0;
  const youNet = youPaid - youBenefited;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Fair Contribution</h1>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* YOU */}
              <div className="p-3 bg-muted/50 rounded-md">
                  <p className="font-semibold mb-2">You</p>
                  <p className="text-sm">Paid: AED {youPaid.toLocaleString()}</p>
                  <p className="text-sm">Benefited: AED {youBenefited.toLocaleString()}</p>
                  <p className={youNet >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                      Net: {youNet >= 0 ? '+' : ''}{youNet.toLocaleString()}
                  </p>
              </div>

              {/* OTHERS (Simple list for now) */}
              {others.map((other) => {
                  const oPaid = other.total_paid || 0
                  const oBen = other.total_benefited || 0
                  const oNet = oPaid - oBen

                  return (
                    <div key={other.user_id} className="p-3 bg-muted/50 rounded-md">
                        <p className="font-semibold mb-2">{other.full_name || 'Member'}</p>
                        <p className="text-sm">Paid: AED {oPaid.toLocaleString()}</p>
                        <p className="text-sm">Benefited: AED {oBen.toLocaleString()}</p>
                        <p className={oNet >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                            Net: {oNet >= 0 ? '+' : ''}{oNet.toLocaleString()}
                        </p>
                    </div>
                  )
              })}
          </div>

          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
             <p className="text-lg font-medium">
                 {youNet >= 0 
                    ? "You paid more than your share. Others owe you." 
                    : "You benefited more than you paid. You owe the family pot."
                 }
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
