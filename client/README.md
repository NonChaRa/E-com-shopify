# ASTÉRI 2K Studio — Frontend

React + Vite storefront for a Bangkok-based handmade press-on nail brand. Powered by the Shopify Storefront API for product/cart data and Supabase for auth, order history, and contact submissions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router v7 |
| Global state | Zustand (cart, persisted to localStorage) |
| Auth | Supabase Auth (email/password) |
| Product data | Shopify Storefront API (GraphQL) |
| Styling | Plain CSS with CSS custom properties (no Tailwind at runtime) |
| Testing | Vitest + Testing Library |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Shopify and Supabase credentials. See `.env.example` for descriptions of every variable.

### 3. Run the dev server

```bash
npm run dev
```

The app is served at `http://localhost:5173` by default.

### 4. Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

### 5. Run tests

```bash
npm test
```

---

## Project Structure

```
src/
├── assets/               Static images and videos
├── components/           Shared/layout components
│   ├── lib/              Shopify API client + GraphQL queries
│   │   ├── shopify.js    shopifyFetch(), transformShopifyProducts()
│   │   └── queries.js    All GraphQL query/mutation strings
│   ├── Navbar.jsx        Pill navbar with mega menu + mobile drawer
│   ├── CartSidebar.jsx   Slide-out cart + Shopify checkout redirect
│   ├── ProductPage.jsx   Product detail page (PDP) with image gallery
│   └── SkeletonCard.jsx  Shimmer skeleton components for all loading states
├── hooks/
│   └── useInView.js      IntersectionObserver hook for scroll animations
├── pages/
│   ├── Home.jsx          Homepage: hero, product grid, craft process strip
│   ├── AllProducts.jsx   Shop page with filter sidebar + sort
│   ├── About.jsx
│   ├── Contact.jsx       Form → Supabase contact_submissions table
│   ├── PolicyPage.jsx    Fetches policies live from Shopify
│   ├── Values.jsx
│   └── NotFound.jsx      404 catch-all
├── store/
│   ├── useCart.js        Zustand cart store (persisted)
│   ├── CurrencyContext.jsx  Multi-currency display (THB/USD/AUD/CNY/KRW/JPY)
│   ├── currencies.js     Currency metadata (flag, symbol, label)
│   └── ToastContext.jsx  Global toast notification system
└── styles/
    ├── Global.css        Base reset, typography, scroll-reveal system
    └── Y2K.css           Design system: fonts, palette, charm decorations
```

---

## Architecture Notes

### Shopify integration (headless)
Products, variants, and stock levels are fetched from the **Shopify Storefront API** via GraphQL. The cart is managed locally in Zustand and only serialized to a real Shopify cart at checkout time. Checkout redirects to the Shopify-hosted checkout page.

Because the store uses a Thai Baht Stripe integration, currency conversion is display-only — the checkout always processes in THB. A notice is shown in the cart sidebar when the user has selected a non-THB currency.

### Auth
Supabase handles email/password auth. On login, the Supabase user is enriched with a `shopify_customer_id` from the `profiles` table. Session state is restored on every page load via `supabase.auth.onAuthStateChange` (fires `INITIAL_SESSION` on mount).

### State management
- **Cart** — Zustand with `persist` middleware. Survives page refreshes. Invalidated when the Shopify cart ID no longer exists (post-checkout).
- **Currency** — React Context, stored in `localStorage` with a 6-hour cache on live exchange rates from [fawazahmed0/currency-api](https://github.com/fawazahmed0/currency-api).
- **Toasts** — React Context, rendered via `createPortal` to `document.body`.

### CSS architecture
No CSS-in-JS, no Tailwind at runtime. Styles are co-located with components. A shared design-token layer in `Y2K.css` defines the full color palette, typography scale, and utility classes. `createPortal` is used throughout (toasts, currency dropdown, filter sidebar) to escape stacking-context issues caused by `backdrop-filter` and `transform`.

---

## Key Features

- **Multi-currency** — Live rates fetched from a free keyless CDN, cached for 6 hours. Supports THB, USD, AUD, CNY, KRW, JPY.
- **Product image gallery** — Thumbnail rail on PDP; all Shopify image variants surfaced.
- **Skeleton loading** — Shimmer skeletons that match the exact shape of every grid and PDP layout.
- **Scroll animations** — `useInView` (IntersectionObserver) triggers staggered entrances on product grids, section headers, and the craft process strip.
- **Toast notifications** — Non-blocking feedback for add-to-bag, item removal, checkout errors, and pre-order confirmations.
- **404 page** — Catch-all route with an on-brand editorial design.
- **Pre-order flow** — Variants with zero stock but `availableForSale: true` are treated as pre-orders with a confirmation step and Shopify line-item attributes.

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `VITE_SHOPIFY_DOMAIN` | `your-store.myshopify.com` |
| `VITE_SHOPIFY_ACCESS_TOKEN` | Storefront API access token (public) |
| `VITE_SHOPIFY_CLIENT_ID` | Shopify Headless app client ID |
| `VITE_SHOPIFY_ACCOUNT_DOMAIN` | Customer account domain |
| `VITE_SHOPIFY_REDIRECT_URI` | OAuth callback URL |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (safe for browser) |
