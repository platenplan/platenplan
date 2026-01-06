import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  category_name?: string
  wallet_name?: string
}

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No recent transactions.</p>
          )}
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{transaction.description}</p>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                   <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                   {transaction.category_name && (
                       <Badge variant="secondary" className="text-[10px] h-4 px-1">{transaction.category_name}</Badge>
                   )}
                </div>
              </div>
              <div className="font-medium">
                - AED {Number(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
