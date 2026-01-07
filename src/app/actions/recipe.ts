"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function cookMeal(recipeId: string, ingredients: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: true, message: "Unauthorized" };

  // Note: In a real app we'd fetch the recipe again to be sure of ingredients, 
  // but for efficiency passing them in (if signed/trusted) or re-fetching is fine.
  // We'll re-fetch inventory to check current stock levels to be safe.
  
  // 1. Get Current Inventory
  const { data: inventory } = await supabase
    .from('inventory')
    .select('id, quantity, name')
    .eq('household_id', (await supabase.from('profiles').select('household_id').eq('id', user.id).single()).data?.household_id);
    
  if (!inventory) return { error: true, message: "Inventory load failed" };

  // 2. Validate & Prepare Updates
  const updates = [];
  for (const ing of ingredients) {
      // Create a map or find
      // Assuming ingredient has 'inventory_item_id' or we match by name
      const stockItem = inventory.find(i => i.id === ing.inventory_item_id || i.name === ing.name);
      
      if (!stockItem) {
          return { error: true, message: `Missing item in pantry: ${ing.name}` };
      }
      
      if (stockItem.quantity < ing.qty) {
          return { error: true, message: `Not enough ${stockItem.name}. Need ${ing.qty}, have ${stockItem.quantity}` };
      }
      
      updates.push({
          id: stockItem.id,
          newQty: stockItem.quantity - ing.qty
      });
  }

  // 3. Execute Updates (Sequential for now, could be transaction via RPC)
  for (const update of updates) {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: update.newQty })
        .eq('id', update.id);
      
      if (error) return { error: true, message: `Failed to update ${update.id}` };
  }

  revalidatePath('/recipes');
  revalidatePath('/inventory');
  return { success: true, message: "Bon appétit! Inventory updated." };
}

export async function createRecipe(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const ingredientsStr = formData.get('ingredients') as string
  const ingredients = JSON.parse(ingredientsStr)

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

  const { error } = await supabase.from('recipes').insert({
    household_id: profile.household_id,
    name,
    ingredients
  })

  if (error) {
    console.error('Create Recipe Error:', error)
    return { message: 'Failed to create recipe' }
  }

  revalidatePath('/recipes')
  return { message: 'success' }
}

export async function deleteRecipe(id: string) {
    const supabase = await createClient()
    await supabase.from('recipes').delete().eq('id', id)
    revalidatePath('/recipes')
}

export async function updateRecipe(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const ingredientsStr = formData.get('ingredients') as string
  const ingredients = JSON.parse(ingredientsStr)

  const { error } = await supabase
    .from('recipes')
    .update({
        name,
        ingredients
    })
    .eq('id', id)

  if (error) {
    console.error('Update Recipe Error:', error)
    return { message: 'Failed to update recipe' }
  }

  revalidatePath('/recipes')
  return { message: 'success' }
}
