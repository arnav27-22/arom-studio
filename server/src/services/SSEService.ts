import { Response } from 'express'
import crypto from 'crypto'

interface SSEClient {
  id: string
  res: Response
}

class SSEService {
  private clients = new Map<string, SSEClient>()

  addClient(res: Response): string {
    const id = crypto.randomUUID()
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    })
    res.write('event: connected\ndata: {}\n\n')
    this.clients.set(id, { id, res })
    res.on('close', () => this.removeClient(id))
    return id
  }

  removeClient(id: string): void {
    this.clients.delete(id)
  }

  broadcast(event: string, data: unknown): void {
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    for (const [id, client] of this.clients) {
      try {
        client.res.write(msg)
      } catch {
        this.clients.delete(id)
      }
    }
  }

  getClientCount(): number {
    return this.clients.size
  }

  shutdown(): void {
    for (const [id, client] of this.clients) {
      try {
        client.res.end()
      } catch { /* ignore */ }
      this.clients.delete(id)
    }
  }
}

export const sseService = new SSEService()
