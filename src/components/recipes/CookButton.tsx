"use client";

import { cookMeal } from "@/app/actions/recipe";
import { Button } from "@/components/ui/button";
import { Loader2, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Assuming usage

interface CookButtonProps {
    recipeId: string;
    ingredients: any[];
    canCook: boolean;
}

export default function CookButton({ recipeId, ingredients, canCook }: CookButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleCook() {
        if (!confirm("Cook this meal? Ingredients will be deducted from your inventory.")) return;
        
        setLoading(true);
        const res = await cookMeal(recipeId, ingredients);
        setLoading(false);

        if (res.error) {
            alert(res.message);
        } else {
            alert(res.message);
        }
    }

    return (
        <Button 
            className="w-full gap-2" 
            disabled={!canCook || loading} 
            variant={canCook ? "default" : "outline"}
            onClick={handleCook}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Utensils className="h-4 w-4" />}
            {canCook ? "Cook Now" : "Missing Items"}
        </Button>
    )
}
