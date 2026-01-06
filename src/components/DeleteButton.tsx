"use client";

import { deleteItem } from "@/app/actions/generic";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export default function DeleteButton({ table, id, path }: { table: string, id: string, path: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            disabled={isPending}
            onClick={() => {
                if(confirm("Are you sure?")) {
                    startTransition(async () => {
                        await deleteItem(table, id, path);
                    });
                }
            }}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
