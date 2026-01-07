import { createClient } from '@/lib/supabase/server'
import AddExpenseFast from '@/components/transactions/AddExpenseFast'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function AddTransactionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()
  
  let householdId = profile?.household_id;

  if (!householdId) {
     // Self-healing: Create a household if it doesn't exist
     const { data: newHousehold, error: createError } = await supabase
        .from('households')
        .insert({ name: 'My Household' })
        .select()
        .single();
     
     if (newHousehold && !createError) {
         await supabase.from('profiles').update({ household_id: newHousehold.id }).eq('id', user.id);
         householdId = newHousehold.id;
     } else {
         return (
            <div className="p-4 text-center text-red-500">
                Error: Could not retrieve or create household. Please contact support.
                <br/>
                <span className="text-sm text-gray-400">{createError?.message}</span>
            </div>
         )
     }
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('household_id', householdId)
    .order('name')
  
  const { data: wallets } = await supabase
    .from('wallets')
    .select('id, name, balance')
    .eq('household_id', householdId)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('household_id', householdId)

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full">
         <AddExpenseFast 
            categories={categories || []} 
            wallets={wallets || []} 
            profiles={profiles || []}
         />
    </div>
  )
}
