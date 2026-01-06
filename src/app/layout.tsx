import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plate & Plan",
  description: "Family finance and meal planning app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col md:flex-row bg-background text-foreground`}
      >
        <ThemeProvider>
            <Sidebar />
            
            <main className="flex-1 flex flex-col min-h-screen w-full relative">
                <div className="absolute top-4 right-4 z-20">
                    <ThemeToggle />
                </div>
                <div className="flex-1 pb-20 md:pb-0 overflow-y-auto w-full"> 
                   {children}
                </div>
            </main>

            <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
