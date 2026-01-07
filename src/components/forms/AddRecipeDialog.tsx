"use client"

import { useState, useEffect } from "react"
import { useFormState } from "react-dom" 
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash, Utensils, Search, Loader2 } from "lucide-react"
import { createRecipe } from "@/app/actions/recipe"
import { searchExternalRecipes } from "@/app/actions/external_recipe"
import { createBrowserClient } from "@supabase/ssr"
import { ScrollArea } from "@/components/ui/scroll-area"

const initialState = {
  message: '',
}

export default function AddRecipeDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(createRecipe, initialState)
  
  // Search State
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Ingredients State
  const [name, setName] = useState('')
  const [ingredients, setIngredients] = useState<{name: string, qty: number, unit: string}[]>([
      { name: '', qty: 1, unit: 'pcs' }
  ])

  // Inventory for autocomplete
  const [pantry, setPantry] = useState<any[]>([])

  useEffect(() => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    async function loadPantry() {
        const { data } = await supabase.from('inventory').select('name, unit')
        if(data) setPantry(data)
    }
    if(open) loadPantry()
  }, [open])

  useEffect(() => {
    if (state?.message === 'success') {
      setOpen(false)
      resetForm()
    }
  }, [state])

  const resetForm = () => {
      setName('')
      setIngredients([{ name: '', qty: 1, unit: 'pcs' }])
      setSearchResults([])
      setSearchQuery('')
      setShowSearch(false)
  }

  const handleSearch = async () => {
      if(!searchQuery) return
      setIsSearching(true)
      const res = await searchExternalRecipes(searchQuery)
      if(res.success) {
          setSearchResults(res.results)
      }
      setIsSearching(false)
  }

  const selectRecipe = (recipe: any) => {
      setName(recipe.name)
      // Map API ingredients to our format
      // Note: API returns "1 cup", "1/2 tsp" etc in 'unit'. We put '1' in qty (mock) and full string in unit for now.
      // Or we can try to parse "1/2" -> 0.5. For MVP we keep qty 1.
      setIngredients(recipe.ingredients)
      setShowSearch(false)
  }

  const addIngredient = () => {
      setIngredients([...ingredients, { name: '', qty: 1, unit: 'pcs' }])
  }

  const removeIngredient = (index: number) => {
      const newIng = [...ingredients]
      newIng.splice(index, 1)
      setIngredients(newIng)
  }

  const updateIngredient = (index: number, field: keyof typeof ingredients[0], value: any) => {
      const newIng = [...ingredients]
      // @ts-ignore
      newIng[index][field] = value
      setIngredients(newIng)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Utensils className="h-4 w-4" />
          Add Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Meal</DialogTitle>
        </DialogHeader>

        {showSearch ? (
            <div className="flex flex-col gap-4 py-4 h-full">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Search online recipes (e.g. Pasta)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
                <ScrollArea className="flex-1 h-[300px]">
                    <div className="space-y-2">
                        {searchResults.map((r: any) => (
                            <div key={r.id} className="flex gap-4 p-2 border rounded-lg cursor-pointer hover:bg-muted" onClick={() => selectRecipe(r)}>
                                {r.image && <img src={r.image} alt={r.name} className="h-16 w-16 object-cover rounded-md bg-muted" />}
                                <div>
                                    <h4 className="font-semibold text-sm">{r.name}</h4>
                                    <p className="text-xs text-muted-foreground">{r.category} • {r.ingredients.length} ingredients</p>
                                </div>
                            </div>
                        ))}
                        {searchResults.length === 0 && !isSearching && searchQuery && (
                            <p className="text-center text-sm text-muted-foreground p-4">No results found.</p>
                        )}
                    </div>
                </ScrollArea>
                <Button variant="ghost" onClick={() => setShowSearch(false)}>Back to Manual Entry</Button>
            </div>
        ) : (
            <form action={formAction} className="grid gap-4 py-4 overflow-y-auto">
              <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowSearch(true)} className="gap-2 text-xs">
                      <Search className="h-3 w-3" /> Auto-fill from Web
                  </Button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Recipe Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Spouse's Pasta" value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Ingredients</Label>
                {ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2 items-end">
                        <div className="grid gap-1 flex-1">
                            <Input 
                                placeholder="Item Name" 
                                value={ing.name} 
                                onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                                list="pantry-options"
                                required
                            />
                        </div>
                        <div className="grid gap-1 w-16">
                             <Input 
                                type="number" 
                                value={ing.qty} 
                                onChange={(e) => updateIngredient(i, 'qty', parseFloat(e.target.value))}
                                required
                                step="0.1"
                            />
                        </div>
                        <div className="grid gap-1 w-20">
                             <Input 
                                placeholder="Unit" 
                                value={ing.unit} 
                                onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                                required
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(i)}>
                            <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Ingredient
                </Button>
              </div>

              {/* Hidden input to pass ingredients as JSON */}
              <input type="hidden" name="ingredients" value={JSON.stringify(ingredients.filter(i => i.name))} />

              <datalist id="pantry-options">
                  {pantry.map((p, i) => <option key={i} value={p.name}>{p.unit}</option>)}
              </datalist>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save Recipe</Button>
              </div>
            </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
