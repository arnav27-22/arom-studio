const SESSION_KEY = 'arom_session_id'

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function getDeviceInfo() {
  const ua = navigator.userAgent
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua)
  const tablet = /Tablet|iPad/i.test(ua) && !/Mobi/i.test(ua)
  return {
    deviceType: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop',
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

  const payload = {
    page,
    referrer,
    sessionId: getSessionId(),
    deviceInfo: getDeviceInfo(),
  }

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/track/pageview', JSON.stringify(payload))
  } else {
    fetch('/api/track/pageview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true })
  }
}

export function trackPageExit() {
  const timeOnPage = Math.round((Date.now() - pageEnteredAt) / 1000)
  const payload = {
    sessionId: getSessionId(),
    page: currentPage,
    timeOnPage,
    scrollDepth,
  }

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/track/exit', JSON.stringify(payload))
  } else {
    fetch('/api/track/exit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true })
  }
}

export function trackClick(type: string, label: string) {
  const payload = { type, label, page: currentPage, sessionId: getSessionId() }
  fetch('/api/track/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true })
}
