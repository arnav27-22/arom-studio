import { useState, useEffect } from 'react'

interface GeoData {
  city: string | null
  region: string | null
  country: string | null
  loading: boolean
}

export function useUserCity(): GeoData {
  const [data, setData] = useState<GeoData>({
    city: null,
    region: null,
    country: null,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false

    fetch('https://ip-api.com/json/?fields=city,region,country,status')
      .then(res => res.json())
      .then(json => {
        if (cancelled) return
        if (json.status === 'success') {
          setData({
            city: json.city || null,
            region: json.region || null,
            country: json.country || null,
            loading: false,
          })
        } else {
          setData(prev => ({ ...prev, loading: false }))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(prev => ({ ...prev, loading: false }))
        }
      })

    return () => { cancelled = true }
  }, [])

  return data
}
