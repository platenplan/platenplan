"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: true, message: "Unauthorized" };

  const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', user.id).single();
  if (!profile) return { error: true, message: "No profile found" };

  const name = formData.get('name') as string;

  const { error } = await supabase.from('categories').insert({
    household_id: profile.household_id,
    name
  });

  if (error) return { error: true, message: error.message };
  revalidatePath('/settings');
  revalidatePath('/add'); // Affects dropdowns
  return { success: true };
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { success: false, message: error.message };
    
    revalidatePath('/settings');
    revalidatePath('/add');
    return { success: true };
}
