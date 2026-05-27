// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { optimizeShopifyImage } from '../components/lib/shopify';

const CDN_URL = 'https://cdn.shopify.com/s/files/1/0001/example/products/product.jpg';

describe('optimizeShopifyImage', () => {

  // ─── appends params ──────────────────────────────────────────────────────

  it('appends width and format params to a bare Shopify CDN URL', () => {
    const result = optimizeShopifyImage(CDN_URL, { width: 800, format: 'webp' });
    expect(result).toContain('width=800');
    expect(result).toContain('format=webp');
  });

  it('uses default width=800 and format=webp when no options given', () => {
    const result = optimizeShopifyImage(CDN_URL);
    expect(result).toContain('width=800');
    expect(result).toContain('format=webp');
  });

  it('accepts custom width and format overrides', () => {
    const result = optimizeShopifyImage(CDN_URL, { width: 400, format: 'jpg' });
    expect(result).toContain('width=400');
    expect(result).toContain('format=jpg');
  });

  // ─── existing query params ───────────────────────────────────────────────

  it('preserves pre-existing query params and appends width+format', () => {
    const urlWithParams = `${CDN_URL}?v=123`;
    const result = optimizeShopifyImage(urlWithParams, { width: 600 });
    expect(result).toContain('v=123');
    expect(result).toContain('width=600');
  });

  it('overwrites an existing width param rather than duplicating it', () => {
    const urlWithWidth = `${CDN_URL}?width=200`;
    const result = optimizeShopifyImage(urlWithWidth, { width: 800 });

    const params = new URLSearchParams(result.split('?')[1]);
    const widthValues = [...params.entries()]
      .filter(([k]) => k === 'width')
      .map(([, v]) => v);

    expect(widthValues).toHaveLength(1);
    expect(widthValues[0]).toBe('800');
  });

  // ─── passthrough for non-Shopify URLs ────────────────────────────────────

  it('returns the URL unchanged for a non-Shopify domain', () => {
    const externalUrl = 'https://example.com/image.jpg';
    expect(optimizeShopifyImage(externalUrl, { width: 400 })).toBe(externalUrl);
  });

  it('returns the URL unchanged for a relative path', () => {
    const relativeUrl = '/assets/hero.png';
    expect(optimizeShopifyImage(relativeUrl, { width: 400 })).toBe(relativeUrl);
  });

  // ─── edge cases ──────────────────────────────────────────────────────────

  it('returns null as-is (no crash)', () => {
    expect(optimizeShopifyImage(null)).toBeNull();
  });

  it('returns an empty string as-is', () => {
    expect(optimizeShopifyImage('')).toBe('');
  });

  it('returns undefined as-is', () => {
    expect(optimizeShopifyImage(undefined)).toBeUndefined();
  });

  // ─── output format ───────────────────────────────────────────────────────

  it('produces a valid URL that can be parsed by the URL constructor', () => {
    const result = optimizeShopifyImage(CDN_URL, { width: 800 });
    expect(() => new URL(result)).not.toThrow();
  });

  it('keeps the original base URL path intact', () => {
    const result = optimizeShopifyImage(CDN_URL, { width: 800 });
    expect(result.startsWith(CDN_URL.split('?')[0])).toBe(true);
  });
});
