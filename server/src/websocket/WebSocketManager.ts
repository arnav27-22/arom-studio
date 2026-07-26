import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import jwt from 'jsonwebtoken'
import { CONFIG } from '../config'
import { logger } from '../utils/logger'

interface ClientInfo {
  ws: WebSocket
  adminId: string
  role: string
  isAlive: boolean
  subscribedRooms: Set<string>
}

export class WebSocketManager {
  private wss: WebSocketServer | null = null
  private clients = new Map<string, ClientInfo>()
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' })

    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`)
      const token = url.searchParams.get('token')

      if (!token) {
        ws.close(4001, 'Authentication required')
        return
      }

      try {
        const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as { adminId: string; role: string }
        const clientId = `${decoded.adminId}_${Date.now()}`
        const client: ClientInfo = {
          ws,
          adminId: decoded.adminId,
          role: decoded.role,
          isAlive: true,
          subscribedRooms: new Set(['all']),
        }

        this.clients.set(clientId, client)
        logger.info('WebSocket client connected', { adminId: decoded.adminId, clientId })

        ws.on('pong', () => {
          client.isAlive = true
        })

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString())
            this.handleMessage(clientId, message)
          } catch {
            // Ignore invalid messages
          }
        })

        ws.on('close', () => {
          this.clients.delete(clientId)
          logger.info('WebSocket client disconnected', { adminId: decoded.adminId, clientId })
        })

        ws.on('error', (err) => {
          logger.error('WebSocket error', { adminId: decoded.adminId, error: err.message })
          this.clients.delete(clientId)
        })

        ws.send(JSON.stringify({ type: 'connected', clientId }))
      } catch {
        ws.close(4001, 'Invalid token')
      }
    })

    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, id) => {
        if (!client.isAlive) {
          client.ws.terminate()
          this.clients.delete(id)
          return
        }
        client.isAlive = false
        client.ws.ping()
      })
    }, 30000)

    logger.info('WebSocket server initialized')
  }

  private handleMessage(clientId: string, message: { type: string; room?: string }) {
    const client = this.clients.get(clientId)
    if (!client) return

    switch (message.type) {
      case 'subscribe':
        if (message.room) {
          client.subscribedRooms.add(message.room)
        }
        break
      case 'unsubscribe':
        if (message.room) {
          client.subscribedRooms.delete(message.room)
        }
        break
    }
  }

  broadcast(event: string, data: unknown, room?: string) {
    const payload = JSON.stringify({ type: event, data, timestamp: new Date().toISOString() })
    let sent = 0

    this.clients.forEach((client) => {
      if (!room || client.subscribedRooms.has(room)) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(payload)
          sent++
        }
      }
    })

    if (sent > 0) {
      logger.debug('WebSocket broadcast', { event, sent })
    }
  }

  broadcastToAll(event: string, data: unknown) {
    this.broadcast(event, data, 'all')
  }

  isHealthy(): boolean {
    return this.wss !== null
  }

  getClientCount(): number {
    return this.clients.size
  }

  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    this.clients.forEach((client) => {
      client.ws.close()
    })
    this.clients.clear()
    this.wss?.close()
    logger.info('WebSocket server shut down')
  }
}

export const wsManager = new WebSocketManager()
