"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to ensure context
async function getContext(supabase: any, user: any) {
    let { data: profile } = await supabase.from('profiles').select('id, household_id').eq('id', user.id).single();
    
    if (!profile) {
        // Create household first
        const { data: hh } = await supabase.from('households').insert({ name: 'My Household', created_by: user.id }).select().single();
        if (hh) {
            // Create profile
            const { data: newProfile } = await supabase.from('profiles').insert({ id: user.id, household_id: hh.id, role: 'member' }).select().single();
            profile = newProfile;
        }
    } else if (!profile.household_id) {
        // Create household if missing
        const { data: hh } = await supabase.from('households').insert({ name: 'My Household', created_by: user.id }).select().single();
        if (hh) {
            await supabase.from('profiles').update({ household_id: hh.id }).eq('id', user.id);
            profile.household_id = hh.id;
        }
    }

    return profile;
}

// Generic Delete
export async function deleteItem(table: string, id: string, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    return { success: false, message: error.message };
  }
  revalidatePath(path);
  return { success: true };
}

// Create Inventory Item
export async function createInventoryItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: true, message: "Unauthorized" };

  const profile = await getContext(supabase, user);
  if (!profile?.household_id) return { error: true, message: "Could not establish household context." };

  const name = formData.get('name') as string;
  const quantity = Number(formData.get('quantity'));
  const unit = formData.get('unit') as string;
  const cost = Number(formData.get('cost') || 0);

  const { error } = await supabase.from('inventory').insert({
    household_id: profile.household_id,
    item_name: name, // Note: Schema calls it item_name
    quantity,
    unit,
    cost_per_unit: cost,
    category: 'General'
  });

  if (error) return { error: true, message: error.message };
  revalidatePath('/inventory');
  return { success: true };
}

// Create Wallet
export async function createWallet(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: true, message: "Unauthorized" };

  const profile = await getContext(supabase, user);
  if (!profile?.household_id) return { error: true, message: "Could not establish household context." };

  const name = formData.get('name') as string;
  const type = formData.get('type') as string; // 'personal' or 'shared'
  const balance = Number(formData.get('balance') || 0);

  const { error } = await supabase.from('wallets').insert({
    household_id: profile.household_id,
    name,
    type,
    balance,
    owner_user_id: type === 'personal' ? user.id : null
  });

  if (error) return { error: true, message: error.message };
  revalidatePath('/wallets');
  return { success: true };
}

// Create Recurring Expense
export async function createRecurringExpense(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: true, message: "Unauthorized" };
  
    const profile = await getContext(supabase, user);
    if (!profile?.household_id) return { error: true, message: "Could not establish household context." };
  
    const name = formData.get('name') as string;
    const amount = Number(formData.get('amount'));
    const due_day = Number(formData.get('due_day'));
    const auto_post = formData.get('auto_post') === 'on';
  
    const { error } = await supabase.from('recurring_expenses').insert({
      household_id: profile.household_id,
      name,
      amount,
      due_day,
      auto_post
    });
  
    if (error) return { error: true, message: error.message };
    revalidatePath('/recurring');
    return { success: true };
}
