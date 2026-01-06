'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBudget(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const categoryId = formData.get('categoryId') as string
  const amount = formData.get('amount') as string

  // Get current user household
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) {
    return { message: 'Household not found' }
  }

  const { error } = await supabase.from('budgets').insert({
    household_id: profile.household_id,
    category_id: parseInt(categoryId),
    monthly_limit: parseFloat(amount)
  })

  if (error) {
    console.error('Create Budget Error:', error)
    return { message: 'Failed to create budget' }
  }

  revalidatePath('/budgets')
  return { message: 'success' }
}

export async function deleteBudget(id: string) {
    const supabase = await createClient()
    await supabase.from('budgets').delete().eq('id', id)
    revalidatePath('/budgets')
}
