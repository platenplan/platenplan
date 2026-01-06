import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for premium feel
import "./globals.css";
import { Shell } from "@/components/layout/Shell";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plate & Plan",
  description: "Family finance and home management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased bg-gray-100 dark:bg-zinc-950")}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
