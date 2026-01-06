'use client'

import { Home, Wallet, Package, User, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/wallets', icon: Wallet, label: 'Wallets' },
    { href: '/add', icon: PlusCircle, label: 'Add', isPrimary: true },
    { href: '/inventory', icon: Package, label: 'Inventory' },
    { href: '/settings', icon: User, label: 'Settings' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-2 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)] z-50">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {links.map((link) => {
          const isActive = pathname === link.href
          
          if (link.isPrimary) {
             return (
               <Link
                 key={link.href}
                 href={link.href}
                 className="flex flex-col items-center justify-center -mt-6"
               >
                 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
                   <link.icon className="h-7 w-7" />
                 </div>
                 <span className="mt-1 text-[10px] font-medium text-muted-foreground">Add</span>
               </Link>
             )
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <link.icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
