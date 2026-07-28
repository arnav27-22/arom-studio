let __sessionId = ''
let __entryPage = ''
let __pageViewsCount = 0
let __sessionStart = 0
let scrollDepth = 0
let pageEnteredAt = Date.now()
let currentPage = ''

function getSessionId(): string {
  if (!__sessionId) {
    __sessionId = crypto.randomUUID()
    __sessionStart = Date.now()
    __pageViewsCount = 0
  }
  return __sessionId
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

export function initTracker() {
  currentPage = window.location.pathname
  if (!__entryPage) {
    __entryPage = currentPage || '/'
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
  if (!__entryPage) __entryPage = page || '/'
  __pageViewsCount++
  const sessionDuration = Math.max(1, Math.round((Date.now() - __sessionStart) / 1000))
  const devInfo = getDeviceInfo()

  fetch('/api/track/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page, referrer, sessionId: sessId,
      entryPage: __entryPage,
      pageViewsCount: __pageViewsCount,
      sessionDuration,
      deviceInfo: devInfo,
    }),
    keepalive: true,
  }).catch(() => {})
}

export function trackPageExit() {
  const timeOnPage = Math.round((Date.now() - pageEnteredAt) / 1000)
  fetch('/api/track/exit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: getSessionId(),
      page: currentPage,
      timeOnPage,
      scrollDepth,
    }),
    keepalive: true,
  }).catch(() => {})
}

export function trackClick(type: string, label: string) {
  const payload = { type, label, page: currentPage, sessionId: getSessionId() }
  fetch('/api/track/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}

export function trackPDFDownload(pdfType: string, storageKey: string, fileSizeKb: number = 0, pdfDataUrl?: string, clientName: string = 'Client', agreementId?: string, extra?: Record<string, any>) {
  const info = getDeviceInfo()
  const payload: Record<string, any> = {
    sessionId: getSessionId(),
    pdfType,
    fileSizeKb,
    storageKey,
    clientName,
    deviceType: info.deviceType,
    browser: info.browser,
    os: info.os,
    agreementId: agreementId || '',
  }
  if (pdfDataUrl) payload.pdfDataUrl = pdfDataUrl
  if (extra) {
    if (extra.email) payload.clientEmail = extra.email
    if (extra.phone) payload.phone = extra.phone
    if (extra.company) payload.company = extra.company
    if (extra.title) payload.title = extra.title
  }

  fetch('/api/track/save-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}

export function uploadPDF(docOrUrl: any, pdfType: string, storageKey: string, clientName: string = 'Client', agreementId?: string, extra?: Record<string, any>) {
  try {
    let dataUrl = ''
    if (typeof docOrUrl === 'string') {
      dataUrl = docOrUrl
    } else if (docOrUrl && typeof docOrUrl.output === 'function') {
      dataUrl = docOrUrl.output('datauristring')
    }
    const fileSizeKb = dataUrl ? Math.round(dataUrl.length / 1333) : 180
    trackPDFDownload(pdfType, storageKey, fileSizeKb, dataUrl, clientName, agreementId, extra)
  } catch (e) {
    console.error('Failed in uploadPDF:', e)
  }
}
