import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AddInventoryDialog from "@/components/forms/AddInventoryDialog"
import DeleteButton from "@/components/DeleteButton"
import EditInventoryDialog from "@/components/forms/EditInventoryDialog"
import SearchFilterBar from "@/components/SearchFilterBar"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams?: {
    q?: string
    page?: string
    unit?: string
  }
}) {
  const supabase = await createClient()
  
  // 1. Build Query
  let query = supabase.from("inventory").select("*", { count: 'exact' }).order('expiry_date', { ascending: true })

  // 2. Search
  const searchTerm = searchParams?.q || '';
  if (searchTerm) {
      query = query.ilike('item_name', `%${searchTerm}%`)
  }

  // 3. Filter
  if (searchParams?.unit) {
      const units = searchParams.unit.split(',')
      query = query.in('unit', units)
  }

  // 4. Pagination
  const page = Number(searchParams?.page) || 1
  const pageSize = 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  query = query.range(from, to)

  const { data: items, count } = await query

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Manage your pantry and tracking.</p>
        </div>
        <AddInventoryDialog />
      </div>

      <SearchFilterBar 
        filterOptions={[
            { label: 'Unit', key: 'unit', options: ['kg', 'g', 'pcs', 'pack', 'box'] }
        ]}
      />

      {items && items.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
             <p className="text-muted-foreground text-lg">No inventory items found.</p>
             {searchTerm && <p className="text-sm">Try adjusting your search or filters.</p>}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {items?.map((i) => (
          <Card key={i.id} className="relative group hover:shadow-md transition-shadow">
             <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded-md backdrop-blur-sm border shadow-sm z-10 p-1">
                 <EditInventoryDialog item={i} />
                 <DeleteButton table="inventory" id={i.id} path="/inventory" />
             </div>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="font-semibold text-base truncate pr-8" title={i.item_name}>
                    {i.item_name}
                 </CardTitle>
                 {i.status === 'low' && <Badge variant="destructive" className="text-[10px] h-5">Low</Badge>}
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold flex items-baseline gap-1">
                    {Number(i.quantity)} 
                    <span className="text-sm font-normal text-muted-foreground">{i.unit}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                    Exp: {i.expiry_date ? new Date(i.expiry_date).toLocaleDateString() : "No Date"}
                    </p>
                    {i.category && <Badge variant="outline" className="text-[10px]">{i.category}</Badge>}
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination Footer */}
      {count && count > pageSize && (
          <div className="flex justify-center gap-2 mt-8">
              {/* Simple pagination for MVP */}
              <p className="text-xs text-muted-foreground">Showing {items?.length} of {count} items</p>
          </div>
      )}
    </div>
  )
}
