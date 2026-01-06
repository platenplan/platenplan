import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react'

export function DashboardOverview() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 4,231</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groceries</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 1,200</div>
            <p className="text-xs text-muted-foreground">80% of budget</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium text-primary-foreground/90">Family Wallet</CardTitle>
           <Wallet className="h-4 w-4 text-primary-foreground/70" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">AED 12,450</div>
          <p className="text-xs text-primary-foreground/80">Available balance</p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="font-semibold text-lg">Alerts</h3>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-4 flex items-center gap-3">
             <AlertCircle className="h-5 w-5 text-yellow-600" />
             <div className="text-sm">
               <span className="font-medium block">Grocery Budget Warning</span>
               You are close to your 1,500 AED limit.
             </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4 flex items-center gap-3">
             <AlertCircle className="h-5 w-5 text-red-600" />
             <div className="text-sm">
               <span className="font-medium block">Milk Expiring</span>
               2 items expiring tomorrow.
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
