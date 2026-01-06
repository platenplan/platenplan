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
  
  if (!profile?.household_id) {
     return <div>No household found. Please contact support.</div>
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('household_id', profile.household_id)
    .order('name')
  
  const { data: wallets } = await supabase
    .from('wallets')
    .select('id, name, balance')
    .eq('household_id', profile.household_id)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('household_id', profile.household_id)

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
