type WSEventHandler = (data: any) => void

class AdminWebSocketClient {
  private ws: WebSocket | null = null
  private handlers = new Map<string, Set<WSEventHandler>>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private url: string

  constructor() {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    this.url = `${proto}//${location.hostname}:3001`
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer)
          this.reconnectTimer = null
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          const eventHandlers = this.handlers.get(msg.type)
          if (eventHandlers) {
            eventHandlers.forEach(fn => fn(msg.data))
          }
          const wildcardHandlers = this.handlers.get('*')
          if (wildcardHandlers) {
            wildcardHandlers.forEach(fn => fn(msg))
          }
        } catch { }
      }

      this.ws.onclose = () => {
        this.scheduleReconnect()
      }

      this.ws.onerror = () => {
        this.ws?.close()
      }
    } catch {
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, 5000)
  }

  on(event: string, handler: WSEventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  off(event: string, handler: WSEventHandler) {
    this.handlers.get(event)?.delete(handler)
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }
}

export const adminWS = new AdminWebSocketClient()

if (typeof window !== 'undefined') {
  adminWS.connect()
}
