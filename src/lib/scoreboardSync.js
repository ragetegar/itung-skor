export const SCOREBOARD_STORAGE_KEY = 'itung-skor:scoreboard';
export const SCOREBOARD_CHANNEL_NAME = 'itung-skor:scoreboard';

export function readScoreboardSnapshot() {
  try {
    const raw = window.localStorage.getItem(SCOREBOARD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function publishScoreboardSnapshot(present) {
  try {
    window.localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(present));
  } catch {
    // BroadcastChannel can still keep an already-open scoreboard in sync.
  }

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(SCOREBOARD_CHANNEL_NAME);
    channel.postMessage(present);
    channel.close();
  }
}

export function subscribeToScoreboard(callback) {
  function onStorage(event) {
    if (event.key !== SCOREBOARD_STORAGE_KEY || !event.newValue) return;

    try {
      callback(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed snapshots from stale browser storage.
    }
  }

  window.addEventListener('storage', onStorage);

  let channel = null;
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(SCOREBOARD_CHANNEL_NAME);
    channel.addEventListener('message', (event) => callback(event.data));
  }

  return () => {
    window.removeEventListener('storage', onStorage);
    channel?.close();
  };
}
