import { Response } from 'express';
import { Wish } from '../src/types.js';

interface SseClient {
  id: string;
  res: Response;
}

const clients: SseClient[] = [];

export function addSseClient(id: string, res: Response): void {
  clients.push({ id, res });

  // Clean up on disconnect
  res.on('close', () => {
    const index = clients.findIndex((c) => c.id === id);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
}

export function broadcastNewWish(wish: Wish): void {
  const data = JSON.stringify({ type: 'new_wish', wish });
  for (const client of clients) {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  }
}

export function broadcastWishUpdate(wish: Wish): void {
  const data = JSON.stringify({ type: 'update_wish', wish });
  for (const client of clients) {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  }
}

// Heartbeat every 25 seconds to keep proxies from terminating idle connections
setInterval(() => {
  for (const client of clients) {
    try {
      client.res.write(': keep-alive\n\n');
    } catch {
      // client disconnected
    }
  }
}, 25000);
