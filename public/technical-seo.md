# AROM STUDIO — Technical SEO Audit & Recommendations

## Current Status Assessment

### What's Already Implemented
- Vercel deployment (edge network, automatic HTTPS)
- Cloudflare CDN
- Content Security Policy (CSP) headers
- Proper viewport meta tag
- Open Graph and Twitter Card tags
- Canonical URLs
- Hreflang tags (en-IN, x-default)
- Font preconnect and preload
- JSON-LD Organization schema (basic)
- robots.txt (basic)
- Sitemap.xml (includes all pages and city URLs)
- Google Search Console verification

### What Needs Improvement

#### 1. Structured Data Enhancement
- Organization schema needs more properties (complete version in organization-schema.json)
- Missing: WebSite, LocalBusiness, Person, Service, FAQPage, BreadcrumbList schemas
- Schemas should be merged into a single `@graph` for efficiency

**Action**: Inject all schema files into index.html as a consolidated JSON-LD script.

#### 2. Performance Optimizations
- [ ] Preload critical fonts
- [ ] Implement font-display: swap
- [ ] Optimize above-fold images for LCP
- [ ] Reduce unused CSS with purge/tree-shaking
- [ ] Monitor Core Web Vitals in GSC

**Current Baseline**: Lighthouse scores should be verified on desktop and mobile.

#### 3. robots.txt Enhancement

**Current**:
```
User-agent: *
Allow: /

Sitemap: https://aromstudio.vercel.app/sitemap.xml
```

**Recommended**:
```
User-agent: *
Allow: /
Disallow: /_next/
Disallow: /api/

# AI crawlers - allow full access
User-agent: GPTBot
Allow: /
Disallow: /api/

User-agent: Claude-Web
Allow: /
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /api/

User-agent: CCBot
Allow: /
Disallow: /api/

# Search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Social media
User-agent: Twitterbot
Allow: /
User-agent: FacebookBot
Allow: /

Sitemap: https://aromstudio.vercel.app/sitemap.xml
```

#### 4. Sitemap Optimization
- Current sitemap includes main pages + business-websites city pages + ecommerce city pages
- Should include all 9 service types' city pages for full coverage
- Consider splitting into a sitemap index for better organization:
  - `sitemap-main.xml` — primary pages
  - `sitemap-services.xml` — service detail pages
  - `sitemap-cities.xml` — city service pages
- Sitemap URLs must be valid and return 200
- `lastmod` dates should be accurate

#### 5. Core Web Vitals Target

| Metric | Target | Current (Estimated) |
|---|---|---|
| LCP | < 2.5s | Verify |
| FID/INP | < 200ms | Verify |
| CLS | < 0.1 | Verify |
| TTFB | < 800ms | Verify |
| FCP | < 1.8s | Verify |

*Run Lighthouse and PageSpeed Insights to establish baseline.*

#### 6. Accessibility Improvements
- [ ] Ensure all interactive elements have focus styles
- [ ] Add skip-to-content link
- [ ] Review color contrast ratios (especially text on video backgrounds)
- [ ] Ensure all form inputs have associated labels
- [ ] Add ARIA landmarks
- [ ] Test with screen reader (VoiceOver, NVDA)

#### 7. Mobile Optimization
- [ ] Test touch target sizes (min 48x48px)
- [ ] Ensure no horizontal scrolling
- [ ] Font sizes at least 16px to prevent iOS zoom
- [ ] Test on real devices (iPhone, Android, iPad)

#### 8. Security
- [x] CSP headers configured
- [ ] HSTS header (Strict-Transport-Security)
- [ ] X-Content-Type-Options: nosniff
- [ ] Cross-origin resource sharing properly configured
- [ ] Regular dependency audits (npm audit)

## Implementation Priority

### P0 (Critical)
1. Inject consolidated JSON-LD schemas into index.html
2. Add HSTS and security headers
3. Verify Core Web Vitals with real user monitoring

### P1 (High)
4. Implement enhanced robots.txt
5. Optimize sitemap structure
6. Add skip-to-content link
7. Improve LCP (largest contentful paint)

### P2 (Medium)
8. Full accessibility audit and fixes
9. Image optimization pass
10. Mobile touch target audit

### P3 (Low)
11. Split sitemap into index structure
12. Add service worker for offline support
13. Implement link preloading for critical pages

## Monitoring Setup

### Google Search Console
- [ ] Domain property added: `aromstudio.vercel.app`
- [ ] Sitemap submitted and processed
- [ ] Verification file confirmed: `google03f2d7861492a6d6.html`

### Tools
- PageSpeed Insights: https://pagespeed.web.dev/
- Lighthouse CLI: `npx lighthouse https://aromstudio.vercel.app`
- Schema Validator: https://validator.schema.org/
- Rich Results Test: https://search.google.com/test/rich-results
- Ahrefs/Semrush for rank tracking (optional)

## Notes

- Vercel provides automatic HTTPS, CDN, and Brotli compression
- Cloudflare adds additional caching and DDoS protection
- The site is a single-page application (React/Next.js-style) routed via React Router
- City pages are discovered exclusively through the sitemap (no internal links)
- Consider adding a "Top Cities" section on services pages to create internal links to top city pages
