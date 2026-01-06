"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Baby,
  Soup,
  PlusCircle
} from "lucide-react";

const links = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Add", href: "/add", icon: PlusCircle },
  { name: "Inventory", href: "/inventory", icon: ShoppingCart },
  { name: "Kids", href: "/kids", icon: Baby },
  { name: "Recipes", href: "/recipes", icon: Soup }
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-1 left-4 right-4 bg-card/90 backdrop-blur-md border rounded-2xl shadow-lg flex justify-around py-3 z-50 safe-area-bottom">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative flex flex-col items-center gap-1 text-[10px] w-full",
              active ? "text-primary font-medium" : "text-muted-foreground"
            )}
          >
            {active && (
              <motion.div
                layoutId="nav-pill"
                className="absolute -inset-1 top-[-4px] bg-primary/10 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon size={22} className={cn(active && "stroke-[2.5px]")} />
            <span className="">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
