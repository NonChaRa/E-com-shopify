import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  console.log("--- WEBHOOK TRIGGERED ---")

  try {
    const payload = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', payload.email)
      .single()

    if (!profile) {
      console.error(`Error: No profile found for ${payload.email}`);
      return new Response("Profile not found", { status: 200 });
    }

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

    if (payload.line_items && payload.line_items.length > 0) {
      const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN') || 'asteri2kstudio.myshopify.com';
      const storefrontToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');

      const itemsToInsert = await Promise.all(payload.line_items.map(async (item: any) => {
        let resolvedImageUrl = item.image_url || "";

        if (!resolvedImageUrl && item.product_id && storefrontToken) {
          try {
            const gqlQuery = {
              query: `
                query getProductImage($id: ID!) {
                  node(id: $id) {
                    ... on Product {
                      featuredImage {
                        url
                      }
                    }
                  }
                }
              `,
              variables: { id: `gid://shopify/Product/${item.product_id}` }
            };

            const shopifyRes = await fetch(`https://${shopifyDomain}/api/2024-04/graphql.json`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': storefrontToken,
              },
              body: JSON.stringify(gqlQuery),
            });

            const resJson = await shopifyRes.json();

            // DIAGNOSTIC LOGS: These show up in your Supabase dashboard
            console.log(`[Diagnostic] Querying Shopify for Product ID: ${item.product_id}`);
            console.log(`[Diagnostic] Shopify Response:`, JSON.stringify(resJson));

            if (resJson.errors) {
              console.error(`[Diagnostic] GraphQL Error:`, resJson.errors[0].message);
            }

            resolvedImageUrl = resJson?.data?.node?.featuredImage?.url || "";
          } catch (fetchErr) {
            console.error(`Failed resolving image for product ${item.product_id}:`, fetchErr.message);
          }
        }

        return {
          order_id: order.id,
          product_id: (item.product_id || '').toString(),
          variant_id: (item.variant_id || '').toString(),
          name: item.title || item.name || 'Handmade Press-On Nails Set',
          quantity: parseInt(item.quantity || 1, 10),
          price: parseFloat(item.price || 0),
          image_url: resolvedImageUrl
        };
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemsToInsert)

      if (itemsErr) throw itemsErr
      console.log("Line items save sequence processed.");
    }

    return new Response("Success", { status: 200 })

  } catch (err) {
    console.error("Critical Webhook Error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})