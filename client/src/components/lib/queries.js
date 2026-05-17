// src/components/lib/queries.js

/**
 * PRODUCT CATALOG QUERIES
 */
export const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
            }
          }
          images(first: 5) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                quantityAvailable
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_COLLECTION_PRODUCTS = `
  query getCollectionProducts($handle: String!) {
    collection(handle: $handle) {
      id
      title
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  quantityAvailable
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * CART & CHECKOUT MUTATIONS
 */
export const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_BUYER_IDENTITY_UPDATE = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * CUSTOMER PROFILE & AUTH QUERIES
 */
export const GET_CUSTOMER_ORDERS = `
  query getCustomerOrders($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: 10, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPriceV2 {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const CUSTOMER_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const GET_SHOP_POLICIES = `
  query getShopPolicies {
    shop {
      privacyPolicy {
        title
        body
      }
      shippingPolicy {
        title
        body
      }
      refundPolicy {
        title
        body
      }
    }
  }
`;