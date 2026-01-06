'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTransaction(prevState: any, formData: FormData) {
  const supabase = await createClient()

  // 1. Extract Data
  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string
  const categoryId = formData.get('categoryId')
  const walletId = formData.get('walletId') as string
  const date = formData.get('date') as string
  const type = formData.get('type') as string // 'expense' or 'income'

  // Basic Validation
  if (!amount || !description || !walletId || !categoryId) {
    return { message: 'Please fill in all required fields.', error: true }
  }

  // 2. Get User & Household (Secure way)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized', error: true }

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) return { message: 'No household found.', error: true }

  // 3. Insert Expense
  const { error: matchError } = await supabase
    .from('expenses')
    .insert({
      household_id: profile.household_id,
      amount,
      description,
      category_id: parseInt(categoryId as string), // specific for our new schema INT id
      paid_by_wallet_id: walletId,
      created_by: user.id,
      date: date || new Date().toISOString(),
      payment_mode: 'wallet' // Defaulting for now
    })

  if (matchError) {
    console.error('Insert Error:', matchError)
    return { message: 'Failed to save transaction.', error: true }
  }

  // 4. Update Wallet Balance (Atomic RPC would be better, but doing client-side logic server-side for now)
  // Fetch current balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('id', walletId)
    .single()
  
  if (wallet) {
    const newBalance = wallet.balance - amount // expenses subtract
    // TODO: Handle 'income' type later to add
    await supabase.from('wallets').update({ balance: newBalance }).eq('id', walletId)
  }

  revalidatePath('/')
  return { message: 'Transaction added successfully!', error: false }
}
