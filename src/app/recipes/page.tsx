import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat } from "lucide-react";
import { redirect } from 'next/navigation';
import CookButton from "@/components/recipes/CookButton";
import AddRecipeDialog from "@/components/forms/AddRecipeDialog";
import DeleteButton from "@/components/DeleteButton";
import EditRecipeDialog from "@/components/forms/EditRecipeDialog";
import SearchFilterBar from "@/components/SearchFilterBar";

export default async function RecipesPage({
    searchParams,
  }: {
    searchParams?: {
      q?: string
    }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Fetch Recipes
  let query = supabase.from('recipes').select('*').order('created_at', { ascending: false });
  
  if (searchParams?.q) {
      query = query.ilike('name', `%${searchParams.q}%`);
  }

  const { data: recipes } = await query;
  
  // 2. Fetch Inventory for pricing
  const { data: inventory } = await supabase.from('inventory').select('id, name, quantity, unit, cost_per_unit');

  // Helper to calculate cost
  function calculateCost(ingredients: any[]) {
      if (!ingredients || !inventory) return 0;
      let total = 0;
      ingredients.forEach(ing => {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <ChefHat className="h-8 w-8 text-primary" />
                Meal Optimizer
            </h1>
            <p className="text-muted-foreground">Find recipes you can cook with what you have.</p>
        </div>
        <AddRecipeDialog />
      </div>

      <SearchFilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes && recipes.length > 0 ? (
            recipes.map(recipe => {
                const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
                const cost = calculateCost(ingredients);
                const canCook = checkStock(ingredients);

                return (
                    <Card key={recipe.id} className="flex flex-col relative group hover:shadow-md transition-shadow">
                        <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/90 rounded-md backdrop-blur-sm border shadow-sm p-1">
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
