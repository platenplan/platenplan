'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateRecurring(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const amount = formData.get('amount') as string
  const due_day = formData.get('due_day') as string

  const { error } = await supabase
    .from('recurring_expenses')
    .update({
        name,
        amount: parseFloat(amount),
        due_day: parseInt(due_day)
    })
    .eq('id', id)

  if (error) {
    console.error('Update Recurring Error:', error)
    return { message: 'Failed to update expense' }
  }

  revalidatePath('/recurring')
  return { message: 'success' }
}
