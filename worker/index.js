import { DurableObject } from 'cloudflare:workers';

const ROOM_PATH = /^\/api\/scoreboard\/(\d{4})$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const roomMatch = url.pathname.match(ROOM_PATH);

    if (roomMatch) {
      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
        return new Response('WebSocket upgrade required', { status: 426 });
      }

      const roomId = env.SCOREBOARD_ROOMS.idFromName(roomMatch[1]);
      return env.SCOREBOARD_ROOMS.get(roomId).fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
};

export class ScoreboardRoom extends DurableObject {
  async fetch() {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);

    const snapshot = await this.ctx.storage.get('snapshot');
    if (snapshot) {
      server.send(JSON.stringify({ type: 'snapshot', snapshot }));
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(_socket, rawMessage) {
    if (typeof rawMessage !== 'string') return;

    let message;
    try {
      message = JSON.parse(rawMessage);
    } catch {
      return;
    }

    if (message.type !== 'snapshot' || !isMatchSnapshot(message.snapshot)) return;

    await this.ctx.storage.put('snapshot', message.snapshot);
    const encoded = JSON.stringify({ type: 'snapshot', snapshot: message.snapshot });

    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(encoded);
      } catch {
        // Closed sockets are removed by the runtime.
      }
    }
  }
}

function isMatchSnapshot(snapshot) {
  return (
    snapshot &&
    typeof snapshot === 'object' &&
    typeof snapshot.points?.left === 'number' &&
    typeof snapshot.points?.right === 'number' &&
    typeof snapshot.games?.left === 'number' &&
    typeof snapshot.games?.right === 'number'
  );
}
