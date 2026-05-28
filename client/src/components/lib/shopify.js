import { GET_PRODUCTS_QUERY, GET_SHOP_POLICIES, GET_COLLECTION_PRODUCTS } from './queries';


// Parses the Category metafield `colorMetafield.value` into a lowercase string array.
// Shopify returns metafield values as JSON-encoded strings, e.g.:
//   '["Orange","Rose gold","Red"]' → ["orange","rose gold","red"]
// Falls back to comma-splitting for plain (non-JSON) strings.
const parseMetafieldColors = (rawValue) => {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    const items = Array.isArray(parsed) ? parsed : [String(parsed)];
    return items.map(item => String(item).toLowerCase().trim()).filter(Boolean);
  } catch {
    return rawValue.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
  }
};

/**
 * Appends Shopify CDN image transformation params.
 * Shopify CDN supports ?width=N&format=webp natively — no extra processing needed.
 * Non-Shopify URLs are returned unchanged.
 */
export const optimizeShopifyImage = (url, { width = 800, format = 'webp' } = {}) => {
  if (!url || !url.includes('cdn.shopify.com')) return url;
  const [base, query] = url.split('?');
  const params = new URLSearchParams(query);
  params.set('width', String(width));
  params.set('format', format);
  return `${base}?${params.toString()}`;
};

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
    console.error('Shopify fetch error:', error);
    return null;
  }
}

const transformShopifyProducts = (edges) =>
  edges.map(({ node }) => ({
    id: node.id,
    name: node.title,
    handle: node.handle,
    description: node.description || '',
    descriptionHtml: node.descriptionHtml || '',
    price: node.priceRange?.minVariantPrice?.amount || '0.00',
    // Serve WebP at optimal widths — Shopify CDN transforms images server-side
    image_url: optimizeShopifyImage(node.images?.edges[0]?.node?.url || '', { width: 800 }),
    images: node.images?.edges.map(edge =>
      optimizeShopifyImage(edge.node.url, { width: 1200 })
    ) || [],
    variants: node.variants?.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      stock: edge.node.quantityAvailable || 0,
      available: edge.node.availableForSale,
    })) || [],
    colors: (() => {
      const refEdges = node.colorMetafield?.references?.edges;
      if (refEdges && refEdges.length > 0) {
        return refEdges.map(edge =>
          edge.node.handle.toLowerCase().replace(/-/g, ' ')
        );
      }

      return parseMetafieldColors(node.colorMetafield?.value);
    })(),
  }));

export const fetchProductsByCollection = async (collectionHandle) => {
  try {
    const response = await shopifyFetch(GET_COLLECTION_PRODUCTS, { handle: collectionHandle });
    const rawEdges = response?.data?.collection?.products?.edges || [];
    return transformShopifyProducts(rawEdges);
  } catch (err) {
    console.error('Collection fetch error:', err);
    return [];
  }
};

export const fetchAllGlobalProducts = async (limit = 24) => {
  try {
    const response = await shopifyFetch(GET_PRODUCTS_QUERY, { first: limit });
    const rawEdges = response?.data?.products?.edges || [];
    return transformShopifyProducts(rawEdges);
  } catch (err) {
    console.error('Global catalog fetch error:', err);
    return [];
  }
};

export const fetchShopPolicies = async () => {
  try {
    const response = await shopifyFetch(GET_SHOP_POLICIES);
    return response?.data?.shop || null;
  } catch (err) {
    console.error('Policy fetch error:', err);
    return null;
  }
};
