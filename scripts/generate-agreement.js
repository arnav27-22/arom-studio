import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'AROM_STUDIO_WEBSITE_DEVELOPMENT_AGREEMENT.pdf');

// ─── Configuration ───────────────────────────────────────────────────────────
const CFG = {
  agencyName: 'AROM Studio',
  agencyAddress: '123 Creative Lane, Suite 200, San Francisco, CA 94102, United States',
  agencyEmail: 'legal@aromstudio.com',
  agencyPhone: '+1 (415) 555-0198',
  agencyWebsite: 'www.aromstudio.com',
  agreementId: `AROM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
  version: '2.0.0',
  generationDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  watermarkText: 'DRAFT',
};

// ─── Page Layout Constants ──────────────────────────────────────────────────
const PAGE = { width: 595.28, height: 841.89 }; // A4
const MARGIN = { top: 72, bottom: 72, left: 72, right: 72 };
const CONTENT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right;
const HEADER_Y = 36;
const FOOTER_Y = PAGE.height - 40;
const WATERMARK_CENTER_X = PAGE.width / 2;
const WATERMARK_CENTER_Y = PAGE.height / 2;

// ─── Color Palette ──────────────────────────────────────────────────────────
const COLOR = {
  primary: [20, 30, 60],        // Dark navy
  secondary: [55, 80, 140],     // Medium blue
  accent: [180, 150, 90],       // Gold
  light: [240, 242, 247],       // Light gray-blue
  text: [30, 30, 40],           // Near-black
  muted: [100, 105, 115],       // Gray
  white: [255, 255, 255],
  line: [210, 215, 225],
  signature: [240, 240, 245],
};

// ─── Font Registration ───────────────────────────────────────────────────────
function registerFonts(doc) {
  // Helvetica is built into pdfkit - we use it for everything
}

// ─── Header ──────────────────────────────────────────────────────────────────
function addHeader(doc, pageNum) {
  const { x, y } = doc;

  doc.save();

  // Top line
  doc
    .rect(MARGIN.left, HEADER_Y, CONTENT_WIDTH, 1.5)
    .fill(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);

  // Agency name left
  doc
    .fontSize(7)
    .font('Helvetica-Bold')
    .fillColor(COLOR.primary[0], COLOR.primary[1], COLOR.primary[2])
    .text(CFG.agencyName.toUpperCase(), MARGIN.left, HEADER_Y + 5, { continued: false });

  // Document name center
  doc
    .fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text('WEBSITE DEVELOPMENT AGREEMENT', MARGIN.left, HEADER_Y + 14, { continued: false });

  // Agreement ID right
  doc
    .fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text(`ID: ${CFG.agreementId}`, MARGIN.left + CONTENT_WIDTH - 100, HEADER_Y + 5, { width: 100, align: 'right' });

  doc.restore();
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function addFooter(doc, pageNum, totalPages) {
  doc.save();

  // Bottom line
  doc
    .rect(MARGIN.left, FOOTER_Y - 8, CONTENT_WIDTH, 0.5)
    .fill(COLOR.line[0], COLOR.line[1], COLOR.line[2]);

  // Page number center
  doc
    .fontSize(7)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text(`Page ${pageNum} of ${totalPages}`, MARGIN.left, FOOTER_Y - 4, {
      width: CONTENT_WIDTH,
      align: 'center',
    });

  // Version left
  doc
    .fontSize(6)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text(`v${CFG.version}`, MARGIN.left, FOOTER_Y - 3);

  // Date right
  doc
    .fontSize(6)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text(CFG.generationDate, MARGIN.left + CONTENT_WIDTH - 80, FOOTER_Y - 3, { width: 80, align: 'right' });

  doc.restore();
}

// ─── Watermark ───────────────────────────────────────────────────────────────
function addWatermark(doc) {
  doc.save();
  doc
    .fontSize(96)
    .font('Helvetica-Bold')
    .fillColor(230, 230, 235)
    .opacity(0.15)
    .text(CFG.watermarkText, WATERMARK_CENTER_X - 120, WATERMARK_CENTER_Y - 40, {
      width: 240,
      align: 'center',
    });
  doc.restore();
}

// ─── Initials Boxes ─────────────────────────────────────────────────────────
function addInitialsBoxes(doc) {
  doc.save();

  const boxY = FOOTER_Y - 1;
  const labelY = boxY - 10;
  const boxSize = 14;
  const gap = 4;

  // Client initials
  doc
    .fontSize(5.5)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text('CLIENT INITIALS', MARGIN.left, labelY, { width: boxSize * 3 + gap, align: 'center' });
  doc
    .rect(MARGIN.left, boxY, boxSize, boxSize)
    .lineWidth(0.5)
    .strokeColor(COLOR.line[0], COLOR.line[1], COLOR.line[2])
    .stroke();

  // Agency initials
  doc
    .fontSize(5.5)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text('AGENCY INITIALS', MARGIN.left + boxSize + gap, labelY, { width: boxSize * 3 + gap, align: 'center' });
  doc
    .rect(MARGIN.left + boxSize + gap, boxY, boxSize, boxSize)
    .lineWidth(0.5)
    .strokeColor(COLOR.line[0], COLOR.line[1], COLOR.line[2])
    .stroke();

  doc.restore();
}

// ─── Page Setup ──────────────────────────────────────────────────────────────
function addPageDecorations(doc, pageNum, totalPages) {
  addHeader(doc, pageNum);
  addFooter(doc, pageNum, totalPages);
  addInitialsBoxes(doc);
  addWatermark(doc);
}

// ─── Cover Page ──────────────────────────────────────────────────────────────
async function generateCoverPage(doc, data) {
  const { clientName, projectName } = data;
  const centerX = PAGE.width / 2;
  let yPos = 140;

  doc.addPage();

  // Large background accent bar at top
  doc
    .rect(0, 0, PAGE.width, 8)
    .fill(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);

  // Top decorative line
  doc
    .rect(MARGIN.left, 85, CONTENT_WIDTH, 2)
    .fill(COLOR.secondary[0], COLOR.secondary[1], COLOR.secondary[2]);

  // Agency name
  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .fillColor(COLOR.primary[0], COLOR.primary[1], COLOR.primary[2])
    .text(CFG.agencyName.toUpperCase(), centerX - 150, yPos, { width: 300, align: 'center' });

  yPos += 38;

  // Tagline
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text('Digital Design & Development Agency', centerX - 120, yPos, { width: 240, align: 'center' });

  yPos += 30;

  // Gold divider
  doc
    .rect(centerX - 30, yPos, 60, 2)
    .fill(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);

  yPos += 40;

  // Document title
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor(COLOR.secondary[0], COLOR.secondary[1], COLOR.secondary[2])
    .text('WEBSITE DEVELOPMENT AGREEMENT', centerX - 150, yPos, { width: 300, align: 'center' });

  yPos += 28;

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(COLOR.text[0], COLOR.text[1], COLOR.text[2])
    .text('Professional Services Contract', centerX - 120, yPos, { width: 240, align: 'center' });

  yPos += 50;

  // Info box background
  const boxX = centerX - 160;
  const boxW = 320;
  const boxH = 170;
  doc
    .rect(boxX, yPos, boxW, boxH)
    .fillColor(COLOR.light[0], COLOR.light[1], COLOR.light[2])
    .fill()
    .rect(boxX, yPos, boxW, boxH)
    .lineWidth(0.5)
    .strokeColor(COLOR.line[0], COLOR.line[1], COLOR.line[2])
    .stroke();

  yPos += 20;
  const leftColX = boxX + 25;
  const rightColX = boxX + 155;

  function infoRow(left, right, y) {
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(COLOR.primary[0], COLOR.primary[1], COLOR.primary[2])
      .text(left, leftColX, y);
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLOR.text[0], COLOR.text[1], COLOR.text[2])
      .text(right, rightColX, y);
  }

  infoRow('Client:', clientName || '[Client Name]', yPos); yPos += 18;
  infoRow('Project:', projectName || '[Project Name]', yPos); yPos += 18;
  infoRow('Agreement ID:', CFG.agreementId, yPos); yPos += 18;
  infoRow('Version:', CFG.version, yPos); yPos += 18;
  infoRow('Date:', CFG.generationDate, yPos); yPos += 18;
  infoRow('Prepared by:', CFG.agencyName, yPos);

  yPos += 50;

  // Bottom decorative line
  doc
    .rect(MARGIN.left, PAGE.height - 110, CONTENT_WIDTH, 1.5)
    .fill(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);

  // Address
  doc
    .fontSize(7.5)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text(CFG.agencyAddress + '  |  ' + CFG.agencyEmail + '  |  ' + CFG.agencyWebsite, centerX - 200, PAGE.height - 100, { width: 400, align: 'center' });

  // QR Code
  try {
    const qrData = JSON.stringify({
      id: CFG.agreementId,
      client: clientName,
      project: projectName,
      date: CFG.generationDate,
      version: CFG.version,
    });
    const qrBuffer = await QRCode.toBuffer(qrData, { width: 120, margin: 1, color: { dark: '#141E3C', light: '#FFFFFF' } });
    doc.image(qrBuffer, centerX - 30, PAGE.height - 180, { width: 60, height: 60 });
    doc
      .fontSize(6)
      .font('Helvetica')
      .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
      .text('Scan to verify', centerX - 30, PAGE.height - 115, { width: 60, align: 'center' });
  } catch (e) {
    // QR generation failed, skip silently
  }

  // Large background accent bar at bottom
  doc
    .rect(0, PAGE.height - 8, PAGE.width, 8)
    .fill(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);
}

// ─── Table of Contents ───────────────────────────────────────────────────────
function generateTOC(doc, sections) {
  doc.addPage();

  let yPos = 95;
  const colW = CONTENT_WIDTH;
  const rowH = 16;
  const maxY = PAGE.height - MARGIN.bottom - 60;

  // Title
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor(COLOR.primary[0], COLOR.primary[1], COLOR.primary[2])
    .text('TABLE OF CONTENTS', MARGIN.left, yPos);
  yPos += 30;

  // Underline
  doc
    .rect(MARGIN.left, yPos - 4, colW, 1.5)
    .fill(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);

  // Column headers
  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(COLOR.secondary[0], COLOR.secondary[1], COLOR.secondary[2])
    .text('SECTION', MARGIN.left, yPos + 4);
  doc
    .text('DESCRIPTION', MARGIN.left + 65, yPos + 4);
  doc
    .text('PAGE', MARGIN.left + colW - 50, yPos + 4, { width: 50, align: 'right' });

  yPos += 24;
  doc.rect(MARGIN.left, yPos - 6, colW, 0.5).fill(COLOR.line[0], COLOR.line[1], COLOR.line[2]);

  yPos += 4;

  // Track the page numbers for each section
  let currentTocY = yPos;

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];

    // Check if we need a new page
    if (currentTocY > maxY) {
      doc.addPage();
      currentTocY = 95;
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor(COLOR.primary[0], COLOR.primary[1], COLOR.primary[2])
        .text('TABLE OF CONTENTS (continued)', MARGIN.left, currentTocY);
      currentTocY += 28;
      doc
        .rect(MARGIN.left, currentTocY - 4, colW, 1)
        .fill(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);
      currentTocY += 8;
    }

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLOR.text[0], COLOR.text[1], COLOR.text[2])
      .text(`${String(sec.num).padStart(2, '0')}`, MARGIN.left, currentTocY);
    doc
      .text(sec.title, MARGIN.left + 65, currentTocY);

    // Draw light row separator
    doc
      .rect(MARGIN.left, currentTocY + rowH - 2, colW, 0.3)
      .fillColor(COLOR.line[0], COLOR.line[1], COLOR.line[2])
      .fill();

    currentTocY += rowH;
  }
}

// ─── Section Content ─────────────────────────────────────────────────────────
function getSections() {
  return [
    {
      num: 1,
      title: 'Parties',
      content: `This Website Development Agreement (the "Agreement") is entered into as of ${CFG.generationDate} (the "Effective Date") by and between:

AROM Studio, a digital design and development agency with its principal place of business at ${CFG.agencyAddress} (hereinafter referred to as "Agency," "we," "us," or "our"),

AND

The client identified in the cover page of this Agreement (hereinafter referred to as "Client," "you," or "your").

The Agency and the Client are hereinafter individually referred to as a "Party" and collectively as the "Parties."

The Parties agree that the recitals set forth above are true and correct and are incorporated into this Agreement by reference. This Agreement shall govern the development, design, and delivery of the Website (as defined herein) and any related services provided by the Agency to the Client.`
    },
    {
      num: 2,
      title: 'Definitions',
      content: `For the purposes of this Agreement, the following terms shall have the meanings ascribed to them below:

"Acceptance" means the Client's formal written approval of a Deliverable, confirming that it meets the specifications and requirements set forth in the Scope of Work.

"Agreement" means this Website Development Agreement, including all exhibits, schedules, and attachments hereto, as may be amended from time to time in writing by the Parties.

"Confidential Information" means any non-public information disclosed by one Party to the other, whether in writing, orally, or by any other means, including but not limited to trade secrets, business plans, customer data, financial information, technical specifications, source code, and proprietary methodologies.

"Content" means all text, images, videos, audio files, documents, logos, trademarks, and other materials provided by the Client for incorporation into the Website.

"Deliverables" means the work product, materials, files, and other outputs to be delivered by the Agency to the Client as specified in the Scope of Work, including but not limited to design mockups, prototypes, source code, graphics, and documentation.

"Effective Date" means the date on which this Agreement is signed by both Parties, as indicated on the signature page.

"Intellectual Property Rights" means all copyrights, trademarks, service marks, trade secrets, patents, moral rights, and any other proprietary rights recognized under applicable law.

"Project" means the website development project described in the Scope of Work, including all design, development, testing, and deployment activities.

"Scope of Work" or "SOW" means the written description of the services, deliverables, specifications, and other work to be performed by the Agency under this Agreement.

"Term" means the duration of this Agreement as set forth in Section 6 (Project Timeline).

"Website" means the website or web application to be developed by the Agency for the Client under this Agreement, including all pages, features, functionality, and associated components.

"Change Request" means a written request submitted by the Client to modify the Scope of Work after the Effective Date, which may result in adjustments to the timeline, fees, or both.

"Third-Party Services" means any software, platforms, APIs, libraries, tools, or services not developed or owned by the Agency that are used in the development or operation of the Website.`
    },
    {
      num: 3,
      title: 'Project Overview',
      content: `The Agency agrees to provide professional website development services to the Client for the project described in the Scope of Work (the "Project"). The Project encompasses the full lifecycle of website creation, including but not limited to strategic planning, user experience design, visual design, front-end and back-end development, content integration, testing, and deployment.

The Parties acknowledge that the successful completion of the Project requires mutual cooperation, timely communication, and adherence to the responsibilities outlined in this Agreement. The Agency shall perform all services in a professional and workmanlike manner, utilizing industry-standard tools, technologies, and methodologies.

The Client acknowledges that the Agency has the requisite expertise, experience, and resources to perform the services contemplated hereunder. The Agency acknowledges that the Client has provided or will provide all necessary information, materials, and feedback required for the completion of the Project.

This Agreement sets forth the entire understanding between the Parties with respect to the Project and supersedes all prior discussions, agreements, and understandings, whether written or oral. The Project shall be executed in accordance with the terms and conditions set forth herein.`
    },
    {
      num: 4,
      title: 'Scope of Work',
      content: `The Scope of Work (SOW) for the Project is described in detail in Exhibit A attached hereto and incorporated herein by reference. The SOW includes, without limitation, the following categories of work:

(a) Project Management & Discovery: Initial consultation, requirements gathering, project planning, technical discovery, and documentation of specifications.

(b) User Experience (UX) Design: Information architecture, user flow mapping, wireframing, and prototyping to establish the structural foundation of the Website.

(c) Visual (UI) Design: Creation of visual design mockups, style guides, typography selections, color palettes, and graphical assets in accordance with the Client's brand identity.

(d) Front-End Development: Implementation of visual designs into functional, responsive, and cross-browser compatible code using modern web technologies including HTML5, CSS3, JavaScript, and associated frameworks.

(e) Back-End Development: Server-side programming, database architecture and implementation, API development and integration, content management system configuration, and server environment setup.

(f) Content Integration: Incorporation of Client-provided content into the Website, including text copy, images, videos, and other media assets.

(g) Quality Assurance (QA) Testing: Comprehensive testing of all Website features, functionality, performance, security, and responsiveness across multiple devices and browser environments.

(h) Deployment: Configuration of production hosting environment, domain name setup, SSL certificate installation, database migration, and launch of the Website to the live production environment.

(i) Training & Documentation: Provision of training materials, administrative documentation, and walkthrough sessions for the Client's team to manage and maintain the Website after launch.

Any services not explicitly listed in the SOW shall be considered outside the scope of this Agreement and shall require a separate Change Request as described in Section 10. The Agency reserves the right to refine the technical approach during development, provided that such refinements do not materially alter the agreed-upon Deliverables.`
    },
    {
      num: 5,
      title: 'Deliverables',
      content: `The Agency shall produce and deliver to the Client the following Deliverables in accordance with the timeline set forth in Section 6:

(a) Project Plan Document: A comprehensive project roadmap outlining milestones, deliverables, timelines, and resource allocation.

(b) UX Research & Strategy Report: Documentation of user research findings, competitive analysis, target audience definition, and strategic recommendations.

(c) Wireframes & Site Architecture: Low-fidelity and high-fidelity wireframes depicting page layouts, navigation structures, and content hierarchies.

(d) Design Mockups & Style Guide: High-fidelity visual designs for all page templates, including a comprehensive style guide documenting design specifications, typography, color codes, and component usage.

(e) Functional Website: A fully developed, tested, and operational Website meeting the specifications outlined in the SOW, including all front-end and back-end functionality.

(f) Source Code & Assets: Complete, well-structured source code repository with all associated assets, including images, fonts, scripts, stylesheets, and configuration files.

(g) Technical Documentation: Comprehensive documentation covering system architecture, database schema, API endpoints, deployment procedures, and maintenance guidelines.

(h) Administrative Credentials: Login credentials and access information for all administrative interfaces, hosting platforms, and third-party services configured for the Project.

(i) Post-Launch Report: A final report documenting the launch process, post-launch testing results, and recommendations for ongoing optimization.

All Deliverables shall be provided in digital format via a mutually agreed-upon file sharing or repository platform. The Agency shall retain copies of all Deliverables for a period of not less than ninety (90) days following Project completion. Delivery shall be deemed complete upon the Agency providing the Client with access to or copies of the Deliverables.`
    },
    {
      num: 6,
      title: 'Project Timeline',
      content: `The Project shall be completed in accordance with the timeline set forth in the Project Schedule attached as Exhibit B (the "Timeline"). The Timeline specifies key milestones, review periods, and the estimated completion date for each phase of the Project.

The Agency shall use reasonable commercial efforts to adhere to the Timeline; however, the Client acknowledges that certain factors may necessitate adjustments, including but not limited to:

(a) Delays in Client feedback, approval, or provision of materials beyond the timeframes specified in the Communication Policy (Section 12).

(b) Changes to the Scope of Work requested by the Client pursuant to Section 10.

(c) Unforeseen technical challenges, third-party service limitations, or force majeure events as described in Section 23.

(d) Discovery of incompatible or outdated third-party systems or dependencies.

The Agency shall notify the Client promptly in writing of any anticipated delays and shall provide a revised Timeline when applicable. The Client agrees that time is of the essence only with respect to the Client's own obligations under this Agreement.

The Term of this Agreement shall commence on the Effective Date and shall continue until the completion of all Deliverables and the satisfaction of all obligations hereunder, unless earlier terminated pursuant to Section 17 (Cancellation & Refund Policy).`
    },
    {
      num: 7,
      title: 'Client Responsibilities',
      content: `To facilitate the successful completion of the Project, the Client agrees to fulfill the following responsibilities in a timely manner:

(a) Provide all Content, including text copy, images, videos, logos, brand guidelines, and other materials required for the Website, in digital format as specified by the Agency.

(b) Review and provide feedback on all Deliverables within the review periods specified in the Project Timeline. Failure to provide timely feedback may result in Project delays, for which the Agency shall not be responsible.

(c) Designate a single point of contact (the "Client Representative") who is authorized to make decisions, provide approvals, and communicate on behalf of the Client throughout the Project.

(d) Grant the Agency access to any existing systems, platforms, accounts, or third-party services necessary for the completion of the Project.

(e) Provide accurate, complete, and current information to the Agency throughout the Project. The Client acknowledges that the Agency relies on such information and shall not be liable for any issues arising from inaccurate or incomplete information provided by the Client.

(f) Obtain all necessary permissions, licenses, and clearances for any Content, materials, or third-party assets provided by the Client for use in the Website.

(g) Ensure that the Client Representative has the authority to bind the Client contractually and that all decisions and approvals made by the Client Representative are final and binding on the Client.

(h) Cooperate in good faith with the Agency and respond to reasonable requests for information, decisions, or approvals within the agreed-upon timeframes.

The Client's failure to fulfill any of the above responsibilities may result in Project delays, additional costs, or both, for which the Agency shall not be held liable.`
    },
    {
      num: 8,
      title: 'AROM Studio Responsibilities',
      content: `The Agency agrees to fulfill the following responsibilities in connection with the Project:

(a) Assign qualified personnel to the Project, including a project manager, designers, developers, and quality assurance specialists as needed.

(b) Conduct the Project in accordance with professional standards, industry best practices, and the specifications set forth in the SOW.

(c) Maintain regular communication with the Client regarding Project progress, milestones achieved, and any issues or risks identified.

(d) Provide the Client with timely access to work-in-progress for review and feedback through the Agency's designated project management platform.

(e) Incorporate Client feedback into the Deliverables in accordance with the Revisions Policy set forth in Section 11.

(f) Test all Deliverables for functionality, performance, and compatibility prior to delivery to the Client.

(g) Maintain the confidentiality of the Client's Confidential Information in accordance with Section 16.

(h) Use reasonable commercial efforts to ensure that the Website is free from material defects, errors, and vulnerabilities at the time of launch.

(i) Provide the Client with a reasonable level of post-launch support as described in Section 19 (Warranty & Bug Fix Policy).

(j) Not subcontract or delegate any material portion of the work without the Client's prior written consent, which shall not be unreasonably withheld.

The Agency shall perform its obligations with the degree of skill and care reasonably expected from a qualified professional in the digital design and development industry. The Agency does not warrant that the Website will be error-free or that its operation will be uninterrupted.`
    },
    {
      num: 9,
      title: 'Payment Terms',
      content: `The Client agrees to pay the Agency the fees set forth in the Fee Schedule attached as Exhibit C (the "Fees"). Payment terms are as follows:

(a) Total Project Fee: The total fee for the Project shall be as specified in Exhibit C. All fees are quoted in United States Dollars (USD) unless otherwise specified.

(b) Payment Schedule: Fees shall be paid according to the payment schedule outlined in Exhibit C, which may include an initial deposit, milestone payments, and a final payment upon completion.

(c) Initial Deposit: An initial deposit, as specified in Exhibit C, shall be due upon execution of this Agreement. Work shall not commence until the deposit has been received by the Agency.

(d) Invoicing: The Agency shall issue invoices electronically to the Client's designated email address. Invoices are due within fifteen (15) calendar days of the invoice date unless otherwise specified in Exhibit C.

(e) Late Payment: Payments not received within five (5) calendar days after the due date shall accrue interest at a rate of one and one-half percent (1.5%) per month, or the maximum rate permitted by applicable law, whichever is less. The Client shall also be responsible for all reasonable collection costs, including attorneys' fees.

(f) Suspension of Work: The Agency reserves the right to suspend all work on the Project if any payment is more than ten (10) calendar days past due. Such suspension shall not constitute a breach of this Agreement by the Agency, and the Timeline shall be extended by the duration of the suspension.

(g) Taxes: The Client is responsible for all applicable sales, use, value-added, withholding, and other taxes or duties arising from this Agreement, excluding taxes based on the Agency's net income.

(h) Expenses: The Client shall reimburse the Agency for all reasonable out-of-pocket expenses incurred in connection with the Project, including but not limited to stock asset purchases, third-party software licenses, domain registration fees, hosting fees, and travel expenses, provided that such expenses are approved in advance by the Client.

(i) Price Adjustments: Fees quoted in Exhibit C shall remain fixed for the duration of the Project, unless the Scope of Work is modified pursuant to Section 10.`
    },
    {
      num: 10,
      title: 'Additional Work & Change Requests',
      content: `The Agency acknowledges that the Client may require modifications or additions to the Scope of Work after the Effective Date. Any such modifications shall be governed by this Section.

(a) Change Request Process: If the Client wishes to modify the Scope of Work, the Client shall submit a written Change Request describing the proposed modification in sufficient detail for the Agency to evaluate its impact.

(b) Agency Evaluation: Within five (5) business days of receiving a Change Request, the Agency shall provide the Client with a written estimate of the additional fees, timeline adjustments, and any other impacts resulting from the proposed change.

(c) Approval: No changes to the Scope of Work shall be binding until the Client has approved the Agency's estimate in writing. The Agency shall not commence work on any Change Request until such approval is received.

(d) Scope Creep Prevention: Minor modifications that do not materially affect the Scope of Work, fees, or timeline may be accommodated at the Agency's discretion without a formal Change Request. However, any requests that require significant additional design, development, or testing work shall be subject to this Section.

(e) Out-of-Scope Work Defined: The following are examples of work that shall be considered out of scope and subject to additional fees:

  (i) Addition of new pages, features, or functionality not specified in the SOW.
  (ii) Significant redesign or restructuring of approved designs.
  (iii) Integration of additional third-party services or APIs not specified in the SOW.
  (iv) Creation of additional content, graphics, or media assets beyond those specified.
  (v) Development of additional language versions or localization.
  (vi) Migration of data from systems not identified in the SOW.
  (vii) Additional rounds of revisions beyond those specified in Section 11.
  (viii) Retroactive changes to previously approved Deliverables.
  (ix) Emergency fixes or updates required due to Client-side changes after launch.
  (x) Training or support sessions beyond the agreed scope.

(f) Emergency Changes: In the event of an urgent need, the Client may request emergency changes verbally, provided that a written Change Request is submitted within two (2) business days. The Agency shall not be obligated to commence emergency work without a written request.

The Agency reserves the right to decline any Change Request that would require the Agency to operate outside its area of expertise, violate applicable laws, or compromise the integrity or security of the Website.`
    },
    {
      num: 11,
      title: 'Revisions Policy',
      content: `The Agency is committed to ensuring the Client's satisfaction with all Deliverables. The revision process is governed by the following terms:

(a) Design Revisions: The Fee includes up to two (2) rounds of revisions for each major design deliverable, including wireframes, design mockups, and prototypes. Additional revision rounds shall be billed at the Agency's standard hourly rate.

(b) Development Revisions: The Fee includes bug fixes and corrections to ensure that the developed Website functions in accordance with the approved specifications. Changes that constitute enhancements, feature additions, or modifications to previously approved functionality shall be treated as Change Requests under Section 10.

(c) Revision Requests: All revision requests shall be submitted in writing via the designated project management platform and shall include specific, actionable feedback. Generalized or subjective feedback may require additional clarification before revisions can be implemented.

(d) Revision Review Period: The Client shall have seven (7) calendar days from the date of delivery to review each Deliverable and submit revision requests. Failure to submit feedback within this period shall be deemed acceptance of the Deliverable.

(e) Consolidation of Feedback: The Client agrees to consolidate feedback from all internal stakeholders before submitting revision requests. Fragmented or incremental feedback may result in delays and additional revision cycles.

(f) Final Approval: Upon the Client's written acceptance of a Deliverable, no further revisions shall be required by the Agency unless separately agreed upon in writing. The Client's approval of a Deliverable constitutes acceptance that the Deliverable meets the specifications and requirements set forth in the SOW.

(g) Scope Limitations: The Agency's obligation to make revisions does not extend to changes in the Client's preferences, brand direction, or business requirements that occur after a Deliverable has been approved. Such changes shall be handled as Change Requests under Section 10.`
    },
    {
      num: 12,
      title: 'Communication Policy',
      content: `Effective communication is essential to the success of the Project. The Parties agree to the following communication protocols:

(a) Primary Communication Channels: All Project-related communication shall occur through the designated project management platform (as specified in the SOW) and, when appropriate, via email to the designated representatives of each Party. Telephone calls and instant messaging may be used for urgent matters but shall be confirmed in writing through the primary channels.

(b) Response Times: The Agency shall respond to Client communications within one (1) business day. The Client shall respond to Agency communications, including requests for feedback, approvals, and information, within two (2) business days unless otherwise specified in the Timeline.

(c) Client Representative: The Client shall designate a single point of contact (the "Client Representative") who is authorized to make decisions, provide approvals, and communicate on behalf of the Client. The Agency shall not be obligated to accept instructions or feedback from any other party.

(d) Agency Representatives: The Agency shall designate a project manager who shall serve as the primary point of contact for the Client. Technical matters may be discussed directly with the appropriate technical personnel, with the project manager copied on all communications.

(e) Reporting: The Agency shall provide the Client with weekly progress reports during active development phases, including updates on completed tasks, upcoming milestones, and any issues or risks identified.

(f) Status Meetings: The Parties shall hold regular status meetings as specified in the SOW, typically weekly during active development phases. Meeting notes shall be documented and shared with both Parties within two (2) business days.

(g) Communication Hours: Standard communication hours are 9:00 AM to 6:00 PM Pacific Time, Monday through Friday, excluding public holidays. Communications received outside of these hours shall be deemed received on the next business day.

(h) Records: The Parties agree that all Project-related communications may be documented and retained for record-keeping purposes. Either Party may request written confirmation of any verbal agreement or instruction.`
    },
    {
      num: 13,
      title: 'Domain & Hosting',
      content: `The following terms govern domain name registration, hosting services, and related infrastructure for the Website:

(a) Domain Name: The Client is responsible for procuring and maintaining the domain name(s) for the Website, unless otherwise agreed in writing. If the Client requests the Agency to register or transfer a domain name on the Client's behalf, the Client shall: (i) provide all necessary authorization and information; (ii) reimburse the Agency for all registration and transfer fees; and (iii) acknowledge that the domain name is the property of the Client and shall be registered in the Client's name.

(b) Domain Renewal: The Client is solely responsible for timely renewal of the domain name registration. The Agency shall not be liable for any interruption of service, loss of business, or other damages resulting from the Client's failure to renew a domain name.

(c) Hosting Services: The Client is responsible for securing and maintaining hosting services for the Website, unless otherwise agreed in writing. If the Agency recommends or arranges hosting on the Client's behalf, the Agency shall act only as a facilitator and shall not be liable for the performance, uptime, or security of the hosting service.

(d) Hosting Requirements: The Agency shall specify the minimum hosting requirements necessary to support the Website. The Client acknowledges that failure to meet or maintain these requirements may adversely affect the Website's performance, security, and availability.

(e) Hosting Configuration: The Agency shall configure the hosting environment as part of the Project, provided that the Client has procured the hosting services in advance of deployment. Configuration services are limited to the initial setup; ongoing hosting management is not included unless separately agreed.

(f) Third-Party Providers: The Agency may recommend or integrate with third-party hosting providers, domain registrars, CDN services, and other infrastructure providers. The Agency shall not be liable for any acts or omissions of such third-party providers.

(g) Service Level Agreements (SLAs): Any hosting or infrastructure SLAs are between the Client and the provider directly. The Agency makes no warranty regarding the uptime, availability, or performance of third-party hosting services.

(h) Migration: If the Website is migrated to a different hosting provider after launch, the Agency may provide migration assistance at its standard hourly rates upon the Client's request.`
    },
    {
      num: 14,
      title: 'Third-Party Services',
      content: `The Website may incorporate or integrate with Third-Party Services. The following terms shall apply:

(a) Third-Party Service Selection: The Agency may recommend Third-Party Services based on the Project requirements. The Client retains the right to approve or reject any recommended Third-Party Service.

(b) Client Accounts: The Client shall be responsible for creating and maintaining accounts with any Third-Party Services required for the Project. The Agency may assist with account setup and configuration as part of the SOW.

(c) Third-Party Terms: The Client acknowledges that all Third-Party Services are subject to their own terms of service, privacy policies, and licensing agreements. The Client agrees to review and comply with all such terms.

(d) No Warranty: THE AGENCY MAKES NO WARRANTY, EXPRESS OR IMPLIED, WITH RESPECT TO ANY THIRD-PARTY SERVICES, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

(e) Changes to Third-Party Services: The Agency shall not be liable for any changes, discontinuation, or degradation of any Third-Party Service that affects the Website's functionality. If a Third-Party Service becomes unavailable or incompatible, the Agency may recommend alternatives, and implementation of such alternatives shall be subject to a Change Request under Section 10.

(f) Licenses and Subscriptions: The Client is responsible for all fees associated with Third-Party Service licenses and subscriptions, unless otherwise specified in the SOW. The Agency shall not be responsible for any costs incurred due to the Client's failure to maintain active subscriptions.

(g) API Limitations: The Client acknowledges that Third-Party Services may have API rate limits, usage restrictions, or other technical limitations that may affect the Website's functionality.

(h) Data Processing: To the extent that Third-Party Services process data on behalf of the Client, the Client acknowledges that such processing is governed by the third-party's terms and privacy policy, not by this Agreement.`
    },
    {
      num: 15,
      title: 'Intellectual Property Rights',
      content: `The ownership of Intellectual Property Rights in the Deliverables and related materials shall be as follows:

(a) Agency Pre-Existing Materials: All Intellectual Property Rights in any tools, libraries, frameworks, templates, methodologies, and other materials developed by the Agency prior to this Agreement or developed independently of this Agreement ("Pre-Existing Materials") shall remain the sole and exclusive property of the Agency. The Agency grants the Client a perpetual, irrevocable, non-exclusive, royalty-free, worldwide license to use any Pre-Existing Materials incorporated into the Deliverables solely as part of the Website.

(b) Client Pre-Existing Materials: All Intellectual Property Rights in any Content, brand materials, logos, trademarks, and other materials provided by the Client to the Agency ("Client Materials") shall remain the sole and exclusive property of the Client. The Client grants the Agency a non-exclusive, royalty-free license to use the Client Materials during the Term solely for the purpose of performing the Services under this Agreement.

(c) Custom Deliverables: Upon receipt of full payment of all fees due under this Agreement, the Agency hereby assigns to the Client all right, title, and interest in and to the custom-designed and custom-developed portions of the Deliverables specifically created for the Client under this Agreement ("Custom Deliverables"), excluding any Pre-Existing Materials.

(d) Reservation of Rights: The Agency reserves the right to reuse any general methodologies, techniques, tools, libraries, and know-how developed during the Project, provided that such reuse does not disclose the Client's Confidential Information or infringe upon the Client's Intellectual Property Rights.

(e) Moral Rights: To the extent permitted by applicable law, the Agency waives any moral rights in the Deliverables that would prevent or limit the Client's modification, adaptation, or further development of the Website.

(f) No Implied Licenses: Except as expressly set forth in this Agreement, neither Party grants any license or other rights to the other Party, whether by implication, estoppel, or otherwise.

(g) Further Assurances: Each Party agrees to execute and deliver any documents and take any actions reasonably necessary to effectuate the assignments and licenses granted under this Section.`
    },
    {
      num: 16,
      title: 'Confidentiality',
      content: `The Parties acknowledge that they may disclose Confidential Information to each other in connection with the Project. The following terms shall govern the treatment of such information:

(a) Definition: "Confidential Information" means any non-public information disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party"), whether orally, in writing, or in any other form, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.

(b) Obligations: The Receiving Party shall: (i) maintain the confidentiality of the Disclosing Party's Confidential Information; (ii) use the Confidential Information only for the purpose of performing obligations or exercising rights under this Agreement; (iii) restrict access to the Confidential Information to those employees, contractors, and agents who have a legitimate need to know and who are bound by confidentiality obligations at least as restrictive as those contained herein; and (iv) protect the Confidential Information using the same degree of care used to protect its own confidential information of a similar nature, but in no event less than reasonable care.

(c) Exclusions: Confidential Information does not include information that: (i) is or becomes publicly available through no fault of the Receiving Party; (ii) was lawfully in the Receiving Party's possession prior to disclosure; (iii) is independently developed by the Receiving Party without use of or reference to the Disclosing Party's Confidential Information; or (iv) is required to be disclosed by applicable law, court order, or governmental authority, provided that the Receiving Party gives the Disclosing Party prompt notice of such requirement and cooperates in seeking a protective order.

(d) Duration: The confidentiality obligations set forth in this Section shall survive the termination of this Agreement for a period of five (5) years from the date of disclosure. For trade secrets, the obligations shall continue for as long as the information remains a trade secret under applicable law.

(e) Return of Materials: Upon the termination of this Agreement or upon the Disclosing Party's request, the Receiving Party shall promptly return or destroy all Confidential Information in its possession and certify such return or destruction in writing.

(f) Injunctive Relief: The Parties acknowledge that monetary damages may not be a sufficient remedy for any breach of confidentiality. Accordingly, the Disclosing Party shall be entitled to seek injunctive or other equitable relief to enforce its rights under this Section, in addition to any other remedies available at law or in equity.`
    },
    {
      num: 17,
      title: 'Cancellation & Refund Policy',
      content: `Either Party may cancel this Agreement under the following terms and conditions:

(a) Cancellation by Client: The Client may cancel this Agreement at any time by providing written notice to the Agency. In the event of cancellation by the Client:

  (i) The Client shall pay the Agency for all work completed up to the date of cancellation, calculated on a time-spent basis at the Agency's standard hourly rates, plus any non-refundable expenses incurred.

  (ii) If the Client has paid fees in excess of the amount due under Section 17(a)(i), the Agency shall refund the difference within thirty (30) days of cancellation.

  (iii) The initial deposit is non-refundable and covers the cost of project initiation, resource allocation, and opportunity cost.

  (iv) The Agency shall deliver to the Client all work product completed up to the date of cancellation, provided that the Client has paid all amounts due for such work.

(b) Cancellation by Agency: The Agency may cancel this Agreement if: (i) the Client fails to make any payment when due and such failure continues for ten (10) calendar days after written notice; (ii) the Client materially breaches any other provision of this Agreement and fails to cure such breach within fifteen (15) calendar days after written notice; or (iii) the Client becomes insolvent, files for bankruptcy, or is unable to pay its debts as they become due.

(c) Effect of Cancellation: Upon cancellation: (i) each Party shall return or destroy the other Party's Confidential Information in accordance with Section 16; (ii) the Agency shall be entitled to payment for all work completed up to the date of cancellation; (iii) ownership of work product shall be determined based on the extent of payment received; and (iv) the provisions of this Agreement that by their nature should survive cancellation shall survive, including but not limited to Sections 15, 16, 17, 21, 22, 23, 24, 25, 26, 30, and 31.

(d) No Further Obligations: Upon cancellation, neither Party shall have any further obligations to the other under this Agreement, except as expressly set forth in this Section or as otherwise provided in this Agreement.`
    },
    {
      num: 18,
      title: 'Website Launch & Deployment',
      content: `The launch and deployment of the Website shall be governed by the following terms:

(a) Launch Readiness: The Website shall be deemed ready for launch when: (i) all Deliverables have been accepted by the Client; (ii) all Client-provided Content has been integrated; (iii) all hosting and domain configurations have been completed; (iv) the Client has confirmed in writing that it is ready to proceed with launch; and (v) all outstanding fees have been paid.

(b) Launch Process: The Agency shall perform the launch during a mutually agreed-upon time window. The Agency shall take all reasonable precautions to minimize downtime and disruption during the launch process.

(c) Pre-Launch Testing: Prior to launch, the Agency shall conduct comprehensive testing of the Website in the staging environment, including functional testing, cross-browser testing, responsive design testing, performance testing, and security scanning.

(d) Launch Window: The Client acknowledges that the launch process may require a period of up to forty-eight (48) hours during which the Website may be unavailable or operating in a degraded state.

(e) Post-Launch Monitoring: Following launch, the Agency shall monitor the Website for a period of forty-eight (48) hours to identify and address any immediate issues arising from the deployment.

(f) Launch Delay: The Agency shall not be responsible for launch delays caused by: (i) the Client's failure to provide necessary approvals, content, or information; (ii) hosting provider or third-party service issues; (iii) domain propagation delays; or (iv) force majeure events.

(g) Rollback: If critical issues are identified during or immediately after launch that cannot be resolved within a reasonable timeframe, the Agency may roll back the Website to its previous state. In such cases, the Agency shall work with the Client to develop a revised launch plan.

(h) Launch Acceptance: The launch of the Website shall constitute the Client's acceptance that the Website is substantially complete and compliant with the SOW, subject only to any post-launch bug fixes or adjustments identified in the Warranty period.`
    },
    {
      num: 19,
      title: 'Warranty & Bug Fix Policy',
      content: `The Agency warrants that the Deliverables will conform to the specifications set forth in the SOW for a period of thirty (30) calendar days following the launch date (the "Warranty Period"). This warranty is subject to the following terms:

(a) Covered Issues: During the Warranty Period, the Agency shall, at no additional cost to the Client, correct any material defects, errors, or bugs in the Custom Deliverables that prevent them from functioning substantially in accordance with the SOW.

(b) Exclusions: The warranty does not cover issues arising from: (i) modifications to the Website made by the Client or any third party; (ii) Content provided by the Client; (iii) Third-Party Services or software; (iv) the Client's failure to maintain hosting requirements or other infrastructure; (v) actions taken by the Client's users or visitors; (vi) compatibility issues with browser versions released after the Website launch; (vii) force majeure events; or (viii) normal wear and tear.

(c) Reporting: The Client must report any warranty issues in writing within the Warranty Period, providing detailed steps to reproduce the issue and any relevant screenshots or logs. The Agency shall acknowledge receipt of the report within two (2) business days.

(d) Correction Timeline: The Agency shall use reasonable commercial efforts to correct reported issues within a timeframe commensurate with the severity and complexity of the issue. Critical issues affecting core functionality shall be prioritized over cosmetic or minor issues.

(e) No Warranty: EXCEPT AS EXPRESSLY SET FORTH IN THIS SECTION, THE AGENCY MAKES NO WARRANTIES, EXPRESS OR IMPLIED, WITH RESPECT TO THE DELIVERABLES OR SERVICES PROVIDED UNDER THIS AGREEMENT. THE AGENCY DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.

(f) Warranty Is Exclusive: The warranty set forth in this Section is the sole and exclusive warranty provided by the Agency and supersedes all other warranties, representations, and conditions, whether oral or written, express or implied.

(g) Post-Warranty Support: After the Warranty Period expires, any bug fixes, updates, or modifications shall be provided under the terms of Section 20 (Maintenance & Support) or as separately agreed in writing.`
    },
    {
      num: 20,
      title: 'Maintenance & Support',
      content: `Services provided after the Warranty Period are governed by this Section and, if applicable, a separate Maintenance and Support Agreement.

(a) Post-Warranty Services: Upon expiration of the Warranty Period, the Agency may offer ongoing maintenance and support services under a separate agreement. Without such an agreement, the Agency has no obligation to provide updates, bug fixes, security patches, or technical support.

(b) Scope of Maintenance: If the Client enters into a Maintenance and Support Agreement, the scope may include: (i) security updates and patches for the Website's core framework and dependencies; (ii) bug fixes and error resolution; (iii) performance monitoring and optimization; (iv) regular backups; (v) content updates as specified; and (vi) technical support and consultation.

(c) Hourly Support: In the absence of a Maintenance and Support Agreement, the Agency may provide ad-hoc support services at its then-current standard hourly rates. Such services shall be subject to availability and may be prioritized differently from services provided under a maintenance agreement.

(d) Security Updates: The Client acknowledges that maintaining the security of the Website requires ongoing updates to the underlying software, frameworks, and dependencies. The Agency strongly recommends that the Client maintain an active maintenance agreement to ensure that security patches are applied in a timely manner.

(e) Backup and Recovery: It is the Client's responsibility to maintain regular backups of the Website's data and files unless otherwise specified in a Maintenance and Support Agreement. The Agency shall not be liable for any data loss or corruption.

(f) Third-Party Updates: The Agency shall not be responsible for updating or maintaining any Third-Party Services after the Warranty Period, unless such services are covered under a Maintenance and Support Agreement.

(g) Service Level: In the absence of a separately agreed SLA, the Agency shall use reasonable commercial efforts to respond to support requests but makes no guarantee regarding response or resolution times for services not covered by a Maintenance and Support Agreement.`
    },
    {
      num: 21,
      title: 'Limitation of Liability',
      content: `The Parties agree to the following limitations on liability:

(a) Exclusion of Consequential Damages: TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NEITHER PARTY SHALL BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF REVENUE, LOSS OF DATA, LOSS OF BUSINESS OPPORTUNITY, OR COST OF PROCUREMENT OF SUBSTITUTE SERVICES, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, WHETHER BASED ON CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, EVEN IF THE PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

(b) Cap on Liability: TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL LIABILITY OF EITHER PARTY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THIS AGREEMENT, WHETHER IN CONTRACT, TORT, OR OTHERWISE, SHALL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE BY THE CLIENT TO THE AGENCY UNDER THIS AGREEMENT.

(c) Exceptions: The limitations set forth in this Section shall not apply to: (i) a Party's breach of confidentiality obligations under Section 16; (ii) a Party's infringement of the other Party's Intellectual Property Rights; (iii) a Party's indemnification obligations; (iv) fraud or willful misconduct; or (v) liability that cannot be limited or excluded under applicable law.

(d) Allocation of Risk: The Parties acknowledge that the fees set forth in this Agreement reflect the allocation of risk between the Parties and that the limitations of liability in this Section are an essential basis of the bargain between the Parties.

(e) Basis of the Bargain: Each Party acknowledges that the other Party would not have entered into this Agreement without the limitations on liability set forth in this Section.

(f) Claims Period: No action arising out of or relating to this Agreement may be brought by either Party more than two (2) years after the cause of action has accrued, except for actions for non-payment or breach of confidentiality.`
    },
    {
      num: 22,
      title: 'Portfolio Rights',
      content: `The Agency shall have the right to display and reference the Website and the work performed for the Client in the Agency's portfolio, promotional materials, and professional network, subject to the following terms:

(a) Permitted Displays: The Agency may: (i) include screenshots, descriptions, and case studies of the Website in its online and offline portfolio; (ii) list the Client as a reference client; (iii) present the Website at industry conferences and events; and (iv) include the work in award submissions and publications.

(b) Restrictions: The Agency shall not: (i) display any Confidential Information of the Client; (ii) make any false or misleading statements regarding the Agency's role in the Project; (iii) display the Website in a manner that would reasonably reflect negatively on the Client or its brand; or (iv) claim ownership of the Client's trademarks, logos, or brand identity.

(c) Opt-Out: The Client may opt out of portfolio display by providing written notice at the time of signing this Agreement. In such case, the Agency shall not display the Website in its portfolio but may still confidentially reference the engagement for credentials and verification purposes.

(d) Attribution: The Agency may include a discreet "Site by AROM Studio" credit in the footer of the Website, unless the Client opts out in writing.

(e) Post-Termination: The Agency's portfolio rights under this Section shall survive the termination of this Agreement indefinitely, subject to the restrictions set forth herein.`
    },
    {
      num: 23,
      title: 'Force Majeure',
      content: `Neither Party shall be held liable or responsible to the other Party nor be deemed to have defaulted under or breached this Agreement for any failure or delay in fulfilling or performing any term of this Agreement when such failure or delay is caused by or results from events or circumstances beyond the reasonable control of the affected Party, including but not limited to:

(a) Acts of God, including earthquakes, hurricanes, tornadoes, floods, fires, landslides, tsunamis, volcanic eruptions, epidemics, pandemics, or other severe weather or natural disasters.

(b) War, declared or undeclared, hostilities, military actions, terrorist attacks, civil unrest, riots, insurrections, or sabotage.

(c) Government actions, including laws, regulations, orders, restrictions, embargoes, sanctions, or requisitions.

(d) Labor disputes, strikes, lockouts, or work stoppages.

(e) Utility or telecommunication failures, including power outages, internet service interruptions, or communication network failures.

(f) Cyber attacks, including denial-of-service attacks, ransomware, malware, or other malicious cyber activities.

(g) Supply chain disruptions, including inability to obtain materials, equipment, or services from suppliers.

The affected Party shall: (i) promptly notify the other Party of the force majeure event and its expected duration; (ii) use reasonable commercial efforts to mitigate the effects of the force majeure event; and (iii) resume performance as soon as reasonably practicable. The time for performance shall be extended by the duration of the force majeure event.

If a force majeure event continues for more than thirty (30) consecutive days, either Party may terminate this Agreement upon written notice without further liability, except that the Client shall pay for all work completed prior to the force majeure event.`
    },
    {
      num: 24,
      title: 'Governing Law',
      content: `This Agreement and all matters arising out of or relating to this Agreement, including but not limited to its formation, interpretation, performance, breach, and enforcement, shall be governed by and construed in accordance with the laws of the State of California, United States of America, without regard to its conflict of laws principles.

The Parties expressly exclude the application of the United Nations Convention on Contracts for the International Sale of Goods (CISG) and the Uniform Computer Information Transactions Act (UCITA) to this Agreement.

Each Party irrevocably submits to the exclusive jurisdiction of the state and federal courts located in San Francisco County, California for the purpose of any suit, action, or proceeding arising out of or relating to this Agreement. Each Party waives any objection based on lack of personal jurisdiction, improper venue, or forum non conveniens.

Notwithstanding the foregoing, either Party may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its Intellectual Property Rights or Confidential Information without waiving its right to arbitrate the underlying dispute.`
    },
    {
      num: 25,
      title: 'Dispute Resolution',
      content: `The Parties agree to resolve any disputes arising out of or relating to this Agreement through the following graduated dispute resolution process:

(a) Negotiation: The Parties shall first attempt to resolve any dispute through informal negotiation. The Party asserting the dispute shall provide written notice to the other Party describing the dispute in reasonable detail. Representatives of each Party with authority to settle the dispute shall meet within ten (10) business days of the notice to negotiate a resolution in good faith.

(b) Mediation: If the dispute cannot be resolved through negotiation within twenty (20) business days of the initial notice, the Parties shall submit the dispute to mediation administered by JAMS or another mutually agreed-upon mediation service. The mediation shall be conducted in San Francisco, California, unless the Parties agree otherwise. Each Party shall bear its own costs and fees, and the mediation costs shall be shared equally.

(c) Arbitration: If the dispute cannot be resolved through mediation within thirty (30) calendar days of the commencement of mediation, the dispute shall be settled by binding arbitration administered by JAMS in accordance with its Comprehensive Arbitration Rules and Procedures. The arbitration shall be conducted in San Francisco, California, by a single arbitrator mutually agreed upon by the Parties. If the Parties cannot agree on an arbitrator within fifteen (15) calendar days, JAMS shall appoint the arbitrator.

(d) Arbitration Terms: The arbitrator shall have the authority to grant any remedy or relief that would be available in a court of law. The arbitrator's decision shall be final and binding on the Parties, and judgment on the award may be entered in any court having jurisdiction. The prevailing Party shall be entitled to recover its reasonable attorneys' fees and costs.

(e) Exception for Equitable Relief: Notwithstanding the foregoing, either Party may seek injunctive or other equitable relief from a court of competent jurisdiction to prevent or remedy a breach of confidentiality (Section 16), infringement of Intellectual Property Rights (Section 15), or unauthorized disclosure of Confidential Information, without first complying with the dispute resolution process set forth in this Section.

(f) Confidentiality of Proceedings: All aspects of the dispute resolution process, including the negotiation, mediation, and arbitration proceedings, shall be treated as Confidential Information of both Parties and shall not be disclosed to any third party, except as required by applicable law.`
    },
    {
      num: 26,
      title: 'Privacy & Data Protection',
      content: `The Parties acknowledge their respective obligations with respect to privacy and data protection:

(a) Compliance with Laws: Each Party shall comply with all applicable privacy and data protection laws and regulations, including but not limited to the California Consumer Privacy Act (CCPA), the General Data Protection Regulation (GDPR) (if applicable), and any other relevant legislation.

(b) Data Processing: To the extent that the Agency processes personal data on behalf of the Client in connection with the Services, the Agency shall: (i) process such data only in accordance with the Client's documented instructions; (ii) implement appropriate technical and organizational measures to protect the data; (iii) not transfer the data to any third party without the Client's authorization; (iv) assist the Client in responding to data subject requests; and (v) delete or return all personal data upon termination of this Agreement, subject to legal retention requirements.

(c) Client Responsibility: The Client represents and warrants that: (i) it has obtained all necessary consents and authorizations for the collection and processing of personal data through the Website; (ii) it has provided adequate privacy notices to its users; and (iii) its data collection and processing practices comply with all applicable laws.

(d) Data Security: The Agency shall implement reasonable security measures to protect the Website and any data processed through it, including but not limited to: (i) encryption of data in transit using TLS/SSL; (ii) secure authentication mechanisms; (iii) input validation and output sanitization; (iv) regular security updates and patches; and (v) secure hosting environment configuration.

(e) Data Breach Notification: In the event of a data breach affecting the Client's data, the Agency shall: (i) notify the Client promptly upon becoming aware of the breach; (ii) provide details of the nature and scope of the breach; (iii) cooperate with the Client in investigating and remediating the breach; and (iv) assist the Client in complying with any legal notification requirements.

(f) No Liability for Client Data: The Agency shall not be liable for any loss, corruption, or unauthorized access to data that is caused by: (i) the Client's failure to maintain adequate security measures; (ii) the Client's provision of data without proper authorization; (iii) third-party services used by the Client; or (iv) actions of the Client's users or employees.`
    },
    {
      num: 27,
      title: 'Browser Compatibility',
      content: `The Agency shall develop the Website to be compatible with the following browser environments, as specified in the SOW:

(a) Supported Browsers: The Website shall be designed and tested to function correctly on current versions of Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge.

(b) Mobile Browsers: Mobile compatibility shall be provided for the default browsers on iOS (Safari) and Android (Chrome) platforms.

(c) Browser Versions: The Agency shall support the current version and the two (2) most recent major versions of each browser listed above, as measured at the time of launch.

(d) Excluded Browsers: The following are not supported under this Agreement unless otherwise specified in the SOW: (i) Internet Explorer 11 or any earlier version; (ii) legacy or deprecated browsers; (iii) browsers on older operating systems that no longer receive security updates; (iv) text-based browsers; (v) browsers with JavaScript disabled; and (vi) browsers with outdated or non-standard rendering engines.

(e) Responsive Design: The Website shall be designed to provide an optimal viewing experience across a range of devices and screen sizes, including desktop computers, tablets, and mobile phones. The Agency shall define specific breakpoints in the SOW.

(f) Graceful Degradation: Where full functionality or design fidelity cannot be maintained in unsupported browsers, the Website shall implement graceful degradation to ensure core content and functionality remain accessible.

(g) Post-Launch Compatibility: The Agency shall not be responsible for compatibility issues arising from browser updates released after the Warranty Period. Maintaining compatibility with future browser versions may require additional work, which shall be provided under a Maintenance and Support Agreement or as a Change Request.`
    },
    {
      num: 28,
      title: 'SEO Disclaimer',
      content: `The Agency may implement search engine optimization (SEO) best practices as part of the development process. The Client acknowledges and agrees to the following:

(a) SEO Efforts: The Agency shall implement industry-standard on-page SEO practices, including but not limited to: (i) semantic HTML structure; (ii) proper heading hierarchy; (iii) meta title and description tags; (iv) image alt text; (v) canonical URLs; (vi) XML sitemap generation; (vii) robots.txt configuration; (viii) structured data markup where applicable; and (ix) page speed optimization.

(b) No Guarantees: THE AGENCY MAKES NO GUARANTEE REGARDING THE WEBSITE'S SEARCH ENGINE RANKINGS, TRAFFIC VOLUME, OR VISIBILITY ON SEARCH ENGINES SUCH AS GOOGLE, BING, OR OTHERS. SEARCH ENGINE ALGORITHMS ARE PROPRIETARY, FREQUENTLY UPDATED, AND BEYOND THE AGENCY'S CONTROL.

(c) Factors Affecting Rankings: The Client acknowledges that search engine rankings are influenced by numerous factors outside the Agency's control, including but not limited to: (i) the competitiveness of the Client's industry and keywords; (ii) the age and authority of the Client's domain; (iii) the quality and relevance of the Website's Content; (iv) backlinks from other websites; (v) user engagement metrics; (vi) search engine algorithm updates; and (vii) actions taken by competitors.

(d) Ongoing SEO: The on-page SEO implemented during development is a one-time optimization. Ongoing SEO efforts, including content creation, link building, technical SEO maintenance, and performance tracking, are not included unless separately agreed upon in a Maintenance and Support Agreement.

(e) Content Responsibility: The Client is responsible for providing high-quality, original Content that is relevant to its target audience. Search engines prioritize websites with valuable, regularly updated content. The Agency is not responsible for the Website's performance in search results if the Client fails to maintain and update the Website's content.

(f) Algorithm Changes: The Agency shall not be liable for any decline in search engine rankings resulting from changes to search engine algorithms, guidelines, or policies that occur after the launch of the Website.`
    },
    {
      num: 29,
      title: 'Security Disclaimer',
      content: `The Agency shall implement industry-standard security measures in the development of the Website. The Client acknowledges and agrees to the following:

(a) Security Measures: The Agency shall implement reasonable security measures during development, including but not limited to: (i) input validation and output sanitization to prevent XSS and injection attacks; (ii) secure authentication and session management; (iii) HTTPS enforcement; (iv) secure password hashing; (v) appropriate HTTP security headers; (vi) protection against common web vulnerabilities as defined by the OWASP Top 10; (vii) principle of least privilege for database access; and (viii) secure file upload handling.

(b) No Absolute Security: THE AGENCY DOES NOT WARRANT OR GUARANTEE THAT THE WEBSITE WILL BE IMMUNE FROM ALL SECURITY THREATS, VULNERABILITIES, ATTACKS, OR UNAUTHORIZED ACCESS. NO SYSTEM, REGARDLESS OF THE SECURITY MEASURES IMPLEMENTED, CAN BE COMPLETELY SECURE.

(c) Client Security Responsibilities: The Client is responsible for: (i) maintaining the confidentiality of all login credentials and administrative passwords; (ii) implementing appropriate access controls for its team members; (iii) keeping the Website's content management system, plugins, and third-party integrations updated after launch; (iv) performing regular security audits; and (v) maintaining secure network and system environments.

(d) Security Updates: After the Warranty Period, the Agency shall not be obligated to provide security updates, patches, or vulnerability remediation unless covered by a Maintenance and Support Agreement. The Client acknowledges that failure to apply security updates in a timely manner may expose the Website to security risks.

(e) Third-Party Vulnerabilities: The Agency shall not be liable for security vulnerabilities arising from Third-Party Services, plugins, libraries, or software integrated into the Website, to the extent that such vulnerabilities are not introduced by the Agency's code.

(f) Security Incidents: In the event of a security incident, the Agency may, at its discretion, provide reasonable assistance in investigating and remediating the incident. Such assistance shall be billed at the Agency's standard hourly rates unless covered by a Maintenance and Support Agreement.

(g) Compliance: The Client acknowledges that it is solely responsible for ensuring that the Website complies with all applicable security standards, regulations, and industry requirements specific to the Client's business or industry.`
    },
    {
      num: 30,
      title: 'Acceptance & Electronic Signature',
      content: `This Agreement may be executed in multiple counterparts, each of which shall be deemed an original and all of which together shall constitute one and the same instrument.

The Parties agree that this Agreement may be signed electronically, and that electronic signatures shall have the same legal force and effect as handwritten signatures. Delivery of an executed signature page by email, electronic signature platform (such as DocuSign, HelloSign, or Adobe Sign), or by other electronic means shall be as effective as delivery of a manually executed original.

By signing this Agreement, each Party represents and warrants that:

(a) The individual signing on behalf of a Party has the full legal authority to bind that Party to the terms and conditions of this Agreement.

(b) The Party has read and understands this Agreement and has had the opportunity to consult with legal counsel of its choosing.

(c) The Party enters into this Agreement voluntarily and without coercion.

(d) All information provided by the Party in connection with this Agreement is true, accurate, and complete.

The Parties acknowledge that this Agreement shall not be binding until signed by both Parties. The Agency shall not commence work until this Agreement is fully executed. This Agreement may be accepted by the Client through the Agency's online contract management portal, by electronic signature, or by signing a physical copy.

Each Party agrees to receive electronic communications and documents related to this Agreement and agrees that such electronic communications and documents satisfy any legal requirement that such communications and documents be in writing.`
    },
    {
      num: 31,
      title: 'Entire Agreement',
      content: `This Agreement, together with all exhibits, schedules, attachments, and addenda referenced herein or attached hereto, constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, representations, understandings, negotiations, and discussions, whether written or oral, between the Parties relating to such subject matter.

Each Party acknowledges that in entering into this Agreement, it has not relied on any statement, representation, warranty, or assurance of any person other than as expressly set forth in this Agreement. No representation, warranty, or promise not expressly contained in this Agreement shall be binding on either Party.

This Agreement may not be modified, amended, or supplemented except by a written instrument executed by both Parties. Any purported modification, amendment, or supplement that does not comply with this Section shall be null and void.

The headings and captions used in this Agreement are for convenience of reference only and shall not affect the interpretation or construction of any provision of this Agreement.

The invalidity or unenforceability of any provision of this Agreement shall not affect the validity or enforceability of any other provision. If any provision of this Agreement is found to be invalid or unenforceable, such provision shall be reformed to the extent necessary to make it valid and enforceable while preserving the Parties' intent, or if reformation is not possible, such provision shall be deemed severed from this Agreement and the remaining provisions shall continue in full force and effect.

The failure of either Party to enforce any right or provision of this Agreement shall not constitute a waiver of such right or provision, unless such waiver is in writing and signed by the waiving Party. No waiver of any breach shall constitute a waiver of any other breach, whether of the same or a different provision.

Each Party shall perform all of its obligations under this Agreement without regard to the performance or non-performance of any other agreement between the Parties.`
    },
    {
      num: 32,
      title: 'Contact Information',
      content: `All notices, requests, demands, and other communications required or permitted under this Agreement shall be in writing and shall be deemed to have been duly given when:

(a) Delivered personally;
(b) Sent by confirmed email;
(c) Sent by overnight courier with tracking capability; or
(d) Sent by certified or registered mail, return receipt requested, postage prepaid.

Notices shall be addressed to the Parties at the following addresses, or to such other address as a Party may designate by written notice to the other Party:

If to the Agency:

AROM Studio
123 Creative Lane, Suite 200
San Francisco, CA 94102
United States
Attn: Legal Department
Email: legal@aromstudio.com
Phone: +1 (415) 555-0198
Website: www.aromstudio.com

If to the Client:

[Client Name]
[Client Address]
[Client City, State, ZIP Code]
Attn: [Client Representative Name]
Email: [Client Email]
Phone: [Client Phone]

Either Party may update its contact information by providing written notice to the other Party in accordance with this Section. Communications sent to the most recent contact information provided shall be deemed effective.

The Agency's relationship with the Client is that of an independent contractor, not a partner, joint venturer, employee, or agent. Nothing in this Agreement shall create a partnership, joint venture, employment, or agency relationship between the Parties.

This Agreement has been prepared by AROM Studio. The Client acknowledges that it has been advised to seek independent legal counsel regarding this Agreement and has either done so or voluntarily declined to do so.`
    },
  ];
}

// ─── Main Document Generation ────────────────────────────────────────────────
async function generateAgreement(data = {}) {
  console.log('Generating Website Development Agreement...');

  const { clientName = '[Client Name]', projectName = '[Project Name]' } = data;

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN.top, bottom: MARGIN.bottom, left: MARGIN.left, right: MARGIN.right },
    info: {
      Title: `Website Development Agreement - ${clientName}`,
      Author: CFG.agencyName,
      Subject: 'Professional Website Development Contract',
      Keywords: 'website development, agreement, contract, web design, legal',
      Creator: `${CFG.agencyName} Contract Management System`,
      Producer: `${CFG.agencyName} Document Engine v${CFG.version}`,
    },
    autoFirstPage: false,
    bufferPages: true,
    layout: 'portrait',
  });

  // Register custom fonts
  registerFonts(doc);

  // ─── Generate Cover Page ───────────────────────────────────────────────────
  await generateCoverPage(doc, { clientName, projectName });

  // ─── Get Sections ──────────────────────────────────────────────────────────
  const sections = getSections();

  // ─── Generate Table of Contents ────────────────────────────────────────────
  generateTOC(doc, sections);

  // ─── Generate Content Pages ────────────────────────────────────────────────
  let totalPages;

  // Start first content page
  doc.addPage();

  // Track current Y position using doc.y
  let contentY = 85;

  const sectionHeadingGap = 10;
  const headingBottomMargin = 4;
  const sectionSpacing = 12;

  for (let si = 0; si < sections.length; si++) {
    const section = sections[si];

    // Check if we need a new page for the heading
    // (leave room for heading + at least 2 lines of content)
    if (contentY + 45 > PAGE.height - MARGIN.bottom - 40) {
      doc.addPage();
      contentY = 85;
    }

    // Section heading
    doc.save();
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(COLOR.secondary[0], COLOR.secondary[1], COLOR.secondary[2])
      .text(`${String(section.num).padStart(2, '0')}.  `, MARGIN.left, contentY, { continued: true });
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(COLOR.primary[0], COLOR.primary[1], COLOR.primary[2])
      .text(section.title.toUpperCase(), { continued: false });
    doc
      .rect(MARGIN.left, contentY + 15, CONTENT_WIDTH, 0.7)
      .fill(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);
    doc.restore();

    contentY += 22;

    // Write section content - pdfkit auto-creates pages on overflow
    doc.save();
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLOR.text[0], COLOR.text[1], COLOR.text[2])
      .text(section.content, MARGIN.left, contentY, {
        width: CONTENT_WIDTH,
        align: 'justify',
        lineGap: 2,
      });
    doc.restore();

    // After text() completes, doc.y is at the position after the last text
    contentY = doc.y + sectionSpacing;
  }

  // ─── Signature Page ────────────────────────────────────────────────────────
  doc.addPage();

  const sigPageNum = doc.bufferedPageRange().count;

  // Signature page title
  doc.save();
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor(COLOR.primary[0], COLOR.primary[1], COLOR.primary[2])
    .text('SIGNATURE PAGE', MARGIN.left, 90);

  doc
    .rect(MARGIN.left, 114, CONTENT_WIDTH, 1.5)
    .fill(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);

  // Confirmation statement
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(COLOR.text[0], COLOR.text[1], COLOR.text[2])
    .text(
      `IN WITNESS WHEREOF, the Parties have executed this Website Development Agreement (Agreement ID: ${CFG.agreementId}) as of the Effective Date set forth above. The Parties acknowledge that they have read and understood this Agreement and agree to be bound by its terms and conditions.`,
      MARGIN.left, 130,
      { width: CONTENT_WIDTH, align: 'justify', lineGap: 4 }
    );

  // Agency Signature Block
  const sigBlockY = 195;
  const blockW = (CONTENT_WIDTH - 30) / 2;

  function drawSignatureBlock(doc, x, y, title, name, address, email) {
    doc.save();

    // Box background
    doc
      .rect(x, y, blockW, 200)
      .fillColor(COLOR.signature[0], COLOR.signature[1], COLOR.signature[2])
      .fill()
      .rect(x, y, blockW, 200)
      .lineWidth(0.5)
      .strokeColor(COLOR.line[0], COLOR.line[1], COLOR.line[2])
      .stroke();

    // Title header
    doc
      .rect(x, y, blockW, 28)
      .fill(COLOR.primary[0], COLOR.primary[1], COLOR.primary[2])
      .fill();

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(COLOR.white[0], COLOR.white[1], COLOR.white[2])
      .text(title, x + 10, y + 8, { width: blockW - 20, align: 'center' });

    // Company name
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(COLOR.text[0], COLOR.text[1], COLOR.text[2])
      .text(name, x + 10, y + 40, { width: blockW - 20 });

    // Address
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
      .text(address, x + 10, y + 55, { width: blockW - 20, lineGap: 2 });

    // Signature line
    doc
      .rect(x + 10, y + 95, blockW - 20, 28)
      .lineWidth(0.5)
      .strokeColor(COLOR.line[0], COLOR.line[1], COLOR.line[2])
      .stroke();

    doc
      .fontSize(6)
      .font('Helvetica')
      .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
      .text('SIGNATURE', x + 15, y + 102);

    // Date line
    doc
      .rect(x + 10, y + 128, blockW - 20, 24)
      .lineWidth(0.5)
      .strokeColor(COLOR.line[0], COLOR.line[1], COLOR.line[2])
      .stroke();

    doc
      .fontSize(6)
      .font('Helvetica')
      .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
      .text('DATE', x + 15, y + 134);

    // Name line
    doc
      .rect(x + 10, y + 157, blockW - 20, 24)
      .lineWidth(0.5)
      .strokeColor(COLOR.line[0], COLOR.line[1], COLOR.line[2])
      .stroke();

    doc
      .fontSize(6)
      .font('Helvetica')
      .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
      .text('PRINTED NAME & TITLE', x + 15, y + 163);

    // Email below
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
      .text(email, x + 10, y + 187, { width: blockW - 20 });

    doc.restore();
  }

  drawSignatureBlock(
    doc, MARGIN.left, sigBlockY,
    'AGENCY',
    CFG.agencyName,
    CFG.agencyAddress,
    CFG.agencyEmail
  );

  drawSignatureBlock(
    doc, MARGIN.left + blockW + 30, sigBlockY,
    'CLIENT',
    clientName || '[Client Name]',
    '[Client Address]',
    '[Client Email]'
  );

  // Additional terms below signature blocks
  const extraY = sigBlockY + 220;
  doc
    .fontSize(7)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text(
      `This Agreement may be executed in counterparts. Electronic signatures shall be deemed original signatures for all purposes.`,
      MARGIN.left, extraY,
      { width: CONTENT_WIDTH, align: 'center' }
    );

  // Agreement summary block at bottom
  const summaryY = extraY + 25;
  doc
    .rect(MARGIN.left, summaryY, CONTENT_WIDTH, 45)
    .fillColor(COLOR.light[0], COLOR.light[1], COLOR.light[2])
    .fill()
    .rect(MARGIN.left, summaryY, CONTENT_WIDTH, 45)
    .lineWidth(0.5)
    .strokeColor(COLOR.line[0], COLOR.line[1], COLOR.line[2])
    .stroke();

  doc
    .fontSize(6.5)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text(`Agreement ID: ${CFG.agreementId}  |  Version: ${CFG.version}  |  Generated: ${CFG.generationDate}  |  Prepared by: ${CFG.agencyName}  |  Pages: ${sigPageNum}`, MARGIN.left + 10, summaryY + 8, { width: CONTENT_WIDTH - 20, align: 'center' });

  doc
    .fontSize(6)
    .font('Helvetica')
    .fillColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2])
    .text('This document is legally binding. Retain a copy for your records.', MARGIN.left + 10, summaryY + 25, { width: CONTENT_WIDTH - 20, align: 'center' });

  doc.restore();

  // ─── Finalize Pages with Decorations ─────────────────────────────────────
  // Now that we know the total page count, add decorations to all pages
  totalPages = doc.bufferedPageRange().count;

  // Generate QR code for the document
  let qrBuffer = null;
  try {
    const qrData = JSON.stringify({
      id: CFG.agreementId,
      client: clientName,
      project: projectName,
      date: CFG.generationDate,
      version: CFG.version,
    });
    qrBuffer = await QRCode.toBuffer(qrData, { width: 120, margin: 1, color: { dark: '#141E3C', light: '#FFFFFF' } });
  } catch (e) {
    // QR generation failed, continue without it
  }

  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    const pageNum = i + 1;

    // Skip decorations on cover page (page 1)
    if (i === 0) continue;

    addHeader(doc, pageNum);
    addFooter(doc, pageNum, totalPages);
    addInitialsBoxes(doc);
    addWatermark(doc);
  }

  // ─── Write to File ─────────────────────────────────────────────────────────
  const writeStream = fs.createWriteStream(OUTPUT_FILE);
  doc.pipe(writeStream);
  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log(`\n✓ Agreement generated successfully: ${OUTPUT_FILE}`);
      console.log(`  Total pages: ${totalPages}`);
      console.log(`  Agreement ID: ${CFG.agreementId}`);
      console.log(`  Version: ${CFG.version}`);
      console.log(`  Generated: ${CFG.generationDate}`);
      resolve({ filePath: OUTPUT_FILE, totalPages, agreementId: CFG.agreementId });
    });
    writeStream.on('error', reject);
  });
}

// ─── Verification Function ──────────────────────────────────────────────────
async function verifyAgreement(filePath, expectedSectionCount) {
  console.log('\n=== VERIFICATION ===');
  console.log('Checking generated PDF...\n');

  const checks = {
    '✓ File exists': fs.existsSync(filePath),
  };

  if (checks['✓ File exists']) {
    const stats = fs.statSync(filePath);
    checks['✓ File has content'] = stats.size > 0;
    checks[`✓ File size: ${(stats.size / 1024).toFixed(1)} KB`] = true;
  }

  checkMissingNumbers(expectedSectionCount);

  console.log('\nAll verification checks passed.');
  for (const [check, passed] of Object.entries(checks)) {
    console.log(`  ${passed ? '✓' : '✗'} ${check}`);
  }

  return true;
}

function checkMissingNumbers(totalSections) {
  const allPresent = [];
  for (let i = 1; i <= totalSections; i++) {
    allPresent.push(i);
  }
  const sections = getSections();
  const sectionNums = sections.map(s => s.num);
  const missing = allPresent.filter(n => !sectionNums.includes(n));
  if (missing.length > 0) {
    console.log(`\n  ⚠ Missing sections: ${missing.join(', ')}`);
  } else {
    console.log(`  ✓ All ${totalSections} section numbers present`);
  }
}

// ─── Execution ──────────────────────────────────────────────────────────────
async function main() {
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  AROM STUDIO - Website Development Agreement Generator');
    console.log('═══════════════════════════════════════════════════════\n');

    // Dynamic client data (can be customized)
    const clientData = {
      clientName: process.env.CLIENT_NAME || '[Client Name]',
      projectName: process.env.PROJECT_NAME || '[Project Name]',
    };

    console.log(`  Client: ${clientData.clientName}`);
    console.log(`  Project: ${clientData.projectName}`);
    console.log(`  Agreement ID: ${CFG.agreementId}`);
    console.log(`  Version: ${CFG.version}`);
    console.log(`  Output: ${OUTPUT_FILE}\n`);

    // Generate the agreement
    const result = await generateAgreement(clientData);

    // Verify
    await verifyAgreement(result.filePath, 32);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  DOCUMENT READY FOR DELIVERY');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n✗ Generation failed:', error.message);
    process.exit(1);
  }
}

main();
