"use client";

import { useState, useEffect } from "react";
import { createTransaction } from '@/app/add/actions';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GroceryAutoFill from "@/components/grocery/GroceryAutoFill";

interface AddExpenseFastProps {
  categories: any[];
  wallets: any[];
  profiles: any[];
}

export default function AddExpenseFast({ categories, wallets, profiles }: AddExpenseFastProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRestock, setShowRestock] = useState(false);
  
  // Smart Suggestion Logic
  useEffect(() => {
      const hour = new Date().getHours();
      let suggestedName = "";

      if (hour >= 6 && hour < 11) suggestedName = "Groceries"; // Breakfast runs
      else if (hour >= 11 && hour < 15) suggestedName = "Dining"; // Lunch
      else if (hour >= 17 && hour < 20) suggestedName = "Groceries"; // Dinner runs
      else if (hour >= 20) suggestedName = "Entertainment";

      const found = categories.find(c => c.name === suggestedName || c.name.includes(suggestedName));
      if (found && !category) {
          setCategory(String(found.id));
      }
      // Simple default wallet logic: pick first if none
      if (!wallet && wallets.length > 0) {
          setWallet(wallets[0].id);
      }
  }, [categories, wallets]); // Only run on mount/data load

  // Haptic Helper
  function haptic(type: "tap" | "success" | "error") {
    if (typeof navigator !== 'undefined' && "vibrate" in navigator) {
      const patterns = {
        tap: 10,
        success: [20, 30, 20],
        error: [50, 50, 50],
      };
      navigator.vibrate(patterns[type]);
    }
  }

  function press(n: string) {
    haptic("tap");
    if (amount.includes('.') && n === '.') return;
    setAmount(prev => (prev + n).slice(0, 10));
  }

  async function submit() {
    if (!amount || !category || !wallet) {
        haptic("error");
        alert("Please select Amount, Category, and Wallet.");
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('description', 'Express Entry');
    formData.append('categoryId', category);
    formData.append('walletId', wallet);
    formData.append('date', new Date().toISOString());

    const result = await createTransaction(null, formData);
    
    setLoading(false);
    if (result.error) {
        haptic("error");
        alert(result.message);
    } else {
        haptic("success");
        setAmount("");
        
        // Smart Trigger: Check if category is "Groceries"
        const catName = categories.find(c => String(c.id) === category)?.name;
        if (catName === 'Groceries') {
            setShowRestock(true);
        }
    }
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto space-y-4 pb-20 md:pb-0">
      
      {/* Amount Display */}
      <div className="text-center py-6">
          <motion.div 
            key={amount}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-bold tracking-tighter"
          >
            {amount || "0.00"}
          </motion.div>
          <div className="text-sm text-muted-foreground mt-1">AED</div>
      </div>

      {/* 1. Category Chips */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {categories.map(c => {
                const isSelected = category === String(c.id);
                return (
                    <motion.button
                        key={c.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setCategory(String(c.id));
                            haptic("tap");
                        }}
                        className={cn(
                            "relative whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-colors z-0",
                            isSelected 
                                ? "text-primary-foreground border-primary" 
                                : "bg-background hover:bg-muted"
                        )}
                    >
                        {isSelected && (
                             <motion.div
                                layoutId="cat-bubble"
                                className="absolute inset-0 bg-primary rounded-full -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                             />
                        )}
                        <span className="relative z-10">{c.name}</span>
                    </motion.button>
                );
             })}
        </div>
      </div>

      {/* 2. Wallet Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid By</label>
        <div className="flex gap-2 overflow-x-auto pb-2">
             {wallets.map(w => {
                 const isSelected = wallet === w.id;
                 return (
                    <motion.button
                        key={w.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setWallet(w.id);
                            haptic("tap");
                        }}
                        className={cn(
                            "relative flex-1 min-w-[100px] px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-center overflow-hidden",
                            isSelected 
                                ? "text-primary-foreground border-primary" 
                                : "bg-background hover:bg-muted"
                        )}
                    >
                        {isSelected && (
                             <motion.div
                                layoutId="wallet-bubble"
                                className="absolute inset-0 bg-primary -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                             />
                        )}
                        <div className="truncate relative z-10">{w.name}</div>
                    </motion.button>
                 );
             })}
        </div>
      </div>

      {/* 3. Keypad */}
      <div className="grid grid-cols-3 gap-3 mt-auto">
        {["1","2","3","4","5","6","7","8","9",".","0","←"].map(k => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.9, backgroundColor: "rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="h-14 text-2xl font-normal rounded-xl bg-secondary hover:bg-secondary/80 active:bg-secondary/70 flex items-center justify-center outline-none select-none touch-manipulation"
            onClick={() => (k === "←" ? setAmount(a => a.slice(0, -1)) : press(k))}
          >
            {k}
          </motion.button>
        ))}
      </div>

      {/* Submit Button */}
      <motion.button 
        onClick={submit} 
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        animate={loading ? { scale: [1, 1.02, 1], transition: { repeat: Infinity } } : {}}
        className="w-full text-lg h-14 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center"
      >
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Add Expense"}
      </motion.button>

      {/* Smart Restock Modal */}
      {/* Note: householdId is not directly prop passed, we might need it. 
          For robustness, assume profile has it or fetch it. 
          For MVP, we'll assume we can get it from context or pass it.
          Updating props interface to include householdId.
      */}
      <GroceryAutoFill 
        isOpen={showRestock} 
        onClose={() => setShowRestock(false)} 
        householdId={profiles[0]?.household_id || ''} // Fallback to first profile's household
      />

    </div>
  );
}
