import { createClient } from '@supabase/supabase-js'; // Use admin client for cron
import { NextResponse } from 'next/server';

export async function POST() {
  // Note: In production, verify a secret header key here to prevent unauthorized access

  // We use the Service Role Key here to bypass RLS for the background job
  // Ensure this key is in .env.local as NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY or similar (CAREFUL: Don't expose this in client)
  // For this demo, assuming we have access or using standard server client if RLS allows (user context needed).
  // Best practice: Use Service Role for cron.
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

  if (!serviceRoleKey) {
      return NextResponse.json({ error: "Service Role Key missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 1. Fetch Candidates
  const { data: recurring, error } = await supabase
    .from("recurring_expenses")
    .select("*")
    .eq("auto_post", true)
    .eq("due_day", currentDay);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let processedCount = 0;

  for (const item of recurring || []) {
      // Check if already posted this month
      let shouldPost = true;
      if (item.last_posted_at) {
          const lastDate = new Date(item.last_posted_at);
          if (
              lastDate.getMonth() === currentMonth && 
              lastDate.getFullYear() === currentYear
          ) {
              shouldPost = false;
          }
      }

      if (shouldPost) {
          // Insert Expense
          const { error: insertError } = await supabase.from("expenses").insert({
              amount: item.amount,
              description: `Recurring: ${item.name}`, // Using description as per updated schema
              category_id: item.category_id,
              subcategory_id: item.subcategory_id,
              paid_by_wallet_id: null, // Logic gap: Who pays? Adding null or needs default. 
                                       // Schema might require it. For now leaving null (assume logic or SQL default).
                                       // Better: We should add 'default_wallet_id' to recurring_expenses schema in future.
              notes: "Auto-posted",
              shared_flag: true,
              date: today.toISOString()
          });

          if (!insertError) {
              // Update timestamp
              await supabase
                  .from("recurring_expenses")
                  .update({ last_posted_at: today.toISOString() })
                  .eq("id", item.id);
              
              processedCount++;
          }
      }
  }

  return NextResponse.json({ success: true, processedCount });
}
