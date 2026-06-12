export const SCOREBOARD_STORAGE_KEY = 'itung-skor:scoreboard';
export const SCOREBOARD_CHANNEL_NAME = 'itung-skor:scoreboard';
const SCOREBOARD_ROOM_SESSION_KEY = 'itung-skor:scoreboard-room';
const controllerConnections = new Map();

function roomStorageKey(roomId) {
  return roomId ? `${SCOREBOARD_STORAGE_KEY}:${roomId}` : SCOREBOARD_STORAGE_KEY;
}

function roomChannelName(roomId) {
  return roomId ? `${SCOREBOARD_CHANNEL_NAME}:${roomId}` : SCOREBOARD_CHANNEL_NAME;
}

export function getOrCreateScoreboardRoomId() {
  try {
    const saved = window.sessionStorage.getItem(SCOREBOARD_ROOM_SESSION_KEY);
    if (saved) return saved;

    const roomId = createRoomId();
    window.sessionStorage.setItem(SCOREBOARD_ROOM_SESSION_KEY, roomId);
    return roomId;
  } catch {
    return createRoomId();
  }
}

export function getScoreboardRoomId(pathname = window.location.pathname) {
  const match = pathname.match(/^\/scoreboard\/(\d{4})\/?$/);
  return match?.[1] ?? null;
}

export function readScoreboardSnapshot(roomId = null) {
  try {
    const raw = window.localStorage.getItem(roomStorageKey(roomId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function publishScoreboardSnapshot(present, roomId = null) {
  try {
    window.localStorage.setItem(roomStorageKey(roomId), JSON.stringify(present));
  } catch {
    // BroadcastChannel or the remote room can still keep scoreboards in sync.
  }

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(roomChannelName(roomId));
    channel.postMessage(present);
    channel.close();
  }

  if (roomId) publishToRemoteRoom(roomId, present);
}

export function subscribeToScoreboard(callback, roomId = null) {
  function onStorage(event) {
    if (event.key !== roomStorageKey(roomId) || !event.newValue) return;

    try {
      callback(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed snapshots from stale browser storage.
    }
  }

  window.addEventListener('storage', onStorage);

  let channel = null;
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(roomChannelName(roomId));
    channel.addEventListener('message', (event) => callback(event.data));
  }

  const unsubscribeRemote = roomId ? subscribeToRemoteRoom(roomId, callback) : () => {};

  return () => {
    window.removeEventListener('storage', onStorage);
    channel?.close();
    unsubscribeRemote();
  };
}

function createRoomId() {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint16Array(1);
    globalThis.crypto.getRandomValues(value);
    return String(1000 + (value[0] % 9000));
  }

  return String(Math.floor(1000 + Math.random() * 9000));
}

function roomWebSocketUrl(roomId) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/scoreboard/${roomId}`;
}

function publishToRemoteRoom(roomId, snapshot) {
  if (!('WebSocket' in window)) return;

  let connection = controllerConnections.get(roomId);
  if (!connection) {
    connection = { socket: null, snapshot };
    controllerConnections.set(roomId, connection);
    connectController(roomId, connection);
  } else {
    connection.snapshot = snapshot;
  }

  if (connection.socket?.readyState === WebSocket.OPEN) {
    sendSnapshot(connection.socket, snapshot);
  }
}

function connectController(roomId, connection) {
  const socket = new WebSocket(roomWebSocketUrl(roomId));
  connection.socket = socket;

  socket.addEventListener('open', () => sendSnapshot(socket, connection.snapshot));
  socket.addEventListener('close', () => {
    if (controllerConnections.get(roomId) !== connection) return;
    window.setTimeout(() => connectController(roomId, connection), 1500);
  });
}

function sendSnapshot(socket, snapshot) {
  socket.send(JSON.stringify({ type: 'snapshot', snapshot }));
}

function subscribeToRemoteRoom(roomId, callback) {
  if (!('WebSocket' in window)) return () => {};

  let active = true;
  let socket;
  let reconnectTimer;

  function connect() {
    socket = new WebSocket(roomWebSocketUrl(roomId));
    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'snapshot') callback(message.snapshot);
      } catch {
        // Ignore malformed remote messages.
      }
    });
    socket.addEventListener('close', () => {
      if (active) reconnectTimer = window.setTimeout(connect, 1500);
    });
  }

  connect();

  return () => {
    active = false;
    window.clearTimeout(reconnectTimer);
    socket?.close();
  };
}
