import { useEffect } from 'react'
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

export function SEO({ title, description, ogImage, ogType = 'website', canonicalPath, jsonLd }: SEOProps) {
  const { pathname } = useLocation()
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = `${BASE_URL}${canonicalPath || pathname}`
  const image = ogImage || DEFAULT_OG_IMAGE

  useEffect(() => {
    document.title = fullTitle

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', description)
    setMeta('og:title', fullTitle, true)
    setMeta('og:description', description, true)
    setMeta('og:image', `${BASE_URL}${image}`, true)
    setMeta('og:url', url, true)
    setMeta('og:type', ogType, true)
    setMeta('og:site_name', SITE_NAME, true)
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

    let schemaEl = document.querySelector('#schema-org')
    if (jsonLd) {
      if (!schemaEl) {
        schemaEl = document.createElement('script')
        schemaEl.setAttribute('id', 'schema-org')
        schemaEl.setAttribute('type', 'application/ld+json')
        document.head.appendChild(schemaEl)
      }
      schemaEl.textContent = JSON.stringify(jsonLd)
    } else if (schemaEl) {
      schemaEl.remove()
    }

    return () => {
      document.title = SITE_NAME
    }
  }, [title, description, ogImage, ogType, url, image, jsonLd, fullTitle])

  return null
}
