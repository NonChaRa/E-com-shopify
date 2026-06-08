import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ALLOWED_ORIGIN = 'https://asteri2kstudio.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    if (!email) throw new Error("Email parameter is required.")

    // Basic format check before hitting the Shopify API
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format.")
    }

    const shopifyDomain = "asteri2kstudio.myshopify.com"
    const adminToken = Deno.env.get('SHOPIFY_ADMIN_TOKEN')

    if (!adminToken) throw new Error("Cloud environment Admin Key configuration missing.")

    const endpoint = `https://${shopifyDomain}/admin/api/2024-04/graphql.json`

    const lookupQuery = {
      query: `
        query findCustomer($query: String!) {
          customers(first: 1, query: $query) {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      variables: { query: `email:${email}` }
    }

    const lookupRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify(lookupQuery)
    })
    const lookupJson = await lookupRes.json()
    const customerEdge = lookupJson?.data?.customers?.edges || []

    let mutation = ""
    let variables = {}

    if (customerEdge.length > 0) {
      // --- PHASE 2A: Profile Exists -> Update existing record ---
      const existingId = customerEdge[0].node.id
      mutation = `
        mutation updateConsent($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer { id }
            userErrors { message }
          }
        }
      `
      variables = {
        input: {
          id: existingId,
          emailMarketingConsent: {
            marketingState: "SUBSCRIBED",
            consentUpdatedAt: new Date().toISOString()
          }
        }
      }
    } else {
      // --- PHASE 2B: Brand New User -> Create fresh subscriber record ---
      mutation = `
        mutation createSubscriber($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer { id }
            userErrors { message }
          }
        }
      `
      variables = {
        input: {
          email,
          emailMarketingConsent: {
            marketingState: "SUBSCRIBED",
            consentUpdatedAt: new Date().toISOString()
          }
        }
      }
    }

    // --- PHASE 3: Fire the Upsert Mutation payload ---
    const mutationRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
      body: JSON.stringify({ query: mutation, variables })
    })
    const mutationJson = await mutationRes.json()
    
    return new Response(JSON.stringify({ success: true, data: mutationJson }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})