# ASTÉRI Studio // Headless E-Commerce Storefront

A high-end, minimalist luxury e-commerce application built for ASTÉRI Studio, specializing in premium, handmade press-on nails. Designed to emulate a physical lookbook spread, this front-end storefront utilizes a decoupled headless architecture to map real-time inventory assets directly from a Shopify administrative backend engine via high-performance GraphQL pipelines.

---

## Technological Stack Matrix

| Architecture Layer | Technology Selected | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | React 18 // Vite | Ultra-fast Hot Module Replacement (HMR) & build compilation. |
| **Data Engine** | Shopify Storefront API | Decoupled headless content ingestion via raw GraphQL queries. |
| **Routing Layer** | React Router DOM v6 | Dynamic, client-side route tracking and parameter mapping. |
| **Security Layer** | DOMPurify // Cloudflare WAF | Double-layer validation shielding client views from injection vectors. |
| **Testing Harness** | Vitest // jsdom | Isolated, virtualized virtual-DOM regression verification suites. |
| **Hosting & CDN** | Vercel // Cloudflare Proxy | Serverless asset deployments with globally distributed edge caches. |

---

## Core Structural Architectural Features

### 1. First-Frame Viewport Layout Grid
* **Proportional Bounds:** Custom asymmetrically weighted desktop split grid (`1.15fr 1fr`) designed to lock critical pricing controls, configuration sizes, and checkout keys cleanly above the laptop screen fold line without forcing layout overflow scrolling.
* **Internal Gallery Tracks:** Fluid image scrollers using a strictly locked vertical `72vh` constraint track. Seamlessly overflows secondary assets internally while hiding default browser scroll track lines on desktop layers.
* **Adaptive Media Swaps:** Media query layers map and intercept background canvases, seamlessly re-proportioning layouts between landscape orientations and portrait formats (`Bg-mobile.png`, `Bg-video-mobile.png`) across viewports.

### 2. High-End Mobile Navigation Drawer
* **iOS Vector Patches:** Integrates an explicit internal target selector (`.mobile-action-icon svg`) forcing strict physical bounding constraints, permanently mitigating the infamous iOS Safari inline SVG vector layout collapse bug.
* **Integrated Session Auth:** Full-bleed interactive overlays featuring integrated, context-aware dashboard controls, dynamically updating layouts for profile operations or authentication states based on user sessions.

### 3. Smart IntersectionObserver Video Loops
* **Hardware Layer Performance:** Video showcase cards feature preloaded streaming hooks driven by a customized asynchronous `IntersectionObserver` instance loop. 
* **Battery & Data Conservation:** Automatically suspends background rendering and sleep cycles on media assets the moment they scroll past structural screen layout lines, lowering mobile data footprints and saving CPU execution cycles.

---

## Security Configuration Blueprint

This repository implements a rigorous Defense-in-Depth security layout, combining edge infrastructure firewalls with strict front-end rendering sanitization rules:

### 1. Web Application Firewall (Cloudflare WAF)
* **Automated Bot Filtering:** Evaluates edge access requests, isolating bad scraping scripts and credential-stuffing tools with non-intrusive Managed Challenges before they can probe client routes.
* **Path Traversal Blockers:** Custom regex logic blocks scanner bots searching for infrastructure weak points (e.g., matching expressions targeting `/.env`, `/.git`, or `/wp-admin`).

### 2. Response Security Headers (`vercel.json`)
Deploys explicit defensive security payload parameters directly into Vercel's global CDN delivery network layers:
* `X-Frame-Options: DENY`: Eradicates Clickjacking vulnerability exploits by blocking other domains from mounting the store inside invisible, malicious frame objects.
* `X-Content-Type-Options: nosniff`: Prevents browsers from analyzing raw streams, neutralizing text inputs trying to execute as cross-site script assets.

### 3. DOM-Level Sanitization (XSS Mitigation)
* Protects rich text descriptions piped directly from Shopify’s GraphQL dashboard using `dangerouslySetInnerHTML`.
* Data packets pass through `DOMPurify.sanitize()` prior to view updates, tracking down and dropping malicious inline tags or unauthorized script hooks while rendering text layouts perfectly.

---
