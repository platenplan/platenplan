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
import { Pencil, Trash, Plus } from "lucide-react"
import { updateRecipe } from "@/app/actions/recipe"
import { createBrowserClient } from "@supabase/ssr"

const initialState = {
  message: '',
}

export default function EditRecipeDialog({ recipe }: { recipe: any }) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(updateRecipe, initialState)
  
  // Parse ingredients safely
  const initialIngredients = Array.isArray(recipe.ingredients) 
     ? recipe.ingredients 
     : []

  const [ingredients, setIngredients] = useState<{name: string, qty: number, unit: string}[]>(initialIngredients)
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
    }
  }, [state])

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
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={recipe.id} />
          <div className="grid gap-2">
            <Label htmlFor="name">Recipe Name</Label>
            <Input id="name" name="name" defaultValue={recipe.name} required />
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
                    <div className="grid gap-1 w-20">
                         <Input 
                            type="number" 
                            value={String(ing.qty)} // Ensure string for input
                            onChange={(e) => updateIngredient(i, 'qty', parseFloat(e.target.value))}
                            required
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
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
