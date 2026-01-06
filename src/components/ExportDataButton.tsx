"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ExportDataButton() {
    const [loading, setLoading] = useState(false);
    
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleExport() {
        setLoading(true);
        // Fetch all expenses joined with categories
        const { data, error } = await supabase
            .from('expenses')
            .select(`
                id,
                amount,
                date,
                notes,
                category:categories(name),
                payment_mode
            `);
        
        if (error || !data) {
            alert("Error fetching data");
            setLoading(false);
            return;
        }

        // Convert to CSV
        const headers = ["ID", "Date", "Amount", "Category", "Payment Mode", "Notes"];
        const rows = data.map(row => [
            row.id,
            row.date,
            row.amount,
            // @ts-ignore
            row.category?.name || "Uncategorized",
            row.payment_mode,
            `"${(row.notes || "").replace(/"/g, '""')}"`
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setLoading(false);
    }

    return (
        <Button onClick={handleExport} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export to CSV
        </Button>
    )
}
