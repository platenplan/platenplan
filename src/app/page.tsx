import { DashboardOverview } from '@/components/dashboard/Overview'

export default function Home() {
  return (
    <div className="pb-8">
      <header className="px-6 py-4 bg-white border-b sticky top-0 z-10">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Rafi</p>
      </header>
      <DashboardOverview />
    </div>
  )
}
