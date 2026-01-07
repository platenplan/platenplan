'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateInventory(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const item_name = formData.get('item_name') as string
  const quantity = formData.get('quantity') as string
  const unit = formData.get('unit') as string
  const expiry_date = formData.get('expiry_date') as string

  const { error } = await supabase
    .from('inventory')
    .update({
        item_name,
        quantity: parseFloat(quantity),
        unit,
        expiry_date: expiry_date || null
    })
    .eq('id', id)

  if (error) {
    console.error('Update Inventory Error:', error)
    return { message: 'Failed to update item' }
  }

  revalidatePath('/inventory')
  return { message: 'success' }
}

export async function createInventory(prevState: any, formData: FormData) {
    // Re-implementing here to keep actions centralized if needed, 
    // or we can keep mixing with generic. For now, focusing on Update.
    // Assuming create is handled by AddInventoryDialog action or similar.
    return { message: 'Not implemented in this file' }
}
