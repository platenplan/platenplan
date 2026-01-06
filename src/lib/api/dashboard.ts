import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export type DashboardMetrics = {
  totalSpend: number
  spendChange: number // Percentage change vs last month
  walletBalance: number
  grocerySpend: number
  groceryBudgetPercent: number
  recentTransactions: any[]
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient()
  const now = new Date()
  const startOfCurrentMonth = startOfMonth(now).toISOString()
  const endOfCurrentMonth = endOfMonth(now).toISOString()
  const startOfLastMonth = startOfMonth(subMonths(now, 1)).toISOString()
  const endOfLastMonth = endOfMonth(subMonths(now, 1)).toISOString()

  // 1. Get Current Month Total Spend
  const { data: currentMonthExpenses, error: currentError } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', startOfCurrentMonth)
    .lte('date', endOfCurrentMonth)

  const totalSpend = currentMonthExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

  // 2. Get Last Month Total Spend (for comparison)
  const { data: lastMonthExpenses } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', startOfLastMonth)
    .lte('date', endOfLastMonth)

  const lastMonthSpend = lastMonthExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  
  let spendChange = 0
  if (lastMonthSpend > 0) {
      spendChange = ((totalSpend - lastMonthSpend) / lastMonthSpend) * 100
  } else if (totalSpend > 0) {
      spendChange = 100 // 100% increase if last month was 0
  }

  // 3. Get Wallet Balance (All Wallets)
  const { data: wallets } = await supabase
    .from('wallets')
    .select('balance')
  
  const walletBalance = wallets?.reduce((sum, item) => sum + Number(item.balance), 0) || 0

  // 4. Get Grocery Spend (Hardcoded Category for now, TODO: dynamic)
  const { data: groceryExpenses } = await supabase
    .from('expenses')
    .select('amount, categories!inner(name)')
    .eq('categories.name', 'Groceries')
    .gte('date', startOfCurrentMonth)
    .lte('date', endOfCurrentMonth)

  const grocerySpend = groceryExpenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  
  // Mock budget for now (e.g. 1500 limit)
  const groceryBudgetPercent = Math.min((grocerySpend / 1500) * 100, 100)

  // 5. Get Recent Transactions
  const { data: recentTransactions } = await supabase
    .from('expenses')
    .select(`
      id,
      amount,
      description,
      date,
      categories (name),
      wallets (name)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)
  
  const formattedTransactions = recentTransactions?.map((t: any) => ({
      ...t,
      category_name: t.categories?.name,
      wallet_name: t.wallets?.name
  })) || []

  return {
    totalSpend,
    spendChange,
    walletBalance,
    grocerySpend,
    groceryBudgetPercent,
    recentTransactions: formattedTransactions
  }
}
