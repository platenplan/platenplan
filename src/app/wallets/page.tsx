import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Wallet as WalletIcon } from "lucide-react"
import AddWalletDialog from "@/components/forms/AddWalletDialog"
import DeleteButton from "@/components/DeleteButton"

export default async function WalletsPage() {
  const supabase = await createClient()
  const { data: wallets } = await supabase.from("wallets").select("*").order('created_at', { ascending: true })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wallets</h1>
        <AddWalletDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wallets?.map((w) => (
          <Card key={w.id} className="relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <DeleteButton table="wallets" id={w.id} path="/wallets" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="font-semibold text-base">{w.name}</CardTitle>
               <WalletIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">AED {Number(w.balance).toLocaleString()}</div>
               <p className="text-sm text-gray-500 capitalize">{w.type} Wallet</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
