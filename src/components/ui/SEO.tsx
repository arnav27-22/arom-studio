import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOProps {
  title: string
  description: string
  ogImage?: string
  ogType?: string
  canonicalPath?: string
  jsonLd?: Record<string, unknown>
}

const BASE_URL = 'https://aromstudio.vercel.app'
const DEFAULT_OG_IMAGE = '/favicon.svg'
const SITE_NAME = 'AROM STUDIO'

const MANAGED_ATTRS = [
  { attr: 'name', value: 'description' },
  { attr: 'property', value: 'og:title' },
  { attr: 'property', value: 'og:description' },
  { attr: 'property', value: 'og:image' },
  { attr: 'property', value: 'og:url' },
  { attr: 'property', value: 'og:type' },
  { attr: 'property', value: 'og:site_name' },
  { attr: 'property', value: 'og:locale' },
  { attr: 'name', value: 'twitter:card' },
  { attr: 'name', value: 'twitter:title' },
  { attr: 'name', value: 'twitter:description' },
  { attr: 'name', value: 'twitter:image' },
] as const

export function SEO({ title, description, ogImage, ogType = 'website', canonicalPath, jsonLd }: SEOProps) {
  const { pathname } = useLocation()
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = `${BASE_URL}${canonicalPath || pathname}`
  const image = ogImage || DEFAULT_OG_IMAGE
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    cleanupRef.current?.()
    document.title = fullTitle

    const els: Element[] = []

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
      els.push(el)
    }

    setMeta('description', description)
    setMeta('og:title', fullTitle, true)
    setMeta('og:description', description, true)
    setMeta('og:image', `${BASE_URL}${image}`, true)
    setMeta('og:url', url, true)
    setMeta('og:type', ogType, true)
    setMeta('og:site_name', SITE_NAME, true)
    setMeta('og:locale', 'en_IN', true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)
    setMeta('twitter:image', `${BASE_URL}${image}`)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
    els.push(canonical)

    let schemaEl = document.querySelector('#schema-org')
    if (jsonLd) {
      if (!schemaEl) {
        schemaEl = document.createElement('script')
        schemaEl.setAttribute('id', 'schema-org')
        schemaEl.setAttribute('type', 'application/ld+json')
        document.head.appendChild(schemaEl)
      }
      schemaEl.textContent = JSON.stringify(jsonLd)
      els.push(schemaEl)
    } else if (schemaEl) {
      schemaEl.remove()
    }

    cleanupRef.current = () => {
      if (document.title === fullTitle) {
        document.title = SITE_NAME
      }
      MANAGED_ATTRS.forEach(({ attr, value }) => {
        const el = document.querySelector(`meta[${attr}="${value}"]`)
        el?.remove()
      })
      const link = document.querySelector('link[rel="canonical"]')
      if (link && link !== canonical) link.remove()
      const oldSchema = document.querySelector('#schema-org')
      if (oldSchema && oldSchema !== schemaEl) oldSchema.remove()
    }

    return cleanupRef.current
  }, [title, description, ogImage, ogType, url, image, jsonLd, fullTitle])

  return null
}
