'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWallet(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const balance = formData.get('balance') as string

  const { error } = await supabase
    .from('wallets')
    .update({
        name,
        type,
        balance: parseFloat(balance)
    })
    .eq('id', id)

  if (error) {
    console.error('Update Wallet Error:', error)
    return { message: 'Failed to update wallet' }
  }

  revalidatePath('/wallets')
  return { message: 'success' }
}
