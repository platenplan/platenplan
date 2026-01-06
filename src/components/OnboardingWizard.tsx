"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [householdName, setHouseholdName] = useState("");
  const [userName, setUserName] = useState("");
  const [walletName, setWalletName] = useState("Cash Wallet");
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function finishSetup() {
    setLoading(true);
    
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Should handle error

    // 2. Create Household
    const { data: household, error: hhError } = await supabase
        .from('households')
        .insert({ name: householdName })
        .select()
        .single();
    
    if (hhError || !household) {
        alert("Error creating household");
        setLoading(false);
        return;
    }

    // 3. Update Profile (Link to household)
    // Note: Trigger might have created profile, so we update
    await supabase.from('profiles').update({
        household_id: household.id,
        full_name: userName,
        role: 'admin'
    }).eq('id', user.id);

    // 4. Create Wallet
    await supabase.from('wallets').insert({
        household_id: household.id,
        name: walletName,
        type: 'personal',
        owner_user_id: user.id,
        balance: 0
    });

    // 5. Create Standard Categories (Mini-seed)
    const cats = ['Groceries', 'Transport', 'Kids', 'Dining', 'Bills'];
    await supabase.from('categories').insert(
        cats.map(c => ({ household_id: household.id, name: c }))
    );

    setLoading(false);
    router.push('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Your Household</CardTitle>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </CardHeader>
        <CardContent className="space-y-4">
            
            {/* Step 1: Household Name */}
            {step === 1 && (
                <div className="space-y-2">
                    <Label>Family Name</Label>
                    <Input 
                        placeholder="e.g. The Smiths" 
                        value={householdName}
                        onChange={e => setHouseholdName(e.target.value)}
                    />
                </div>
            )}

            {/* Step 2: User Name */}
            {step === 2 && (
                <div className="space-y-2">
                    <Label>Your Name</Label>
                    <Input 
                        placeholder="e.g. John Doe" 
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                    />
                </div>
            )}

             {/* Step 3: Wallet */}
             {step === 3 && (
                <div className="space-y-2">
                    <Label>First Wallet Name</Label>
                    <Input 
                        placeholder="e.g. My Cash" 
                        value={walletName}
                        onChange={e => setWalletName(e.target.value)}
                    />
                </div>
            )}

            <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
                )}
                
                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)} className="ml-auto">Next</Button>
                ) : (
                  <Button onClick={finishSetup} className="ml-auto" disabled={loading}>
                      {loading ? "Setting up..." : "Finish"}
                  </Button>
                )}
            </div>
            
        </CardContent>
      </Card>
    </div>
  );
}
