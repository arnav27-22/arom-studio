import jsPDF from 'jspdf'
import { createDoc, getPageLayout, addCoverPage, finalizeDoc, applyContentPageHeaders, today, type PageLayout } from './professionalPDF'

export interface AgreementData {
  clientName: string
  clientAddress: string
  clientEmail: string
  clientPhone: string
  projectDescription: string
  timeline: string
  selectedServices: string[]
  advancePercentage: string
  finalPercentage: string
  supportPeriod: string
  effectiveDate: string
  agreementId: string
  referenceNumber: string
  agreedSections?: Record<string, boolean>
  agreedDeclaration?: boolean
}

const BRAND = {
  name: 'AROM Studio',
  nameUpper: 'AROM STUDIO',
  email: 'aromstudio27@gmail.com',
  phone: '+91 8767990061',
  url: 'https://arom-studio.vercel.app',
  primary: { r: 78, g: 133, b: 191 },
  dark: { r: 30, g: 30, b: 35 },
  mid: { r: 60, g: 60, b: 70 },
  light: { r: 120, g: 120, b: 130 },
  muted: { r: 200, g: 200, b: 210 },
}

const PARAGRAPH_LINE_H = 6.5
const SECTION_SPACING = 14
const PARAGRAPH_SPACING = 3

function formatDate(iso: string): string {
  if (!iso) return today()
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return iso
  }
}

function checkPageBreak(doc: jsPDF, layout: PageLayout, y: number, needed: number): number {
  if (y + needed > layout.contentBottom) {
    doc.addPage()
    return layout.contentTop
  }
  return y
}

function writeAgreementSection(
  doc: jsPDF,
  y: number,
  sectionNum: string,
  title: string,
  paragraphs: string[],
  layout: PageLayout,
): number {
  const headingH = 14
  y = checkPageBreak(doc, layout, y, headingH)

  doc.setFillColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.rect(layout.marginLeft, y - 2, 2.5, 9, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.text(`${sectionNum}. ${title}`, layout.marginLeft + 6, y + 3.5)
  y += headingH

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)

  for (const para of paragraphs) {
    if (para === '') {
      y = checkPageBreak(doc, layout, y, PARAGRAPH_LINE_H)
      y += PARAGRAPH_SPACING
      continue
    }

    const isBullet = para.startsWith('  -') || para.startsWith('  •')
    const text = para.replace(/\*\*/g, '').trim().replace(/^[-•]\s*/, '')
    const wrapWidth = isBullet ? layout.contentWidth - 14 : layout.contentWidth
    const split = doc.splitTextToSize(text, wrapWidth)

    y = checkPageBreak(doc, layout, y, split.length * PARAGRAPH_LINE_H + 4)

    if (isBullet) {
      doc.setFontSize(5)
      doc.setTextColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
      doc.text('●', layout.marginLeft + 2, y + 1)
      doc.setFontSize(8.5)
      doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
      for (const s of split) {
        y = checkPageBreak(doc, layout, y, PARAGRAPH_LINE_H)
        doc.text(s, layout.marginLeft + 8, y)
        y += PARAGRAPH_LINE_H
      }
    } else {
      for (const s of split) {
        y = checkPageBreak(doc, layout, y, PARAGRAPH_LINE_H)
        doc.text(s, layout.marginLeft, y)
        y += PARAGRAPH_LINE_H
      }
    }

    y += PARAGRAPH_SPACING
  }

  y += SECTION_SPACING
  return y
}

function writeDeclarationSection(
  doc: jsPDF,
  y: number,
  layout: PageLayout,
  data: AgreementData,
  effDate: string
): number {
  const needed = 90
  y = checkPageBreak(doc, layout, y, needed)

  doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.setLineWidth(0.5)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text('Client Declaration', layout.marginLeft, y)
  y += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)

  const checkboxTexts = [
    'I confirm that I have carefully read this Website Development Agreement.',
    'I understand all terms and conditions.',
    'I voluntarily agree to this Agreement.',
    'I confirm that the information provided is accurate.',
  ]

  for (let i = 0; i < checkboxTexts.length; i++) {
    const bx = layout.marginLeft + 1
    const by = y
    doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
    doc.setLineWidth(0.5)
    doc.rect(bx, by, 4.5, 4.5, 'S')
    doc.setLineWidth(0.7)
    doc.line(bx + 1, by + 3, bx + 2, by + 4)
    doc.line(bx + 2, by + 4, bx + 4, by + 1)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(BRAND.mid.r, BRAND.mid.g, BRAND.mid.b)
    doc.text(checkboxTexts[i], bx + 9, y + 3.5)
    y += 8
  }

  y += 4

  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(BRAND.dark.r, BRAND.dark.g, BRAND.dark.b)
  doc.text(`Client Name: ${data.clientName}`, layout.marginLeft, y)
  y += 7
  if (data.clientEmail) {
    doc.text(`Email: ${data.clientEmail}`, layout.marginLeft, y)
    y += 7
  }
  doc.text(`Date: ${effDate}`, layout.marginLeft, y)
  y += 7
  if (data.referenceNumber) {
    doc.text(`Reference: ${data.referenceNumber}`, layout.marginLeft, y)
    y += 7
  }

  y += 4

  doc.setDrawColor(BRAND.primary.r, BRAND.primary.g, BRAND.primary.b)
  doc.setLineWidth(0.5)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 8

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  const declNote = 'This Agreement was accepted electronically through the AROM Studio Client Portal. The checked confirmations above serve as the Client\'s binding acceptance.'
  const wrapped = doc.splitTextToSize(declNote, layout.contentWidth)
  for (const w of wrapped) {
    doc.text(w, layout.marginLeft, y)
    y += 4.5
  }
  y += 8

  return y
}

function writeContactFooter(doc: jsPDF, y: number, layout: PageLayout): number {
  y = checkPageBreak(doc, layout, y, 16)
  doc.setDrawColor(BRAND.muted.r, BRAND.muted.g, BRAND.muted.b)
  doc.setLineWidth(0.3)
  doc.line(layout.marginLeft, y, layout.marginLeft + layout.contentWidth, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(BRAND.light.r, BRAND.light.g, BRAND.light.b)
  doc.text(`${BRAND.nameUpper}  |  ${BRAND.email}  |  ${BRAND.phone}  |  ${BRAND.url}`, layout.marginLeft, y)
  y += 10
  return y
}

const SECTIONS: { num: string; title: string; paragraphs: string[] }[] = [
  {
    num: '1', title: 'Parties',
    paragraphs: [
      'This Website Development Agreement ("Agreement") is entered into between AROM Studio, having its principal place of business at the address provided on the proposal ("Agency"), and the Client identified in the project proposal ("Client").',
      'The Agency and the Client may each be referred to individually as a "Party" and collectively as the "Parties."',
      'This Agreement becomes effective from the Effective Date set forth below.',
    ],
  },
  {
    num: '2', title: 'Definitions',
    paragraphs: [
      '"Agreement" means this Website Development Agreement, including all schedules, annexures, and the Project Proposal referenced herein.',
      '"Client" means the individual or entity engaging AROM Studio for the provision of Services under this Agreement.',
      '"Agency" means AROM Studio, the service provider responsible for delivering the Services as described in this Agreement.',
      '"Deliverables" means the specific work products, including designed web pages, developed functionality, source files, and assets, to be delivered by the Agency to the Client as specified in the Proposal.',
      '"Project" means the website design and development project described in the Proposal, including all associated tasks, milestones, and Deliverables.',
      '"Services" means all work to be performed by the Agency for the Client under this Agreement, as more particularly described in the Scope of Work and Proposal.',
      '"Website" means the final website or web application developed by the Agency for the Client as part of the Project.',
      '"Content" means all text, images, videos, graphics, logos, and other materials provided by the Client for use in the Website.',
      '"Intellectual Property" means all patents, copyrights, trademarks, trade secrets, and other proprietary rights in any work product created under this Agreement.',
      '"Confidential Information" means any non-public information disclosed by one Party to the other, including business strategies, technical data, source code, and client lists.',
      '"Effective Date" means the date on which this Agreement becomes binding, as set forth in Section 1.',
    ],
  },
  {
    num: '3', title: 'Project Overview',
    paragraphs: [
      'The Client has engaged AROM Studio to design, develop, and deliver a website or web application as more fully described in the Project Proposal provided to the Client.',
      'The Agency agrees to apply its professional expertise and creative resources to fulfill the objectives of the Project in accordance with the terms of this Agreement.',
      'The Client acknowledges that the final output may vary from initial concepts based on technical feasibility, content availability, and mutual decisions made during the development process.',
      'This Agreement, together with the Proposal, sets forth the complete understanding between the Parties with respect to the Project.',
    ],
  },
  {
    num: '4', title: 'Scope of Work',
    paragraphs: [
      'The Agency agrees to provide the Services as defined in the Project Proposal, which may include website design, development, responsive design, e-commerce functionality, CMS integration, SEO optimization, and deployment.',
      'The Services shall be performed in a professional and workmanlike manner consistent with industry standards and best practices.',
      'Any work not expressly listed in the Proposal shall be considered outside the Scope of Work and shall require a separate written agreement and additional compensation.',
      'The Agency reserves the right to adjust the technical approach to the Services as needed to achieve the Project objectives, provided that such adjustments do not materially alter the agreed Deliverables.',
    ],
  },
  {
    num: '5', title: 'Deliverables',
    paragraphs: [
      'Upon completion of the Services and subject to full payment, the Agency shall deliver to the Client the Deliverables specified in the Project Proposal.',
      'Deliverables may include designed web pages, developed website functionality, source code files, graphic assets, documentation, and any other items expressly identified in the Proposal.',
      'All Deliverables shall be provided in digital format via a mutually agreed method of transfer, such as email, cloud storage, or direct handover of access credentials.',
      'The Client shall have the opportunity to review the Deliverables during the revision period and request reasonable corrections to ensure conformity with the agreed specifications.',
      'Deliverables are considered accepted upon the Client\'s written approval or upon deployment of the Website to a live environment with the Client\'s knowledge and consent.',
    ],
  },
  {
    num: '6', title: 'Timeline',
    paragraphs: [
      'The estimated duration for completion of the Project shall be agreed upon between the Parties and set forth in the Proposal.',
      'The Agency shall make reasonable efforts to adhere to the estimated timeline; however, delays caused by the Client, third-party services, or unforeseen technical challenges may extend the Project schedule.',
      'Any significant change to the Project scope requested after work has commenced may result in an adjusted timeline, which shall be communicated to the Client in writing.',
      'The Agency shall keep the Client informed of progress and any anticipated delays on a regular basis throughout the duration of the Project.',
      'Both Parties agree to work in good faith to minimize delays and to adjust the timeline as necessary to accommodate changing circumstances.',
    ],
  },
  {
    num: '7', title: 'Client Responsibilities',
    paragraphs: [
      'The Client agrees to provide all necessary Content, including text, images, videos, logos, brand colors, and any other materials required for the development of the Website, in a timely manner.',
      'The Client shall provide access to any existing domain registrations, hosting accounts, social media profiles, and third-party service accounts as may be required for the completion of the Project.',
      'The Client is responsible for reviewing all work in progress and providing timely feedback, approvals, or revision requests within the timeframes communicated by the Agency.',
      'The Client warrants that all Content provided to the Agency is accurate, complete, and legally owned or licensed for use in the Website, and that the Agency\'s use of such Content will not infringe upon the rights of any third party.',
      'Failure to fulfill these responsibilities in a timely manner may result in Project delays, for which the Agency shall not be held liable.',
    ],
  },
  {
    num: '8', title: 'Agency Responsibilities',
    paragraphs: [
      'The Agency agrees to perform all Services with reasonable skill, care, and diligence, and in accordance with the specifications and requirements set forth in the Proposal.',
      'The Agency shall communicate regularly with the Client regarding Project progress, milestones achieved, and any issues or delays that may arise during the course of the Project.',
      'The Agency shall meet all agreed-upon deadlines to the best of its ability and shall notify the Client promptly if any deadline is at risk of being missed.',
      'The Agency shall maintain high standards of quality in all Deliverables and shall ensure that the Website is developed in accordance with current web standards and best practices.',
      'The Agency reserves the right to determine the technical means and methods by which the Services are performed, provided that the final Deliverables conform to the agreed specifications.',
    ],
  },
  {
    num: '9', title: 'Payment Terms',
    paragraphs: [
      'The Client agrees to pay the Agency the total Project fee as set forth in the Proposal. An advance payment shall be due before work commences, and the remaining balance shall be due prior to final delivery or deployment of the Website.',
      'All payments shall be made in the currency specified in the Proposal and shall be free of any deductions, setoffs, or withholding taxes unless required by law.',
      'If any payment is not received by the due date, the Agency reserves the right to pause all work on the Project until the outstanding amount is settled in full.',
      'Payments delayed by more than seven calendar days may result in a revised timeline, and the Agency shall not be liable for any consequences arising from such delays.',
      'The Agency shall provide invoices for all payments due, and the Client shall make payments to the account or payment method specified on the invoice.',
    ],
  },
  {
    num: '10', title: 'Additional Work',
    paragraphs: [
      'Any work requested by the Client that falls outside the Scope of Work defined in the Proposal, including additional pages, new features, major design changes, third-party integrations, or functional modifications, shall be considered Additional Work.',
      'The Agency shall provide a written quotation for any Additional Work before commencing it, and the Client\'s written approval of the quotation shall be required before such work begins.',
      'Additional Work shall be billed separately at the Agency\'s then-current rates, and payment terms for such work shall be as agreed upon in the relevant quotation.',
      'No claim for Additional Work shall be valid unless confirmed in writing by both Parties, and the Agency shall not be obligated to perform any work for which a written agreement has not been reached.',
    ],
  },
  {
    num: '11', title: 'Revisions',
    paragraphs: [
      'The Client shall be entitled to a reasonable number of revision rounds as specified in the Proposal, during which the Client may request changes to the design and functionality of the Website.',
      'For Basic tier projects, up to two revision rounds are included; for Standard tier projects, up to three revision rounds are included; and for Premium tier projects, revisions are unlimited until design approval is granted.',
      'A revision is defined as a request to modify existing work within the agreed Scope of Work. Requests that introduce new features, pages, or functionality beyond the original scope shall be treated as Additional Work.',
      'The Agency shall make every effort to accommodate reasonable revision requests within the agreed limits, and the Client agrees to provide clear and consolidated feedback to minimize the number of revision cycles.',
    ],
  },
  {
    num: '12', title: 'Communication',
    paragraphs: [
      'The Parties agree to maintain open and timely communication throughout the duration of the Project using mutually agreed methods, which may include email, WhatsApp, Google Meet, Zoom, or phone calls.',
      'The Client should provide feedback, approvals, and decisions within five business days of receiving a request from the Agency, unless a different timeframe is mutually agreed upon.',
      'If the Client does not respond to Agency communications for a period of ten consecutive business days, the Agency may place the Project on hold until communication resumes, and the timeline shall be extended accordingly.',
      'The Agency shall designate a primary point of contact for the Client, and the Client shall designate a primary point of contact with authority to make decisions and provide approvals on behalf of the Client.',
      'All formal notices under this Agreement shall be sent in writing to the email addresses provided by each Party.',
    ],
  },
  {
    num: '13', title: 'Domain and Hosting',
    paragraphs: [
      'Unless expressly included in the Proposal, domain name registration and web hosting services are the sole responsibility of the Client and shall be procured and paid for by the Client directly.',
      'If the Agency agrees to assist the Client with domain registration or hosting setup, any third-party fees, renewal charges, or incidental costs shall be billed to the Client separately.',
      'The Agency shall not be liable for any downtime, data loss, or service interruptions arising from the Client\'s choice of hosting provider or domain registrar.',
      'The Client is responsible for maintaining valid domain registration and hosting accounts for the Website after launch, and the Agency shall have no obligation to host or maintain the Website unless a separate hosting or maintenance agreement is in place.',
    ],
  },
  {
    num: '14', title: 'Third-Party Services',
    paragraphs: [
      'The Agency may utilize third-party tools, plugins, libraries, frameworks, and services as part of the development process, including but not limited to content management systems, e-commerce platforms, payment gateways, and analytics services.',
      'Any costs associated with third-party services, including license fees, subscription charges, or usage fees, shall be communicated to the Client in advance and billed at cost unless otherwise agreed.',
      'The Agency shall not be liable for any failure, downtime, security breach, or data loss caused by third-party services or platforms that are outside the Agency\'s control.',
      'The Client acknowledges that third-party services may have their own terms of service and privacy policies, and the Client agrees to be bound by such terms where applicable.',
    ],
  },
  {
    num: '15', title: 'Intellectual Property',
    paragraphs: [
      'Upon receipt of full payment for all Services rendered under this Agreement, the Agency hereby assigns to the Client all rights, title, and interest in and to the final Deliverables specifically created for the Project.',
      'The Agency retains full ownership of its pre-existing tools, reusable code libraries, templates, frameworks, design systems, development methodologies, and any intellectual property created prior to or independently of this Agreement.',
      'Nothing in this Agreement shall be construed to grant the Client any license or rights to the Agency\'s retained intellectual property unless a separate written agreement is executed between the Parties.',
      'The Client agrees not to reverse engineer, decompile, or otherwise derive the source code of any proprietary tools or libraries provided by the Agency as part of the Deliverables.',
      'The Agency warrants that the Deliverables, to the best of its knowledge, do not infringe upon the intellectual property rights of any third party.',
    ],
  },
  {
    num: '16', title: 'Confidentiality',
    paragraphs: [
      'Both Parties agree to maintain the confidentiality of all Confidential Information disclosed during the course of the Project and to use such information solely for the purpose of performing obligations under this Agreement.',
      'Confidential Information shall include, but not be limited to, business strategies, financial data, technical specifications, source code, passwords, client lists, project files, and any other information designated as confidential by either Party.',
      'Neither Party shall disclose Confidential Information to any third party without the prior written consent of the disclosing Party, except as required by applicable law or court order.',
      'The obligation of confidentiality shall survive the termination or expiration of this Agreement for a period of three years from the date of termination or expiration.',
      'This section shall not apply to information that is or becomes publicly available through no fault of the receiving Party, or information that was independently developed without reference to the disclosing Party\'s Confidential Information.',
    ],
  },
  {
    num: '17', title: 'Cancellation',
    paragraphs: [
      'Either Party may cancel this Agreement at any time by providing written notice to the other Party, subject to the terms set forth in this section.',
      'In the event of cancellation, the Client shall pay for all work completed by the Agency up to the date of cancellation, calculated based on the proportion of the Project completed or at the Agency\'s hourly rate, whichever is applicable.',
      'Any advance payment made by the Client shall be applied to the work completed, and any portion of the advance exceeding the value of work completed shall be refunded to the Client within 30 days of cancellation.',
      'If the advance payment is less than the value of work completed, the Client shall pay the difference within 15 days of receiving an invoice from the Agency.',
      'Deliverables completed up to the date of cancellation shall be provided to the Client only after all outstanding payments have been settled in full.',
    ],
  },
  {
    num: '18', title: 'Website Launch',
    paragraphs: [
      'The Website shall be deployed and made publicly accessible only after all of the following conditions have been satisfied: final written approval of the Website by the Client, receipt of all outstanding payments in full, and provision of all necessary access credentials for domain and hosting if applicable.',
      'The Agency shall coordinate the deployment process and shall provide the Client with instructions and documentation required to access and manage the Website after launch.',
      'Upon deployment, the Agency shall conduct a final verification to confirm that the Website is functioning correctly in the live environment, to the extent that the live environment is accessible and configurable by the Agency.',
      'The Client acknowledges that once the Website is deployed to a live environment, any further modifications shall be subject to the terms governing Additional Work or Maintenance as set forth in this Agreement.',
    ],
  },
  {
    num: '19', title: 'Warranty',
    paragraphs: [
      'The Agency warrants that the Deliverables will conform to the specifications set forth in the Proposal and will be free from material defects in coding and functionality for a period of 30 days from the date of delivery or deployment (the "Warranty Period").',
      'During the Warranty Period, the Agency shall correct any bugs, errors, or non-conformities in the Deliverables at no additional cost to the Client, provided that such issues are reported by the Client in writing with sufficient detail to allow reproduction.',
      'The warranty does not cover issues arising from modifications made by the Client or by third parties, changes to third-party software or platforms, or any use of the Website in a manner inconsistent with its intended purpose.',
      'The Agency\'s sole obligation under this warranty is to repair or replace the non-conforming Deliverables, and the Client\'s sole remedy is the performance of such repair or replacement.',
      'This warranty is in lieu of all other warranties, express or implied, including any warranties of merchantability or fitness for a particular purpose.',
    ],
  },
  {
    num: '20', title: 'Maintenance',
    paragraphs: [
      'After the Warranty Period expires, ongoing maintenance and support services may be provided under a separate Maintenance Agreement to be executed by both Parties.',
      'Maintenance services, if agreed, may include bug fixes, security updates, minor content changes, performance monitoring, and technical support, as defined in the Maintenance Agreement.',
      'Maintenance services shall not include major feature additions, redesigns, new page creation, or third-party plugin updates, which shall be treated as Additional Work under Section 10.',
      'If no separate Maintenance Agreement is in place, the Agency shall have no obligation to provide any maintenance or support services after the Warranty Period.',
      'The Client may request maintenance services on an ad hoc basis, and such services shall be billed at the Agency\'s then-current hourly rates.',
    ],
  },
  {
    num: '21', title: 'Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by applicable law, the Agency shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to this Agreement, including but not limited to loss of revenue, loss of profits, loss of data, or business interruption.',
      'The Agency shall not be responsible for any damages, losses, or costs arising from third-party hosting failures, domain provider issues, payment gateway outages, search engine ranking changes, or any actions taken by the Client or third parties after the Website has been delivered.',
      'The Agency shall not be liable for any security breaches, cyberattacks, or data loss caused by vulnerabilities in third-party systems, the Client\'s hosting environment, or factors beyond the Agency\'s reasonable control.',
      'The Client acknowledges that search engine rankings are influenced by numerous factors outside the Agency\'s control, and the Agency makes no guarantees regarding specific ranking outcomes.',
      'In no event shall the Agency\'s total liability under this Agreement exceed the total amount paid by the Client to the Agency under this Agreement.',
    ],
  },
  {
    num: '22', title: 'Portfolio Rights',
    paragraphs: [
      'Unless the Client specifically requests confidentiality in writing at or before the time of project completion, the Agency reserves the right to showcase the completed Website in its portfolio, on its own website, and on social media platforms for promotional and marketing purposes.',
      'Portfolio display may include screenshots, case studies, descriptions of the work performed, and attribution of the project to the Client.',
      'If the Client requests confidentiality, the Agency shall not publicly display the project, provided that such request is made in writing prior to the Agency\'s use of the project for promotional purposes.',
      'The Agency may also include the project in internal records, award submissions, and anonymized case studies even if confidentiality is requested, provided that no identifying Client information is disclosed.',
    ],
  },
  {
    num: '23', title: 'Force Majeure',
    paragraphs: [
      'Neither Party shall be held liable for any failure or delay in performing its obligations under this Agreement if such failure or delay is caused by events beyond that Party\'s reasonable control, including but not limited to acts of God, natural disasters, war, civil unrest, government actions, public health emergencies, pandemics, internet outages, telecommunications failures, power outages, or strikes.',
      'The affected Party shall promptly notify the other Party in writing of the occurrence of any force majeure event and shall use reasonable efforts to mitigate the impact of such event on the performance of its obligations.',
      'If a force majeure event continues for a period of more than 30 days, either Party may terminate this Agreement upon written notice to the other Party without further liability, except that the Client shall pay for all work completed up to the date of termination.',
    ],
  },
  {
    num: '24', title: 'Governing Law',
    paragraphs: [
      'This Agreement shall be governed by and construed in accordance with the laws of India, without regard to its conflict of laws principles.',
      'The Parties agree that any legal proceedings arising out of or relating to this Agreement shall be brought exclusively in the courts located in the jurisdiction where AROM Studio is registered, unless otherwise mutually agreed in writing.',
      'Before commencing any legal proceedings, the Parties shall first attempt to resolve any dispute through mutual discussion and negotiation in good faith for a period of at least 30 days.',
      'The United Nations Convention on Contracts for the International Sale of Goods shall not apply to this Agreement.',
    ],
  },
  {
    num: '25', title: 'Dispute Resolution',
    paragraphs: [
      'Any dispute, controversy, or claim arising out of or relating to this Agreement shall be resolved through the following escalation process: first, through informal negotiation between the Parties; second, if not resolved within 30 days, through mediation by a mutually agreed neutral mediator; and third, if still not resolved, through binding arbitration or court proceedings as provided in Section 24.',
      'The Parties agree to participate in the negotiation and mediation process in good faith before resorting to litigation.',
      'The costs of mediation and arbitration shall be borne equally by the Parties unless otherwise agreed, and each Party shall bear its own legal costs.',
      'This dispute resolution process shall not prevent either Party from seeking injunctive relief from a court of competent jurisdiction to protect its intellectual property or confidential information.',
    ],
  },
  {
    num: '26', title: 'Privacy',
    paragraphs: [
      'The Agency collects, processes, and stores personal information provided by the Client solely for the purposes of performing the Services under this Agreement, communicating with the Client, and complying with legal obligations.',
      'The Agency implements reasonable technical and organizational measures to protect the Client\'s personal information from unauthorized access, disclosure, alteration, or destruction.',
      'The Agency does not sell, trade, rent, or transfer the Client\'s personal information to third parties for their marketing purposes without the Client\'s explicit consent.',
      'The Client\'s personal information may be shared with trusted third-party service providers who assist the Agency in operating its business and delivering Services, provided that such providers agree to maintain the confidentiality of the information.',
      'The Client may request access to, correction of, or deletion of its personal information held by the Agency by submitting a written request to the Agency\'s contact email.',
    ],
  },
  {
    num: '27', title: 'Browser Support',
    paragraphs: [
      'The Agency warrants that the Website shall be designed and developed to function correctly on the latest two major versions of the following web browsers: Google Chrome, Mozilla Firefox, Apple Safari, and Microsoft Edge.',
      'The Website may not render or function as intended on older browser versions, discontinued browsers, or browsers not listed above, including Internet Explorer.',
      'The Agency shall make reasonable efforts to ensure cross-browser compatibility within the scope of the supported browsers, but cannot guarantee identical visual rendering across all browsers due to inherent differences in browser rendering engines.',
      'Mobile browser compatibility is limited to the latest two major versions of Safari on iOS and Chrome on Android, unless broader support is specified in the Proposal.',
    ],
  },
  {
    num: '28', title: 'SEO Disclaimer',
    paragraphs: [
      'The Agency may perform search engine optimization (SEO) services as part of the Project, including on-page optimization, meta-tagging, keyword research, content recommendations, and technical SEO improvements.',
      'The Client acknowledges and agrees that search engine rankings are influenced by a wide range of factors beyond the Agency\'s control, including but not limited to search engine algorithm changes, competitor activity, content quality, backlink profiles, and user engagement metrics.',
      'The Agency makes no guarantees, express or implied, regarding specific search engine ranking positions, traffic volumes, or other performance metrics, and past performance does not guarantee future results.',
      'The Agency shall perform SEO services in accordance with industry best practices and ethical guidelines, and shall not engage in any practices that may result in penalties from search engines.',
      'The Client understands that SEO is an ongoing process and that maintaining or improving rankings may require continued effort beyond the scope of this Agreement.',
    ],
  },
  {
    num: '29', title: 'Security Disclaimer',
    paragraphs: [
      'The Agency shall implement industry-standard security best practices in the development of the Website, including but not limited to input validation, output encoding, secure authentication mechanisms, and protection against common web vulnerabilities such as those described in the OWASP Top 10.',
      'The Agency shall take reasonable steps to secure the Website against known threats at the time of development, including secure coding practices, regular updates of core software, and the use of security plugins or tools where appropriate.',
      'The Client acknowledges that no website or web application can be guaranteed to be completely secure against all potential threats, including zero-day exploits, targeted attacks, or vulnerabilities introduced by third-party software or the Client\'s hosting environment.',
      'The Agency shall not be liable for any security breaches, data loss, or damages resulting from attacks or vulnerabilities that were not known or reasonably foreseeable at the time of development.',
      'The Client is encouraged to implement additional security measures, including regular backups, SSL certificates, web application firewalls, and security monitoring.',
    ],
  },
  {
    num: '30', title: 'Electronic Signatures',
    paragraphs: [
      'The Client\'s acceptance of this Agreement through the AROM Studio Client Portal, including by clicking "I Agree" or by making the agreed advance payment after reviewing the proposal, shall constitute a legally binding electronic signature and acceptance of all terms and conditions contained herein.',
      'The Parties agree that electronic signatures and digital acceptances shall have the same legal force and effect as handwritten signatures and shall be admissible as evidence in any legal proceeding.',
      'The Client acknowledges that no handwritten or physical signature is required for this Agreement to be binding, and that the records of acceptance maintained by the Agency shall be conclusive evidence of the Client\'s agreement.',
      'Either Party may request a physically signed copy of this Agreement at any time, and the other Party shall promptly provide such a copy upon request.',
    ],
  },
  {
    num: '31', title: 'Entire Agreement',
    paragraphs: [
      'This Agreement, together with the Project Proposal and any schedules or annexures referenced herein, constitutes the entire and exclusive agreement between the Parties with respect to the subject matter hereof.',
      'This Agreement supersedes all prior discussions, negotiations, understandings, representations, and agreements, whether written or oral, relating to the subject matter of this Agreement.',
      'No modification, amendment, or waiver of any provision of this Agreement shall be effective unless made in writing and signed by both Parties.',
      'If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.',
    ],
  },
  {
    num: '32', title: 'Contact Information',
    paragraphs: [
      'All communications, notices, and inquiries under this Agreement should be directed to AROM Studio at the contact information provided below.',
      'Agency Name: AROM Studio',
      'Email: aromstudio27@gmail.com',
      'Phone: +91 8767990061',
      'Website: https://arom-studio.vercel.app',
    ],
  },
]

export function buildAgreementPDF(data: AgreementData): jsPDF {
  const doc = createDoc()
  const layout = getPageLayout(doc)
  const effDate = formatDate(data.effectiveDate)

  addCoverPage(doc, {
    title: 'Website Development Agreement',
    subtitle: 'Professional Web Development Services',
    clientName: data.clientName || '[Client Name]',
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    date: effDate,
    reference: data.referenceNumber,
  })

  let y = layout.contentTop

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(30, 30, 35)
  doc.text('Website Development Agreement', layout.marginLeft, y)
  y += 10

  for (const section of SECTIONS) {
    y = writeAgreementSection(doc, y, section.num, section.title, section.paragraphs, layout)
  }

  y = writeDeclarationSection(doc, y, layout, data, effDate)
  y = writeContactFooter(doc, y, layout)

  finalizeDoc(doc, data.referenceNumber)
  applyContentPageHeaders(doc, 'Website Development Agreement')

  return doc
}
