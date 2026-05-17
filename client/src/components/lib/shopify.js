// client/src/lib/shopify.js
import { GET_PRODUCTS_QUERY, GET_SHOP_POLICIES, GET_COLLECTION_PRODUCTS } from './queries';

/**
 * Generic fetcher for Shopify Storefront API
 */
export async function shopifyFetch(query, variables = {}) {
  const endpoint = `https://${import.meta.env.VITE_SHOPIFY_DOMAIN}/api/2024-04/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Shopify Fetch Helper Error:", error);
    return null;
  }
}

/**
 * Transforms Shopify nested edges/nodes into clean flat objects
 */
const transformShopifyProducts = (edges) => {
  return edges.map(({ node }) => ({
    id: node.id,
    name: node.title,
    handle: node.handle,
    description: node.description || '',
    price: node.priceRange?.minVariantPrice?.amount || '0.00',
    image_url: node.images?.edges[0]?.node?.url || '', 
    images: node.images?.edges.map(edge => edge.node.url) || [], 
    variants: node.variants?.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      stock: edge.node.quantityAvailable || 0, 
      available: edge.node.availableForSale
    })) || []
  }));
};

/**
 * Fetch products cleanly by collection handle (e.g., 'blue-imperial', 'gadom')
 */
export const fetchProductsByCollection = async (collectionHandle) => {
  try {
    const response = await shopifyFetch(GET_COLLECTION_PRODUCTS, { handle: collectionHandle });
    const rawEdges = response?.data?.collection?.products?.edges || [];
    return transformShopifyProducts(rawEdges);
  } catch (err) {
    console.error("Collection Fetch System Error:", err);
    return [];
  }
};

/**
 * Fallback: Fetch globally uncategorized catalog lists
 */
export const fetchAllGlobalProducts = async (limit = 24) => {
  try {
    const response = await shopifyFetch(GET_PRODUCTS_QUERY, { first: limit });
    const rawEdges = response?.data?.products?.edges || [];
    return transformShopifyProducts(rawEdges);
  } catch (err) {
    console.error("Global Catalog Fetch System Error:", err);
    return [];
  }
};

export const fetchShopPolicies = async () => {
  try {
    const response = await shopifyFetch(GET_SHOP_POLICIES);
    return response?.data?.shop || null;
  } catch (err) {
    console.error("System Policy Sync Error:", err);
    return null;
  }
};