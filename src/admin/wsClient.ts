type WSEventHandler = (data: any) => void
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

class AdminWebSocketClient {
  private ws: WebSocket | null = null
  private handlers = new Map<string, Set<WSEventHandler>>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private _status: ConnectionStatus = 'disconnected'
  private destroyed = false
  private statusListeners = new Set<(status: ConnectionStatus) => void>()

  get connected(): boolean {
    return this._status === 'connected'
  }

  get connectionStatus(): ConnectionStatus {
    return this._status
  }

  onStatusChange(fn: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(fn)
    return () => this.statusListeners.delete(fn)
  }

  private setStatus(s: ConnectionStatus) {
    if (this._status === s) return
    this._status = s
    this.statusListeners.forEach(fn => fn(s))
  }

  private wsUrl(): string {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${location.host}/ws`
  }

  private async getAuthToken(): Promise<string | null> {
    const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]*)/)
    if (match) return match[1]
    try {
      const res = await fetch('/api/admin/auth/ws-token', { credentials: 'include' })
      if (res.ok) {
        const body = await res.json()
        if (body?.token) return body.token
      }
    } catch {}
    return null
  }

  async connect() {
    if (this.destroyed) return
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return

    this.setStatus('connecting')

    const token = await this.getAuthToken()
    const url = token ? `${this.wsUrl()}?token=${encodeURIComponent(token)}` : this.wsUrl()

    try {
      this.ws = new WebSocket(url)
    } catch (err) {
      console.error('[WS] Constructor failed:', err)
      this.setStatus('disconnected')
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.setStatus('connected')
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const handlers = this.handlers.get(msg.type)
        if (handlers) handlers.forEach(fn => fn(msg.data))
        const wildcard = this.handlers.get('*')
        if (wildcard) wildcard.forEach(fn => fn(msg))
      } catch (err) {
        console.error('[WS] Parse error:', err)
      }
    }

    this.ws.onclose = (event) => {
      this.stopHeartbeat()
      this.setStatus('disconnected')
      console.warn(`[WS] Closed code=${event.code} reason=${event.reason}`)
      if (!this.destroyed) this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 25000)
  }

  private stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    const delays = [1000, 2000, 4000, 8000, 16000, 30000]
    const delay = delays[Math.min(this.reconnectAttempts, delays.length - 1)]
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  on(event: string, handler: WSEventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
  }

  off(event: string, handler: WSEventHandler) {
    this.handlers.get(event)?.delete(handler)
  }

  emit(event: string, data?: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, data }))
    }
  }

  disconnect() {
    this.destroyed = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
    this.setStatus('disconnected')
  }
}

export const adminWS = new AdminWebSocketClient()

if (typeof window !== 'undefined') {
  adminWS.connect()
}
