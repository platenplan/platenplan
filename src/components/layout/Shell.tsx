import { BottomNav } from '@/components/layout/BottomNav'

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50 pb-20">
      <main className="flex-1 mx-auto w-full max-w-md bg-background min-h-screen shadow-2xl shadow-black/5 overflow-hidden ring-1 ring-black/5">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
