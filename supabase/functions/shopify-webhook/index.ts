import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // 1. Log that the function was actually hit
  console.log("--- WEBHOOK TRIGGERED ---")

  try {
    const payload = await req.json()
    console.log("Order ID from Shopify:", payload.id)
    console.log("Customer Email:", payload.email)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. The Link Check
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', payload.email)
      .single()

    if (!profile) {
      console.error(`Error: No profile found for ${payload.email}`);
      return new Response("Profile not found", { status: 200 }); // Still return 200 to Shopify so it stops retrying
    }

    // 3. Insert the Order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        shopify_order_id: payload.id.toString(),
        user_id: profile.id,
        email: payload.email,
        total_price: payload.total_price,
        fulfillment_status: payload.fulfillment_status || 'unfulfilled',
        order_date: payload.created_at
      })
      .select()
      .single()

    if (orderErr) throw orderErr

    console.log("Order saved to Supabase successfully!")
    return new Response("Success", { status: 200 })

  } catch (err) {
    console.error("Critical Webhook Error:", err.message)
    return new Response(Error, { status: 500 })
  }
})