# AROM STUDIO — SEO Optimization Checklist

## Core Web Vitals

- [ ] LCP (Largest Contentful Paint) < 2.5 seconds
- [ ] FID (First Input Delay) < 100ms (or INP < 200ms)
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Total Blocking Time < 200ms
- [ ] First Contentful Paint < 1.8 seconds
- [ ] All images optimized (WebP/AVIF, compressed, responsive)
- [ ] Fonts preloaded with `rel="preload"`
- [ ] Critical CSS inlined
- [ ] JavaScript deferred with `defer` or `async`
- [ ] Lazy loading for below-fold images with `loading="lazy"`

## Accessibility

- [ ] WCAG 2.2 AA compliance
- [ ] Proper heading hierarchy (h1 → h6)
- [ ] Alt text on all images
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Screen reader friendly
- [ ] Form labels associated with inputs
- [ ] Skip navigation link
- [ ] Language attribute set on `<html>`

## Performance

- [ ] Lighthouse score ≥ 95 on all devices
- [ ] PageSpeed Insights score ≥ 90
- [ ] Image optimization (WebP, AVIF, responsive srcset)
- [ ] CSS and JS minified
- [ ] Code splitting implemented
- [ ] Bundle size monitored
- [ ] CDN configured (Cloudflare)
- [ ] Browser caching enabled
- [ ] Gzip/Brotli compression enabled
- [ ] Server response time < 200ms
- [ ] Third-party scripts minimized
- [ ] No render-blocking resources
- [ ] Font display swap configured

## Structured Data

- [ ] Organization schema (JSON-LD)
- [ ] WebSite schema with SearchAction
- [ ] LocalBusiness schema
- [ ] Person schema (founder)
- [ ] Service schemas (all services)
- [ ] FAQPage schema (FAQ page)
- [ ] BreadcrumbList schema
- [ ] Article schema (if blog present)
- [ ] Product schema (if e-commerce)
- [ ] Review schema (if testimonials)
- [ ] All schemas validated with Google Rich Results Test
- [ ] All schemas pass Schema.org validator
- [ ] JSON-LD uses `@id` references for entity linking

## Schema Validation

- [ ] Test all schemas at https://validator.schema.org/
- [ ] Test with Google Rich Results Test: https://search.google.com/test/rich-results
- [ ] Test with Google Merchant Center (if e-commerce)
- [ ] No schema errors or warnings
- [ ] All URLs in schemas are correct and accessible
- [ ] Prices and currencies correctly formatted
- [ ] No duplicate schema types on same page

## Indexability

- [ ] Site indexed in Google Search Console
- [ ] No `noindex` on important pages
- [ ] No `nofollow` on important internal links
- [ ] No canonical errors
- [ ] No duplicate content issues
- [ ] Crawl budget optimized
- [ ] Pagination implemented correctly (rel=next/prev if applicable)
- [ ] 404 page properly configured
- [ ] Redirect chain minimized
- [ ] No orphan pages (all pages linked internally)

## Canonicalization

- [ ] All pages have self-referencing canonical tags
- [ ] No missing canonical tags
- [ ] No conflicting canonical tags
- [ ] Trailing slash consistency
- [ ] WWW vs non-WWW resolved
- [ ] HTTP → HTTPS redirects work
- [ ] No parameter-based duplicate pages

## Internal Linking

- [ ] All important pages reachable within 3 clicks from homepage
- [ ] Navigation links use descriptive anchor text
- [ ] Footer links to important pages
- [ ] Contextual internal links in content
- [ ] Breadcrumb navigation on all pages
- [ ] City service pages linked from relevant sections
- [ ] Sitemap submitted to Google Search Console
- [ ] Internal links use relevant keywords
- [ ] No broken internal links
- [ ] No orphan pages

## Heading Structure

- [ ] Single `<h1>` per page
- [ ] `<h2>` for major sections
- [ ] `<h3>` and `<h4>` for subsections
- [ ] Headings contain relevant keywords
- [ ] Headings are descriptive and human-friendly
- [ ] No empty heading tags
- [ ] No skipping heading levels
- [ ] Heading hierarchy maintained on all pages

## Image SEO

- [ ] Descriptive file names (e.g., `arom-studio-business-website.jpg`)
- [ ] Alt text on all images
- [ ] Alt text includes keywords where relevant
- [ ] Images compressed and optimized
- [ ] WebP format used with fallback
- [ ] Responsive images with `srcset`
- [ ] Lazy loading for below-fold images
- [ ] Image dimensions specified (width/height)
- [ ] No broken image links
- [ ] Sitemap includes image locations (if many images)

## Security Headers

- [ ] Content Security Policy (CSP) configured
- [ ] HTTPS enforced (HSTS)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured
- [ ] No mixed content warnings
- [ ] SSL certificate valid and up-to-date

## Caching

- [ ] Browser caching configured (Cache-Control headers)
- [ ] Static assets cached (JS, CSS, images, fonts)
- [ ] HTML not cached (or short TTL)
- [ ] CDN caching configured
- [ ] ETags configured if needed
- [ ] Service worker for offline support (optional)

## Compression

- [ ] Brotli compression enabled (preferred)
- [ ] Gzip compression as fallback
- [ ] All text responses compressed (HTML, CSS, JS, JSON, SVG)

## Lazy Loading

- [ ] Images below fold use `loading="lazy"`
- [ ] Iframes use `loading="lazy"`
- [ ] Videos use lazy loading
- [ ] Offscreen content deferred
- [ ] No lazy loading on above-fold critical images

## JSON-LD Validation

- [ ] All JSON-LD is valid JSON
- [ ] No trailing commas
- [ ] All URLs are absolute
- [ ] `@context` is `https://schema.org`
- [ ] Entity references use `@id` correctly
- [ ] No circular references
- [ ] No duplicate `@id` values
- [ ] All required properties present for each type

## Rich Results Test

- [ ] Homepage: No errors, no warnings
- [ ] Services page: No errors
- [ ] Service detail pages: Rich results detected
- [ ] FAQ page: FAQ rich results detected
- [ ] Contact page: No errors
- [ ] City service pages: Rich results detected
- [ ] Check periodically for Google algorithm updates

## Monitoring

- [ ] Google Search Console daily monitoring
- [ ] Crawl errors checked weekly
- [ ] Index coverage report reviewed
- [ ] Performance report reviewed (Core Web Vitals)
- [ ] Sitemap status verified
- [ ] Manual URL inspection for key pages
- [ ] Google Analytics / alternative tracking active
- [ ] Rank tracking for target keywords
- [ ] Competitor monitoring (monthly)
- [ ] Algorithm update awareness

## Local SEO

- [ ] Google Business Profile created and verified
- [ ] NAP consistency across the web
- [ ] Local keywords in meta tags
- [ ] City-specific landing pages indexed
- [ ] Google Maps integration
- [ ] Local citations from relevant directories
