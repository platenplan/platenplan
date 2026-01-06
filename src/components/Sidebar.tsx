"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Baby,
  Settings,
  Soup,
  PlusCircle,
  RefreshCcw
} from "lucide-react";

const links = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Add", href: "/add", icon: PlusCircle },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Inventory", href: "/inventory", icon: ShoppingCart },
  { name: "Recipes", href: "/recipes", icon: Soup },
  { name: "Kids", href: "/kids", icon: Baby },
  { name: "Budgets", href: "/budgets", icon: ShoppingCart }, // Re-using icon for now
  { name: "Recurring", href: "/recurring", icon: RefreshCcw },
  { name: "Fair Share", href: "/fair-share", icon: Wallet }, // Re-using icon
  { name: "Settings", href: "/settings", icon: Settings }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r p-4 h-full">
      <h1 className="text-xl font-bold mb-6 px-3">Plate & Plan</h1>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition font-medium",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
