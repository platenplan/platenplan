import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, DollarSign, ListChecks } from "lucide-react";
import { redirect } from 'next/navigation';
import CookButton from "@/components/recipes/CookButton";
import AddRecipeDialog from "@/components/forms/AddRecipeDialog";
import DeleteButton from "@/components/DeleteButton";

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Fetch Recipes
  // Note: Schema for 'recipes' wasn't strictly defined earlier as having 'ingredients' JSON.
  // We'll assume a structure based on the prompt or fetch raw and mock if empty.
  const { data: recipes } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
  
  // 2. Fetch Inventory for pricing
  const { data: inventory } = await supabase.from('inventory').select('id, name, quantity, unit, cost_per_unit');

  // Helper to calculate cost
  function calculateCost(ingredients: any[]) {
      if (!ingredients || !inventory) return 0;
      let total = 0;
      ingredients.forEach(ing => {
          // Weak matching by Name for now as JSON usually stores ID but prompt imply logic
          // Assuming ingredient has inventory_item_id or name
           const item = inventory.find(i => i.id === ing.inventory_item_id || i.name === ing.name);
           if (item && item.cost_per_unit) {
               total += (Number(ing.qty) * Number(item.cost_per_unit));
           }
      });
      return total;
  }

  // Helper to check stock
  function checkStock(ingredients: any[]) {
     if (!ingredients || !inventory) return false;
     return ingredients.every(ing => {
         const item = inventory.find(i => i.id === ing.inventory_item_id || i.name === ing.name);
         return item && item.quantity >= ing.qty;
     });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            Meal Optimizer
        </h1>
        <AddRecipeDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes && recipes.length > 0 ? (
            recipes.map(recipe => {
                // Ensure ingredients is an array
                const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
                const cost = calculateCost(ingredients);
                const canCook = checkStock(ingredients);

                return (
                    <Card key={recipe.id} className="flex flex-col relative group">
                        <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 rounded-md backdrop-blur-sm border shadow-sm">
                             <EditRecipeDialog recipe={recipe} />
                             <DeleteButton table="recipes" id={recipe.id} path="/recipes" />
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{recipe.name}</CardTitle>
                                {cost > 0 && (
                                    <Badge variant="secondary" className="font-bold">
                                        AED {cost.toFixed(2)}
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>{ingredients.length} ingredients</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {/* Ingredient List Preview */}
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {ingredients.slice(0, 3).map((ing: any, i: number) => (
                                    <li key={i}>• {ing.qty} {ing.unit} {ing.name}</li>
                                ))}
                                {ingredients.length > 3 && <li>...</li>}
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-4 border-t gap-2">
                            <CookButton 
                                recipeId={recipe.id} 
                                ingredients={ingredients} 
                                canCook={canCook} 
                            />
                        </CardFooter>
                    </Card>
                );
            })
        ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground bg-muted/20 rounded-xl">
                No recipes found. Add some to start optimizing costs!
            </div>
        )}
      </div>
    </div>
  );
}
