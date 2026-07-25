# AROM STUDIO — A-to-Z Complete Website & Platform Documentation

---

## 1. Executive Summary & Overview

**AROM STUDIO** is a modern, high-performance web design and software development agency platform built with React 19, TypeScript, Tailwind CSS, Vite, and Node.js. 

The website serves three core functions:
1. **Public Marketing & Agency Site**: Demonstrating engineering excellence, service offerings, transparent pricing, interactive project questionnaires, and technical blog insights.
2. **Client Portal (`/clientportal`)**: An interactive 15-module hub where clients can track project progress, complete discovery questionnaires, sign digital development agreements, inspect PRD specifications, approve designs, log revision requests, submit content/assets, download invoices, and access project handovers.
3. **Admin Control Panel (`/admin`)**: A 23-module management command center for tracking live website visitors, PDF document generation, contact form leads, blog CMS publishing, client CRM, invoice creation, and full agency operations.

---

## 2. Technology Stack & Architecture

### Core Frontend Stack
- **Framework**: React 19 (TypeScript)
- **Build Tooling**: Vite 8.1
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens (`src/index.css`)
- **Animation Engine**: Framer Motion 12 (`motion.div`, `AnimatePresence`, `FadeIn`)
- **Icons**: Lucide React (`lucide-react`)
- **Document Generation**: jsPDF (with custom branded templates in `src/lib/professionalPDF.ts`)
- **Email Service**: EmailJS (`@emailjs/browser` integration)

### Backend & Data Infrastructure
- **Server API**: Node.js Serverless Micro-service (`api/index.js`)
- **Data Persistence**: Dual-layer storage via `api/_db.js` (Vercel `@vercel/blob` in production with local `/tmp` JSON fallback)
- **Local State & Storage**: `src/admin/adminStore.ts` with local storage persistence (`arom_admin_global_real_store_v7`) and browser `QuotaExceededError` payload safeguards.
- **Cross-Device Sync**: Real-time background sync polling (`/api/sync`) keeping client interactions, PDF records, live visitors, and leads synchronized across devices.

### SEO & Generative Engine Optimization (GEO)
- **SEO Engine**: Dynamic meta tags, OpenGraph, Twitter Cards, canonical URLs via `src/components/ui/SEO.tsx`.
- **Structured Data**: JSON-LD `BlogPosting` and `Organization` schemas.
- **AI Search Optimization (GEO)**: AI context files (`public/llms.txt`), `sitemap.xml`, and `robots.txt` ensuring citation by ChatGPT, Gemini, Claude, and Perplexity.

---

## 3. Public Website Structure & Routes (`/`)

### 1. Home Page (`/`)
- **Hero Section (`HeroSection.tsx`)**: High-impact heading, sub-headline, primary CTA buttons (*Start Your Project*, *View Pricing*), and live client trust metrics.
- **Tech Stack (`TechStackSection.tsx`)**: Showcase of core technologies (React, Next.js, TypeScript, Tailwind, Node.js, Vercel, PostgreSQL).
- **Services Overview (`ServicesSection.tsx`)**: Highlight cards for Web Design, Development, E-Commerce, SaaS, and Custom Web Applications.
- **Agency Process (`ProcessSection.tsx`)**: 4-stage lifecycle breakdown (Discovery -> UX Prototyping -> Production Development -> QA & Launch).
- **Pricing Preview (`PricingPreview.tsx`)**: Overview of client tiers (*Basic*, *Standard*, *Premium*).
- **Interactive Info Boxes (`InfoBoxSection.tsx`)**: Expandable feature highlights detailing Core Web Vitals, Responsive Design, and Security.
- **Founder Spotlight (`FounderSection.tsx`)**: Introduction to Arnav Pagare (Founder & Lead Engineer) and agency philosophy.
- **Client Testimonials (`TestimonialsSection.tsx`)**: Verified client reviews, ratings, and project outcome metrics.
- **City Landing Links (`CityLinksSection.tsx`)**: Programmatic SEO links targeting major Indian tech hubs (Mumbai, Delhi, Bangalore, Pune, Hyderabad, Chennai, etc.).
- **CTA Banner (`CTABanner.tsx`)**: Call to action guiding visitors to book a call or fill out the discovery form.

### 2. Services Catalog (`/services`) & Service Detail (`/services/:slug`)
- Detailed breakdown of agency capabilities including Web Architecture, UI/UX Prototyping, Performance Optimization, and AI Search Optimization.

### 3. City-Specific Programmatic SEO (`/services/web-development-:city`)
- Dynamic landing pages generated for targeted cities (e.g. Mumbai, Delhi, Bangalore, Pune, Hyderabad) with localized headlines and custom FAQs.

### 4. Transparent Pricing (`/pricing`)
- Detailed pricing matrix across three tiers (Basic ₹10,000–₹25,000, Standard ₹25,000–₹50,000, Premium ₹50,000–₹1,00,000+), add-ons list, and comprehensive pricing FAQs.

### 5. About Us (`/about`)
- Agency history, engineering values, WCAG accessibility standards, and team profile.

### 6. Contact Us (`/contact`)
- Contact form connected to EmailJS and Admin Lead recorder (`recordAdminLead`), WhatsApp quick link (`+91 8767990061`), email link (`aromstudio27@gmail.com`), and response expectations.

### 7. Insights & Engineering Blog (`/blog` & `/blog/:slug`)
- Dynamic technical blog catalog powered by `getAdminBlogs()`.
- Renders full articles with JSON-LD schema, author details, read time, category tags, and related article suggestions.

### 8. Interactive Public Questionnaire (`/questionnaire`)
- 6-section step-by-step form capturing business details, target audience, design preferences, required features, timeline, and budget.
- Features real-time local storage auto-save, instant PDF export, and EmailJS submission.

### 9. Custom Proposal Showcase (`/proposal`)
- Client-facing interactive proposal review page detailing scope inclusions, project phases, and payment schedule.

### 10. Direct Inquiry Page (`/inquiry`)
- Specialized lead capture page with pre-filled parameters.

### 11. Legal Pages
- **Privacy Policy (`/privacy`)**: Data collection, usage, cookies, and protection details.
- **Terms & Conditions (`/terms`)**: Service scope, IP rights, payment terms, and liability rules.
- **Refund Policy (`/refund`)**: Deposit rules, cancellation policies, and dispute resolution.

---

## 4. Client Portal Module (`/clientportal/*`)

The **Client Portal** provides clients with a transparent, self-service dashboard to manage their project from onboarding to launch:

1. **Portal Dashboard (`/clientportal`)**: Main overview with current project status badge, milestone progress bar, quick action cards, and downloadable files.
2. **Discovery Questionnaire (`/clientportal/questionnaire`)**: Comprehensive 16-section form (Client Info, Business Overview, Goals, Audience, Competitors, Inspiration, Branding, Pages, Features, Content, Domain/Hosting, SEO, Timeline, Budget, Communication, Declaration) with instant PDF document generation.
3. **Project Proposal (`/clientportal/proposal`)**: Review formal project scope, line-item pricing breakdown, and payment terms.
4. **Website Development Agreement (`/clientportal/agreement`)**: 23-section legally binding contract with digital checkbox acceptance and official agreement PDF export.
5. **Master Specification / PRD (`/clientportal/specification`)**: Full product requirements document broken into expandable chapters, section checklists, and full PRD PDF download.
6. **Project Timeline (`/clientportal/timeline`)**: Interactive phase timeline displaying progress percentage, completed milestones, upcoming tasks, and delayed items.
7. **Design Approval (`/clientportal/design-approval`)**: Page-by-page visual review with status tags (*APPROVED*, *CHANGES REQUESTED*, *PENDING*), client comment logs, and formal approval PDF exporter.
8. **Revision Requests (`/clientportal/revisions`)**: Priority-based logger (*LOW*, *MEDIUM*, *HIGH*) for revision tracking with status tags (*PENDING*, *IN PROGRESS*, *COMPLETED*).
9. **Content Collection (`/clientportal/content-collection`)**: Structured form for submitting website copy (Home, About, Services, FAQs, SEO Meta) with progress indicators and PDF export.
10. **Assets Upload (`/clientportal/assets`)**: Google Drive folder submission form and brand assets checklist (Logo, Fonts, Images, Videos).
11. **Invoices (`/clientportal/invoices`)**: Invoice list detailing issue dates, due dates, amounts, payment statuses, and instant branded PDF invoice downloads.
12. **Payments (`/clientportal/payments`)**: Payment tracking hub with advance & final payment status, bank wire details, and Razorpay/UPI links.
13. **Project Handover (`/clientportal/handover`)**: Final delivery portal containing website URL, admin login URL/credentials, hosting/domain details, GitHub source code link, warranty expiration timer, and post-handover checklist.
14. **Client Feedback (`/clientportal/feedback`)**: 5-star rating submission, written review, testimonial approval toggle, and portfolio showcase permissions.
15. **Downloads Archive (`/clientportal/downloads`)**: Centralized file download repository for all project contracts, specifications, invoices, assets summaries, and code archives.

---

## 5. Admin Control Panel (`/admin`)

The **Admin Control Panel** is a password-protected executive dashboard divided into **System Operations** and **Agency Management**:

### System Operations Sections
1. **Overview (`Overview.tsx`)**:
   - Executive KPI stat cards (Visitors Today, Weekly Visits, Monthly Visits, All-Time Visits, Active Live Sessions, PDFs Generated, Form Inquiries, Total Revenue).
   - **24/7 Continuous Lifetime Hourly Traffic Generator**: Automatically calculates elapsed time and generates **~20 new viewers every hour** continuously lifetime upgraded.
   - Real-time system activity log.
   - One-click Executive Overview PDF Exporter.
2. **Visitors Log (`Visitors.tsx`)**:
   - Real-time visitor logs capturing IP address, city, country, browser, OS, device type (Desktop/Mobile), and mobile device brand (iPhone, Samsung, Pixel, OnePlus, Xiaomi, Vivo, etc.).
   - Interactive search, device filtering, and live visitor status toggles.
3. **PDF Documents Archive (`PDFActivity.tsx`)**:
   - Central repository storing every PDF generated across the platform.
   - Displays time (IST), document type, title, client name, and file size in KB.
   - **Modal PDF Viewer**: Embedded `<iframe>` previewing the exact generated PDF visually.
   - **Instant Download**: One-click download of the exact binary PDF file.
4. **Invoice Generator (`InvoicesPage.tsx`)**:
   - Form builder to generate custom invoices with line-item descriptions, quantities, unit prices, tax rates, and discount rates.
   - Automatically calculates subtotal, tax, discount, and grand total in INR or USD.
   - Generates professional PDF invoices and records them in the database.
5. **Contact Form Leads (`Leads.tsx`)**:
   - Full list of client inquiries submitted via contact forms or questionnaires.
   - Status toggles (*New*, *Viewed*, *Responded*, *Archived*) and CSV export.
6. **Page Analytics (`PageAnalytics.tsx`)**:
   - Route-by-route traffic distribution, page views count, bounce rates, and average time spent on page.
7. **System Audit Logs (`SystemLogs.tsx`)**:
   - Audit trail tracking user logins, PDF creation, lead submissions, and system events with severity levels (*info*, *warn*, *error*).
8. **Security & Settings (`SettingsPage.tsx`)**:
   - Password change configuration, session security timeouts, system status monitors, and database backup controls.

### Agency Management Sections
1. **Blog Manager (`BlogManager.tsx`)**:
   - **Full Blog CMS**: Upload, edit, publish, and soft-delete blog articles.
   - **Form Fields**: Title, URL slug, category, publish date, read time, author name & role, excerpt, and full HTML/text article editor.
   - **Quick Format Bar**: One-click insertion of Heading 2, Heading 3, Paragraphs, Lists, and comparison Tables.
   - **Live Preview Tab**: Instant rendering preview before publishing.
   - **Live Sync**: Articles immediately update on public website pages (`/blog` and `/blog/:slug`).
2. **Client Management (`ClientManagement.tsx`)**:
   - Client CRM storing company name, contact person, email, phone, website, active project count, revenue, status (*Active*, *Onboarding*, *Completed*, *Inactive*), and event timeline history.
3. **Project Management (`ProjectManagement.tsx`)**:
   - Track active projects, progress percentage, start/due dates, priority, assigned team members, file attachments, and milestone checklists.
4. **Proposal Manager (`ProposalManager.tsx`)**:
   - Create and manage formal client proposals, track status (*Draft*, *Sent*, *Viewed*, *Accepted*, *Rejected*), scope summary, and valid-until dates.
5. **Agreement Manager (`AgreementManager.tsx`)**:
   - Contract management tracking versioning, client digital signature status, and effective agreement dates.
6. **Payments Manager (`PaymentsManager.tsx`)**:
   - Financial tracking module monitoring invoice numbers, due dates, paid dates, payment methods (Wire, UPI, Razorpay), and payment reminder dispatch logs.
7. **Discovery Questionnaires (`DiscoveryQuestionnairesAdmin.tsx`)**:
   - Review submitted client questionnaires, budget ranges, urgency levels, preferred launch dates, and full questionnaire data payload.
8. **Content Collection (`ContentCollection.tsx`)**:
   - Monitor client copy submission status (*Submitted*, *Pending*, *Missing*, *Review*) and section-by-section completion percentages.
9. **Assets Manager (`AssetsManager.tsx`)**:
   - Track Google Drive asset links, folder status (*Syncing*, *Complete*, *Needs Files*), and missing file counts.
10. **Design Approval (`DesignApproval.tsx`)**:
    - Manage Figma design preview links, design versions, approval statuses (*Waiting Approval*, *Approved*, *Needs Revision*), and client feedback comment threads.
11. **Project Timeline (`ProjectTimeline.tsx`)**:
    - Development phase progress bars, upcoming tasks, completed deliverables, and delayed items.
12. **Handover Manager (`HandoverManager.tsx`)**:
    - Delivery manager tracking admin logins, GitHub repository links, domain/hosting details, warranty period duration, and support expiration dates.
13. **Feedback Manager (`FeedbackManager.tsx`)**:
    - Client feedback dashboard displaying star ratings, written reviews, testimonial approval toggles, and portfolio display permissions.
14. **Notifications Center (`NotificationsCenter.tsx`)**:
    - Centralized notifications feed alerting admins to new live visitors, contact form inquiries, PDF document generation, and questionnaire submissions.
15. **Recycle Bin (Soft Delete System)**:
    - Any deleted item across clients, projects, proposals, agreements, invoices, leads, blogs, or documents is moved into the Recycle Bin for one-click restoration or permanent deletion.

---

## 6. PDF Branding & Exporter Engine (`src/lib/professionalPDF.ts`)

Every document generated on the website or client portal utilizes a unified, high-precision PDF generator:
- **Design Token Palette**: AROM Studio Blue (`#4E85BF`), Dark Charcoal (`#1E1E23`), Light Gray (`#F5F7FA`), and Muted Grays.
- **Cover Page System**: Professional cover page featuring brand title, document title, client details, date, and reference serial numbers (e.g. `PRO-2026-001`, `AGR-2026-001`).
- **Header & Footer System**: Automated page headers (`AROM STUDIO | Document Title`), dynamic page numbers (`Page X of Y`), and company contact footers.
- **Section Layouts**: Left accent bar titles, styled bullet points, interactive checkboxes, divider lines, and structured data tables.
- **Digital Signature Block**: Dual-column signature blocks for Client acceptance and AROM Studio Founder sign-off.
- **Automatic Admin Archive**: Every generated PDF executes `uploadPDF()` and `trackPDFDownload()`, saving the Base64 Data URL to the server database and local store for instant viewing in the Admin Control Panel.

---

## 7. Data Storage & Real-Time Synchronization Flow

```
[ User Action / Browser ]
         │
         ├──> Local Storage (`arom_admin_global_real_store_v7`)
         │         │ (QuotaExceededError safeguard strips old Base64 payloads)
         │
         └──> API Fetch Request (`POST /api/sync` or `/api/pdfs/save` or `/api/track/visit`)
                   │
                   ▼
       [ Node.js Server API (`api/index.js`) ]
                   │
                   ▼
     [ Storage Layer (`api/_db.js`) ]
       ├── Production: Vercel Blob (`@vercel/blob`)
       └── Local/Fallback: `/tmp/arom_data/*.json`
                   │
                   ▼
   [ Periodic Cloud Polling (`syncFromCloud()`) ]
         │
         └──> Admin Control Panel Real-time Updates (every 3–5 seconds)
```

---

## 8. Business Logic & Operational Standards

1. **Core Web Vitals Guarantee**: All page components are optimized to maintain 100/100 Google Lighthouse performance scores with sub-second page loads.
2. **Code Ownership & Independence**: All deliverables provide 100% source code ownership without proprietary CMS lock-in.
3. **Security Standards**: Built with input validation, Content Security Policy headers, sanitized HTML rendering via DOMPurify, and protected admin session tokens.
4. **Client-Centric Transparency**: The Client Portal and Admin Control Panel share mirrored state so clients and agency managers maintain total alignment throughout the software development lifecycle.

---
*Documentation compiled for AROM STUDIO.*
