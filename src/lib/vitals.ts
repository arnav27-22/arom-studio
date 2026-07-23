import { trackEvent } from './analytics'

interface MetricEntry {
  name: string
  value: number
}

export function reportWebVitals(onPerfEntry?: (metric: MetricEntry) => void) {
  if (typeof window !== 'undefined' && window.performance) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const metric = { name: entry.name, value: entry.startTime }
        trackEvent(entry.entryType, 'Core Web Vitals', entry.name, Math.round(entry.startTime))
        if (onPerfEntry) onPerfEntry(metric)
      })
    })
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
    } catch {
      // Fallback for browsers that do not support PerformanceObserver entryTypes
    }
  }
}
