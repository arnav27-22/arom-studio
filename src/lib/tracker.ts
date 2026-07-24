import { recordAdminVisit, recordAdminPDF } from '../admin/adminStore'

const SESSION_KEY = 'arom_session_id'
const ENTRY_PAGE_KEY = 'arom_entry_page'
const PAGE_VIEWS_KEY = 'arom_page_views_count'
const SESSION_START_KEY = 'arom_session_start'

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2, 9)
    sessionStorage.setItem(SESSION_KEY, id)
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString())
    sessionStorage.setItem(PAGE_VIEWS_KEY, '0')
  }
  return id
}

function getDeviceInfo() {
  const ua = navigator.userAgent
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua)
  const tablet = /Tablet|iPad/i.test(ua) && !/Mobi/i.test(ua)
  return {
    deviceType: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop' as const,
    browser: (() => {
      if (ua.includes('Chrome')) return 'Chrome'
      if (ua.includes('Firefox')) return 'Firefox'
      if (ua.includes('Safari')) return 'Safari'
      if (ua.includes('Edge')) return 'Edge'
      return 'Other'
    })(),
    os: (() => {
      if (ua.includes('Windows')) return 'Windows'
      if (ua.includes('Mac')) return 'macOS'
      if (ua.includes('Linux')) return 'Linux'
      if (ua.includes('Android')) return 'Android'
      if (ua.includes('iOS')) return 'iOS'
      return 'Other'
    })(),
  }
}

let scrollDepth = 0
let pageEnteredAt = Date.now()
let currentPage = ''

export function initTracker() {
  currentPage = window.location.pathname
  if (!sessionStorage.getItem(ENTRY_PAGE_KEY)) {
    sessionStorage.setItem(ENTRY_PAGE_KEY, currentPage || '/')
  }

  document.addEventListener('scroll', () => {
    const docEl = document.documentElement
    const scrollTop = docEl.scrollTop || document.body.scrollTop
    const scrollHeight = docEl.scrollHeight - docEl.clientHeight
    scrollDepth = scrollHeight > 0 ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100)) : 100
  }, { passive: true })
}

export function trackPageView(page: string, referrer: string) {
  currentPage = page
  pageEnteredAt = Date.now()
  scrollDepth = 0

  const sessId = getSessionId()
  const entryPage = sessionStorage.getItem(ENTRY_PAGE_KEY) || page || '/'
  const pvCount = (parseInt(sessionStorage.getItem(PAGE_VIEWS_KEY) || '0', 10) + 1)
  sessionStorage.setItem(PAGE_VIEWS_KEY, pvCount.toString())

  const sessStart = parseInt(sessionStorage.getItem(SESSION_START_KEY) || Date.now().toString(), 10)
  const sessionDuration = Math.max(1, Math.round((Date.now() - sessStart) / 1000))
  const devInfo = getDeviceInfo()

  // Always record visit locally for admin dashboard analytics
  try {
    recordAdminVisit(page, referrer, {
      sessionId: sessId,
      entryPage,
      pageViewsCount: pvCount,
      sessionDuration,
      deviceType: devInfo.deviceType as 'desktop' | 'mobile' | 'tablet',
      browser: devInfo.browser,
      os: devInfo.os,
      isBounce: pvCount === 1 && sessionDuration < 10,
    })
  } catch (e) {
    console.error(e)
  }

  const payload = {
    page,
    referrer,
    sessionId: sessId,
    entryPage,
    pageViewsCount: pvCount,
    sessionDuration,
    deviceInfo: devInfo,
  }

  fetch('/api/track/pageview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {})
}

export function trackPageExit() {
  const timeOnPage = Math.round((Date.now() - pageEnteredAt) / 1000)
  const payload = {
    sessionId: getSessionId(),
    page: currentPage,
    timeOnPage,
    scrollDepth,
  }

  fetch('/api/track/exit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {})
}

export function trackClick(type: string, label: string) {
  const payload = { type, label, page: currentPage, sessionId: getSessionId() }
  fetch('/api/track/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {})
}

export function trackPDFDownload(pdfType: string, storageKey: string, fileSizeKb: number = 0, pdfDataUrl?: string, clientName: string = 'Client') {
  const info = getDeviceInfo()

  // Record PDF event persistently in Admin Store
  try {
    recordAdminPDF({
      pdfType,
      title: storageKey,
      clientName,
      fileSizeKb: fileSizeKb || 180,
      deviceType: info.deviceType,
      browser: info.browser,
      os: info.os,
      pdfDataUrl,
    })
  } catch (e) {
    console.error(e)
  }

  fetch('/api/pdfs/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: getSessionId(), pdfType, fileSizeKb, storageKey, deviceType: info.deviceType, browser: info.browser, os: info.os }),
    keepalive: true,
  }).catch(() => {})
}

export function uploadPDF(doc: any, pdfType: string, storageKey: string, clientName: string = 'Client') {
  try {
    const dataUrl = doc.output('datauristring')
    const fileSizeKb = Math.round(dataUrl.length / 1333)
    trackPDFDownload(pdfType, storageKey, fileSizeKb, dataUrl, clientName)
  } catch (e) {
    console.error(e)
  }
}
