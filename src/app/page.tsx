import { getDashboardMetrics } from '@/lib/api/dashboard'
import { TransactionList } from '@/components/dashboard/TransactionList'
import SummaryCard from '@/components/SummaryCard'
import CategoryChart from '@/components/CategoryChart'
import MonthlyTrendChart from '@/components/MonthlyTrendChart'

export default async function Home() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Spend" value={`AED ${metrics.totalSpend.toLocaleString()}`} />
        <SummaryCard title="Groceries" value={`AED ${metrics.grocerySpend.toLocaleString()}`} />
        <SummaryCard title="Wallet Balance" value={`AED ${metrics.walletBalance.toLocaleString()}`} />
        <SummaryCard title="Monthly Trend" value={`${metrics.spendChange > 0 ? '+' : ''}${metrics.spendChange.toFixed(1)}%`} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-lg shadow border">
          <h2 className="font-semibold mb-2">Category Breakdown</h2>
          <CategoryChart />
        </div>

        <div className="bg-card p-4 rounded-lg shadow border">
          <h2 className="font-semibold mb-2">Monthly Trend</h2>
          <MonthlyTrendChart />
        </div>
      </div>

      {/* RECENT EXPENSES */}
      <div className="">
         <TransactionList transactions={metrics.recentTransactions} />
      </div>
    </div>
  )
}
