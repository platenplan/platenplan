"use server"

export async function searchExternalRecipes(query: string) {
  if (!query) return { success: false, results: [] }

  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`)
    const data = await res.json()
    
    if (!data.meals) return { success: true, results: [] }

    const results = data.meals.map((meal: any) => {
        // Map ingredients from weird strIngredient1 format
        const ingredients = []
        for(let i=1; i<=20; i++) {
            const name = meal[`strIngredient${i}`]
            const measure = meal[`strMeasure${i}`]
            
            if(name && name.trim()) {
                ingredients.push({
                    name: name.trim(),
                    qty: 1, // Default to 1 as API measures are strings like "1 cup" which are hard to parse perfectly without NLP
                    unit: measure?.trim() || 'pcs'
                })
            }
        }
        
        return {
            id: meal.idMeal,
            name: meal.strMeal,
            category: meal.strCategory,
            instructions: meal.strInstructions,
            image: meal.strMealThumb,
            ingredients
        }
    })

    return { success: true, results }
  } catch (error) {
      console.error("External API Error:", error)
      return { success: false, message: "Failed to fetch recipes" }
  }
}
