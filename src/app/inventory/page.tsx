import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AddInventoryDialog from "@/components/forms/AddInventoryDialog"
import DeleteButton from "@/components/DeleteButton"

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: items } = await supabase.from("inventory").select("*").order('expiry_date', { ascending: true })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <AddInventoryDialog />
      </div>

      {items && items.length === 0 && (
          <p className="text-muted-foreground">No inventory items found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items?.map((i) => (
          <Card key={i.id} className="relative group">
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <DeleteButton table="inventory" id={i.id} path="/inventory" />
             </div>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="font-semibold text-base">{i.item_name}</CardTitle>
                 {i.status === 'low' && <Badge variant="destructive">Low</Badge>}
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">{Number(i.quantity)} <span className="text-sm font-normal text-muted-foreground">{i.unit}</span></div>
                <p className="text-sm text-gray-500 mt-1">
                  Exp: {i.expiry_date ? new Date(i.expiry_date).toLocaleDateString() : "N/A"}
                </p>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
