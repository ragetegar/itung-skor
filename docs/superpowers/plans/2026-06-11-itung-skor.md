# Itung Skor — Scoreboard Padel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a touch-friendly padel doubles scoreboard (iPad landscape, light theme) as a static React SPA with manual point entry, golden-point scoring, best-of format tabs, auto serve rotation, and unlimited chronological undo — no backend, deployable to Cloudflare Pages.

**Architecture:** Pure logic lives in framework-free modules (`src/lib/scoring.js`, `src/lib/serve.js`) developed TDD with Vitest. A reducer (`src/state/matchReducer.js`) wraps the present state plus an undo history stack. Thin React components render derived state and dispatch actions. The current server is *derived* from `(firstServerId, completedGames)` so undo restores serve order for free.

**Tech Stack:** Vite + React 19 (JavaScript), Tailwind CSS v4 (`@tailwindcss/vite`), Vitest (+ jsdom & @testing-library/react for one integration test). Deploy: Cloudflare Pages (`npm run build` → `dist`).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `package.json`, `vite.config.js`, `index.html` | Project + build + test config |
| `src/main.jsx`, `src/index.css` | App entry + Tailwind import |
| `src/lib/scoring.js` (+ `.test.js`) | Pure point/game/match scoring engine |
| `src/lib/serve.js` (+ `.test.js`) | Pure serve order rotation |
| `src/state/matchReducer.js` (+ `.test.js`) | Reducer + undo stack + selectors |
| `src/components/App.jsx` (+ `.test.jsx`) | Host reducer, layout, integration test |
| `src/components/FormatSelector.jsx` | Bo3/Bo4/Bo5 tabs |
| `src/components/TeamPanel.jsx` | One team's avatars + serve + game count |
| `src/components/PlayerAvatar.jsx` | Avatar circle + serve button/indicator |
| `src/components/BigScore.jsx` | Center giant point score / GOLDEN |
| `src/components/Controls.jsx` | +Poin buttons + Revert |
| `src/components/WinnerOverlay.jsx` | Winner/tie banner + Match Baru |
| `README.md` | Run + deploy instructions |

---

## Task 1: Project scaffold (Vite + React + Tailwind + Vitest)

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/index.css`, `src/components/App.jsx`, `src/sanity.test.js`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "itung-skor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@testing-library/react": "^16.1.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.0.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    globals: true,
  },
});
```

- [ ] **Step 3: Create `index.html`**

```html
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>Itung Skor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `src/index.css`**

```css
@import "tailwindcss";

html,
body,
#root {
  height: 100%;
  margin: 0;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

- [ ] **Step 5: Create `src/main.jsx`**

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Create placeholder `src/components/App.jsx`**

```jsx
export default function App() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-50 text-4xl font-black text-slate-800">
      Itung Skor
    </div>
  );
}
```

- [ ] **Step 7: Create `src/sanity.test.js` (proves Vitest runs)**

```js
import { describe, it, expect } from 'vitest';

describe('toolchain', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`
Expected: dependencies install with no error; `node_modules/` created.

- [ ] **Step 9: Run the sanity test**

Run: `npx vitest run src/sanity.test.js`
Expected: PASS (1 test passed).

- [ ] **Step 10: Verify dev server boots**

Run: `npm run build`
Expected: build succeeds, writes `dist/` with `index.html` and assets. (Confirms Vite + Tailwind + React wiring works end-to-end.)

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: scaffold vite + react + tailwind + vitest

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Scoring engine (TDD)

**Files:**
- Create: `src/lib/scoring.js`
- Test: `src/lib/scoring.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/scoring.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { POINT_LABELS, formatConfig, evaluateMatch, scorePoint } from './scoring.js';

const baseState = (over = {}) => ({
  format: 'bo3',
  firstServerId: 'A',
  points: { left: 0, right: 0 },
  games: { left: 0, right: 0 },
  status: 'in-progress',
  winner: null,
  ...over,
});

describe('POINT_LABELS', () => {
  it('maps indices to tennis labels', () => {
    expect(POINT_LABELS).toEqual(['0', '15', '30', '40']);
  });
});

describe('formatConfig', () => {
  it('bo3 -> first to 2 of 3', () => {
    expect(formatConfig('bo3')).toEqual({ winTarget: 2, maxGames: 3 });
  });
  it('bo4 -> first to 3 of 4', () => {
    expect(formatConfig('bo4')).toEqual({ winTarget: 3, maxGames: 4 });
  });
  it('bo5 -> first to 3 of 5', () => {
    expect(formatConfig('bo5')).toEqual({ winTarget: 3, maxGames: 5 });
  });
});

describe('scorePoint - point progression', () => {
  it('advances 0 -> 15 -> 30 -> 40', () => {
    let s = baseState();
    s = scorePoint(s, 'left');
    expect(s.points.left).toBe(1);
    s = scorePoint(s, 'left');
    expect(s.points.left).toBe(2);
    s = scorePoint(s, 'left');
    expect(s.points.left).toBe(3);
  });

  it('wins a game from 40 when opponent below 40', () => {
    const s = scorePoint(baseState({ points: { left: 3, right: 1 } }), 'left');
    expect(s.games.left).toBe(1);
    expect(s.points).toEqual({ left: 0, right: 0 });
  });

  it('does not mutate the input state', () => {
    const input = baseState();
    scorePoint(input, 'left');
    expect(input.points.left).toBe(0);
  });
});

describe('scorePoint - golden point', () => {
  it('reaching 40-40 keeps both at 40 (golden, no game won yet)', () => {
    const s = scorePoint(baseState({ points: { left: 3, right: 2 } }), 'right');
    expect(s.points).toEqual({ left: 3, right: 3 });
    expect(s.games).toEqual({ left: 0, right: 0 });
  });

  it('winning the golden point wins the game (sudden death)', () => {
    const s = scorePoint(baseState({ points: { left: 3, right: 3 } }), 'right');
    expect(s.games.right).toBe(1);
    expect(s.points).toEqual({ left: 0, right: 0 });
  });
});

describe('evaluateMatch', () => {
  it('bo3 in progress at 1-0', () => {
    expect(evaluateMatch({ left: 1, right: 0 }, 'bo3')).toEqual({ status: 'in-progress', winner: null });
  });
  it('bo3 left wins at 2-0', () => {
    expect(evaluateMatch({ left: 2, right: 0 }, 'bo3')).toEqual({ status: 'finished', winner: 'left' });
  });
  it('bo3 right wins at 1-2', () => {
    expect(evaluateMatch({ left: 1, right: 2 }, 'bo3')).toEqual({ status: 'finished', winner: 'right' });
  });
  it('bo4 ties at 2-2', () => {
    expect(evaluateMatch({ left: 2, right: 2 }, 'bo4')).toEqual({ status: 'finished', winner: 'tie' });
  });
  it('bo4 left wins at 3-1', () => {
    expect(evaluateMatch({ left: 3, right: 1 }, 'bo4')).toEqual({ status: 'finished', winner: 'left' });
  });
  it('bo4 in progress at 2-1', () => {
    expect(evaluateMatch({ left: 2, right: 1 }, 'bo4')).toEqual({ status: 'in-progress', winner: null });
  });
  it('bo5 right wins at 1-3', () => {
    expect(evaluateMatch({ left: 1, right: 3 }, 'bo5')).toEqual({ status: 'finished', winner: 'right' });
  });
});

describe('scorePoint - match completion', () => {
  it('marks match finished when a game win reaches the target', () => {
    const s = scorePoint(baseState({ points: { left: 3, right: 0 }, games: { left: 1, right: 0 } }), 'left');
    expect(s.games.left).toBe(2);
    expect(s.status).toBe('finished');
    expect(s.winner).toBe('left');
  });

  it('ignores scoring once finished', () => {
    const finished = baseState({ status: 'finished', winner: 'left', games: { left: 2, right: 0 } });
    expect(scorePoint(finished, 'right')).toBe(finished);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/scoring.test.js`
Expected: FAIL — "Failed to resolve import './scoring.js'" / functions undefined.

- [ ] **Step 3: Implement `src/lib/scoring.js`**

```js
export const POINT_LABELS = ['0', '15', '30', '40'];

const OTHER = { left: 'right', right: 'left' };

export function formatConfig(format) {
  switch (format) {
    case 'bo3':
      return { winTarget: 2, maxGames: 3 };
    case 'bo4':
      return { winTarget: 3, maxGames: 4 };
    case 'bo5':
      return { winTarget: 3, maxGames: 5 };
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

// Decide match status/winner purely from games won + format.
export function evaluateMatch(games, format) {
  const { winTarget, maxGames } = formatConfig(format);
  const totalPlayed = games.left + games.right;
  const reachedTarget = games.left >= winTarget || games.right >= winTarget;

  if (reachedTarget || totalPlayed >= maxGames) {
    if (games.left === games.right) return { status: 'finished', winner: 'tie' };
    return { status: 'finished', winner: games.left > games.right ? 'left' : 'right' };
  }
  return { status: 'in-progress', winner: null };
}

// Apply one won point for `team` ('left' | 'right'). Returns a new state.
export function scorePoint(state, team) {
  if (state.status !== 'in-progress') return state;

  const other = OTHER[team];
  const atGamePoint = state.points[team] === 3; // already at 40
  const golden = state.points.left === 3 && state.points.right === 3;

  // Win the game: at 40 and (opponent below 40, or it is golden 40-40).
  if (atGamePoint && (state.points[other] < 3 || golden)) {
    const games = { ...state.games, [team]: state.games[team] + 1 };
    const outcome = evaluateMatch(games, state.format);
    return {
      ...state,
      points: { left: 0, right: 0 },
      games,
      status: outcome.status,
      winner: outcome.winner,
    };
  }

  // Otherwise advance this team's point (0->15->30->40).
  return {
    ...state,
    points: { ...state.points, [team]: state.points[team] + 1 },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/scoring.test.js`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.js src/lib/scoring.test.js
git commit -m "$(cat <<'EOF'
feat: pure scoring engine (points, golden, best-of match)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Serve rotation logic (TDD)

**Files:**
- Create: `src/lib/serve.js`
- Test: `src/lib/serve.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/serve.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { TEAMS, serveSequence, currentServer } from './serve.js';

describe('TEAMS', () => {
  it('left is A,B and right is C,D', () => {
    expect(TEAMS).toEqual({ left: ['A', 'B'], right: ['C', 'D'] });
  });
});

describe('serveSequence', () => {
  it('starting A -> A,C,B,D', () => {
    expect(serveSequence('A')).toEqual(['A', 'C', 'B', 'D']);
  });
  it('starting C -> C,A,D,B', () => {
    expect(serveSequence('C')).toEqual(['C', 'A', 'D', 'B']);
  });
  it('starting B -> B,C,A,D', () => {
    expect(serveSequence('B')).toEqual(['B', 'C', 'A', 'D']);
  });
  it('starting D -> D,A,C,B', () => {
    expect(serveSequence('D')).toEqual(['D', 'A', 'C', 'B']);
  });
  it('returns empty when there is no first server', () => {
    expect(serveSequence(null)).toEqual([]);
  });
});

describe('currentServer', () => {
  it('rotates per completed game starting from A', () => {
    expect(currentServer('A', 0)).toBe('A');
    expect(currentServer('A', 1)).toBe('C');
    expect(currentServer('A', 2)).toBe('B');
    expect(currentServer('A', 3)).toBe('D');
    expect(currentServer('A', 4)).toBe('A');
  });
  it('returns null with no first server', () => {
    expect(currentServer(null, 0)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/serve.test.js`
Expected: FAIL — "Failed to resolve import './serve.js'".

- [ ] **Step 3: Implement `src/lib/serve.js`**

```js
export const TEAMS = {
  left: ['A', 'B'],
  right: ['C', 'D'],
};

const PLAYER_TEAM = { A: 'left', B: 'left', C: 'right', D: 'right' };
// Canonical first server per team (used for the team that does not start).
const STARTER = { left: 'A', right: 'C' };

// Full 4-game serve order derived from who serves first.
// Pattern: [first, otherTeamStarter, firstPartner, otherTeamOther], repeating.
export function serveSequence(firstServerId) {
  if (!firstServerId) return [];
  const startTeam = PLAYER_TEAM[firstServerId];
  const otherTeam = startTeam === 'left' ? 'right' : 'left';
  const firstPartner = TEAMS[startTeam].find((p) => p !== firstServerId);
  const otherStarter = STARTER[otherTeam];
  const otherOther = TEAMS[otherTeam].find((p) => p !== otherStarter);
  return [firstServerId, otherStarter, firstPartner, otherOther];
}

// Who serves the current game (0-based count of completed games).
export function currentServer(firstServerId, completedGames) {
  if (!firstServerId) return null;
  const seq = serveSequence(firstServerId);
  return seq[completedGames % seq.length];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/serve.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/serve.js src/lib/serve.test.js
git commit -m "$(cat <<'EOF'
feat: pure serve rotation order

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Match reducer + undo stack + selectors (TDD)

**Files:**
- Create: `src/state/matchReducer.js`
- Test: `src/state/matchReducer.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/state/matchReducer.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  matchReducer,
  initialState,
  selectCurrentServer,
  isGolden,
  canUndo,
  completedGames,
} from './matchReducer.js';

describe('initialState', () => {
  it('starts pre-serve, bo3, zeroed', () => {
    expect(initialState.present.status).toBe('pre-serve');
    expect(initialState.present.format).toBe('bo3');
    expect(initialState.present.firstServerId).toBeNull();
    expect(initialState.present.points).toEqual({ left: 0, right: 0 });
    expect(initialState.present.games).toEqual({ left: 0, right: 0 });
    expect(initialState.past).toEqual([]);
  });
});

describe('SET_FIRST_SERVER', () => {
  it('sets server and moves to in-progress', () => {
    const s = matchReducer(initialState, { type: 'SET_FIRST_SERVER', playerId: 'C' });
    expect(s.present.firstServerId).toBe('C');
    expect(s.present.status).toBe('in-progress');
    expect(s.past).toHaveLength(1);
  });
  it('ignores a second server choice (use UNDO to change)', () => {
    const s1 = matchReducer(initialState, { type: 'SET_FIRST_SERVER', playerId: 'C' });
    const s2 = matchReducer(s1, { type: 'SET_FIRST_SERVER', playerId: 'A' });
    expect(s2.present.firstServerId).toBe('C');
  });
});

describe('SCORE_POINT', () => {
  it('adds a point and records history', () => {
    const s1 = matchReducer(initialState, { type: 'SET_FIRST_SERVER', playerId: 'A' });
    const s2 = matchReducer(s1, { type: 'SCORE_POINT', team: 'left' });
    expect(s2.present.points.left).toBe(1);
    expect(s2.past).toHaveLength(2);
  });
  it('does nothing while pre-serve', () => {
    const s = matchReducer(initialState, { type: 'SCORE_POINT', team: 'left' });
    expect(s).toBe(initialState);
  });
});

describe('UNDO', () => {
  it('reverts the last action exactly', () => {
    const s1 = matchReducer(initialState, { type: 'SET_FIRST_SERVER', playerId: 'A' });
    const s2 = matchReducer(s1, { type: 'SCORE_POINT', team: 'left' });
    const s3 = matchReducer(s2, { type: 'SCORE_POINT', team: 'right' });
    const back = matchReducer(s3, { type: 'UNDO' });
    expect(back.present.points).toEqual({ left: 1, right: 0 });
    expect(back.past).toHaveLength(2);
  });
  it('undo across a game win restores points and games', () => {
    let s = matchReducer(initialState, { type: 'SET_FIRST_SERVER', playerId: 'A' });
    s = matchReducer(s, { type: 'SCORE_POINT', team: 'left' }); // 15
    s = matchReducer(s, { type: 'SCORE_POINT', team: 'left' }); // 30
    s = matchReducer(s, { type: 'SCORE_POINT', team: 'left' }); // 40
    s = matchReducer(s, { type: 'SCORE_POINT', team: 'left' }); // win game
    expect(s.present.games.left).toBe(1);
    expect(s.present.points).toEqual({ left: 0, right: 0 });
    const back = matchReducer(s, { type: 'UNDO' });
    expect(back.present.games.left).toBe(0);
    expect(back.present.points).toEqual({ left: 3, right: 0 });
  });
  it('does nothing with empty history', () => {
    const s = matchReducer(initialState, { type: 'UNDO' });
    expect(s).toBe(initialState);
  });
});

describe('SET_FORMAT', () => {
  it('changes format without resetting the running score', () => {
    let s = matchReducer(initialState, { type: 'SET_FIRST_SERVER', playerId: 'A' });
    s = { ...s, present: { ...s.present, games: { left: 1, right: 1 } } };
    const changed = matchReducer(s, { type: 'SET_FORMAT', format: 'bo5' });
    expect(changed.present.format).toBe('bo5');
    expect(changed.present.games).toEqual({ left: 1, right: 1 });
    expect(changed.present.status).toBe('in-progress');
    expect(changed.past).toHaveLength(2);
  });
  it('keeps pre-serve status when changed before serving', () => {
    const s = matchReducer(initialState, { type: 'SET_FORMAT', format: 'bo4' });
    expect(s.present.status).toBe('pre-serve');
  });
});

describe('RESET', () => {
  it('clears to a fresh state but keeps the chosen format', () => {
    let s = matchReducer(initialState, { type: 'SET_FORMAT', format: 'bo5' });
    s = matchReducer(s, { type: 'SET_FIRST_SERVER', playerId: 'A' });
    const reset = matchReducer(s, { type: 'RESET' });
    expect(reset.present.format).toBe('bo5');
    expect(reset.present.status).toBe('pre-serve');
    expect(reset.present.firstServerId).toBeNull();
    expect(reset.past).toEqual([]);
  });
});

describe('selectors', () => {
  it('selectCurrentServer derives from first server and completed games', () => {
    let s = matchReducer(initialState, { type: 'SET_FIRST_SERVER', playerId: 'A' });
    expect(selectCurrentServer(s.present)).toBe('A');
    s = { ...s, present: { ...s.present, games: { left: 1, right: 0 } } };
    expect(selectCurrentServer(s.present)).toBe('C');
  });
  it('isGolden is true only at 40-40', () => {
    expect(isGolden({ points: { left: 3, right: 3 } })).toBe(true);
    expect(isGolden({ points: { left: 3, right: 2 } })).toBe(false);
  });
  it('canUndo reflects whether history exists', () => {
    expect(canUndo(initialState)).toBe(false);
    const s = matchReducer(initialState, { type: 'SET_FIRST_SERVER', playerId: 'A' });
    expect(canUndo(s)).toBe(true);
  });
  it('completedGames sums games played', () => {
    expect(completedGames({ games: { left: 1, right: 2 } })).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/state/matchReducer.test.js`
Expected: FAIL — "Failed to resolve import './matchReducer.js'".

- [ ] **Step 3: Implement `src/state/matchReducer.js`**

```js
import { scorePoint, evaluateMatch } from '../lib/scoring.js';
import { currentServer } from '../lib/serve.js';

export const PLAYER_IDS = ['A', 'B', 'C', 'D'];

export function makeInitialPresent(format = 'bo3') {
  return {
    format,
    players: {
      A: { name: 'A', avatar: null },
      B: { name: 'B', avatar: null },
      C: { name: 'C', avatar: null },
      D: { name: 'D', avatar: null },
    },
    firstServerId: null,
    points: { left: 0, right: 0 },
    games: { left: 0, right: 0 },
    status: 'pre-serve',
    winner: null,
  };
}

export const initialState = {
  present: makeInitialPresent('bo3'),
  past: [],
};

// Push current present onto history and set a new present.
function commit(state, present) {
  return { present, past: [...state.past, state.present] };
}

export function matchReducer(state, action) {
  switch (action.type) {
    case 'SET_FIRST_SERVER': {
      if (state.present.firstServerId) return state;
      return commit(state, {
        ...state.present,
        firstServerId: action.playerId,
        status: 'in-progress',
      });
    }

    case 'SCORE_POINT': {
      if (state.present.status !== 'in-progress') return state;
      return commit(state, scorePoint(state.present, action.team));
    }

    case 'SET_FORMAT': {
      if (state.present.format === action.format) return state;
      const present = { ...state.present, format: action.format };
      if (present.status !== 'pre-serve') {
        const outcome = evaluateMatch(present.games, action.format);
        present.status = outcome.status;
        present.winner = outcome.winner;
      }
      return commit(state, present);
    }

    case 'UNDO': {
      if (state.past.length === 0) return state;
      return {
        present: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
      };
    }

    case 'RESET': {
      return { present: makeInitialPresent(state.present.format), past: [] };
    }

    default:
      return state;
  }
}

// ---- Selectors (derived, never stored) ----
export function completedGames(present) {
  return present.games.left + present.games.right;
}

export function selectCurrentServer(present) {
  return currentServer(present.firstServerId, completedGames(present));
}

export function isGolden(present) {
  return present.points.left === 3 && present.points.right === 3;
}

export function canUndo(state) {
  return state.past.length > 0;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/state/matchReducer.test.js`
Expected: PASS.

- [ ] **Step 5: Run the full suite (logic regression check)**

Run: `npm test`
Expected: PASS — scoring, serve, reducer, and sanity tests all green.

- [ ] **Step 6: Commit**

```bash
git add src/state/matchReducer.js src/state/matchReducer.test.js
git commit -m "$(cat <<'EOF'
feat: match reducer with undo stack and selectors

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: UI components + App wiring

**Files:**
- Create: `src/components/PlayerAvatar.jsx`, `src/components/TeamPanel.jsx`, `src/components/BigScore.jsx`, `src/components/FormatSelector.jsx`, `src/components/Controls.jsx`, `src/components/WinnerOverlay.jsx`
- Modify: `src/components/App.jsx` (replace placeholder)

- [ ] **Step 1: Create `src/components/PlayerAvatar.jsx`**

```jsx
export default function PlayerAvatar({ player, isServer, showServeButton, onChooseServe }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-700 ring-2 ring-slate-300">
        {player.name}
      </div>
      {showServeButton && (
        <button
          type="button"
          onClick={onChooseServe}
          className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white active:bg-emerald-600"
        >
          🎾 Serve
        </button>
      )}
      {isServer && (
        <div className="text-2xl" aria-label="server" title="Serve">
          🎾
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/TeamPanel.jsx`**

```jsx
import PlayerAvatar from './PlayerAvatar.jsx';

export default function TeamPanel({
  side,
  playerIds,
  players,
  currentServerId,
  firstServerChosen,
  gamesCount,
  onChooseServe,
}) {
  const align = side === 'left' ? 'items-start' : 'items-end';
  return (
    <div className={`flex flex-col gap-3 ${align}`}>
      <div className="flex gap-4">
        {playerIds.map((id) => (
          <PlayerAvatar
            key={id}
            player={players[id]}
            isServer={currentServerId === id}
            showServeButton={!firstServerChosen}
            onChooseServe={() => onChooseServe(id)}
          />
        ))}
      </div>
      <div className="text-lg font-semibold text-slate-500">Games {gamesCount}</div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/BigScore.jsx`**

```jsx
import { POINT_LABELS } from '../lib/scoring.js';

export default function BigScore({ points, golden }) {
  if (golden) {
    return (
      <div className="text-7xl font-black tracking-tight text-amber-500">GOLDEN</div>
    );
  }
  return (
    <div className="flex items-center gap-8 text-8xl font-black text-slate-800">
      <span>{POINT_LABELS[points.left]}</span>
      <span className="text-slate-300">—</span>
      <span>{POINT_LABELS[points.right]}</span>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/FormatSelector.jsx`**

```jsx
const FORMATS = [
  { id: 'bo3', label: 'Best of 3' },
  { id: 'bo4', label: 'Best of 4' },
  { id: 'bo5', label: 'Best of 5' },
];

export default function FormatSelector({ format, onChange }) {
  return (
    <div className="inline-flex rounded-full bg-slate-200 p-1">
      {FORMATS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            format === f.id ? 'bg-white text-slate-900 shadow' : 'text-slate-500'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/Controls.jsx`**

```jsx
export default function Controls({ onScoreLeft, onScoreRight, onUndo, canUndo, disabledScoring }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full gap-4">
        <button
          type="button"
          onClick={onScoreLeft}
          disabled={disabledScoring}
          className="flex-1 rounded-2xl bg-sky-500 py-8 text-3xl font-black text-white active:bg-sky-600 disabled:opacity-40"
        >
          + POIN KIRI
        </button>
        <button
          type="button"
          onClick={onScoreRight}
          disabled={disabledScoring}
          className="flex-1 rounded-2xl bg-rose-500 py-8 text-3xl font-black text-white active:bg-rose-600 disabled:opacity-40"
        >
          + POIN KANAN
        </button>
      </div>
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="rounded-full bg-slate-700 px-6 py-3 text-lg font-semibold text-white active:bg-slate-800 disabled:opacity-30"
      >
        ⤺ Revert
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Create `src/components/WinnerOverlay.jsx`**

```jsx
export default function WinnerOverlay({ winner, onReset, onUndo }) {
  const text =
    winner === 'tie'
      ? 'SERI'
      : winner === 'left'
        ? 'Tim Kiri Menang!'
        : 'Tim Kanan Menang!';
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-white/90 backdrop-blur">
      <div className="text-6xl font-black text-slate-900">{text}</div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-emerald-500 px-8 py-4 text-2xl font-bold text-white active:bg-emerald-600"
        >
          Match Baru
        </button>
        <button
          type="button"
          onClick={onUndo}
          className="rounded-full bg-slate-200 px-6 py-4 text-xl font-semibold text-slate-700 active:bg-slate-300"
        >
          ⤺ Revert
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Replace `src/components/App.jsx`**

```jsx
import { useReducer } from 'react';
import {
  matchReducer,
  initialState,
  selectCurrentServer,
  isGolden,
  canUndo,
} from '../state/matchReducer.js';
import { TEAMS } from '../lib/serve.js';
import FormatSelector from './FormatSelector.jsx';
import TeamPanel from './TeamPanel.jsx';
import BigScore from './BigScore.jsx';
import Controls from './Controls.jsx';
import WinnerOverlay from './WinnerOverlay.jsx';

export default function App() {
  const [state, dispatch] = useReducer(matchReducer, initialState);
  const { present } = state;
  const serverId = selectCurrentServer(present);
  const golden = isGolden(present);
  const firstServerChosen = present.firstServerId !== null;

  return (
    <div className="relative flex h-full flex-col bg-slate-50 px-6 py-4 text-slate-900">
      <header className="flex justify-center">
        <FormatSelector
          format={present.format}
          onChange={(f) => dispatch({ type: 'SET_FORMAT', format: f })}
        />
      </header>

      <main className="flex flex-1 items-center justify-between gap-6">
        <TeamPanel
          side="left"
          playerIds={TEAMS.left}
          players={present.players}
          currentServerId={serverId}
          firstServerChosen={firstServerChosen}
          gamesCount={present.games.left}
          onChooseServe={(id) => dispatch({ type: 'SET_FIRST_SERVER', playerId: id })}
        />

        <div className="flex flex-col items-center gap-2">
          <BigScore points={present.points} golden={golden} />
          {!firstServerChosen && (
            <p className="text-lg text-slate-400">Pilih siapa yang serve duluan</p>
          )}
        </div>

        <TeamPanel
          side="right"
          playerIds={TEAMS.right}
          players={present.players}
          currentServerId={serverId}
          firstServerChosen={firstServerChosen}
          gamesCount={present.games.right}
          onChooseServe={(id) => dispatch({ type: 'SET_FIRST_SERVER', playerId: id })}
        />
      </main>

      <footer>
        <Controls
          onScoreLeft={() => dispatch({ type: 'SCORE_POINT', team: 'left' })}
          onScoreRight={() => dispatch({ type: 'SCORE_POINT', team: 'right' })}
          onUndo={() => dispatch({ type: 'UNDO' })}
          canUndo={canUndo(state)}
          disabledScoring={present.status !== 'in-progress'}
        />
      </footer>

      {present.status === 'finished' && (
        <WinnerOverlay
          winner={present.winner}
          onReset={() => dispatch({ type: 'RESET' })}
          onUndo={() => dispatch({ type: 'UNDO' })}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 8: Verify the production build compiles**

Run: `npm run build`
Expected: build succeeds (all component imports resolve, no JSX errors).

- [ ] **Step 9: Commit**

```bash
git add src/components
git commit -m "$(cat <<'EOF'
feat: scoreboard UI (avatars, score, format tabs, controls, overlay)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: App integration test (jsdom)

**Files:**
- Create: `src/components/App.test.jsx`

- [ ] **Step 1: Write the integration test**

Create `src/components/App.test.jsx`:

```jsx
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App.jsx';

afterEach(cleanup);

describe('App integration', () => {
  it('requires choosing a server before scoring, then scores a point', () => {
    render(<App />);
    expect(screen.getByText('Pilih siapa yang serve duluan')).toBeTruthy();

    const serveButtons = screen.getAllByRole('button', { name: /Serve/i });
    expect(serveButtons).toHaveLength(4);

    fireEvent.click(serveButtons[0]); // A serves first
    expect(screen.queryByText('Pilih siapa yang serve duluan')).toBeNull();
    expect(screen.queryAllByRole('button', { name: /Serve/i })).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: /POIN KIRI/i }));
    expect(screen.getByText('15')).toBeTruthy();
  });

  it('shows GOLDEN at 40-40', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /Serve/i })[0]); // A serves
    const left = screen.getByRole('button', { name: /POIN KIRI/i });
    const right = screen.getByRole('button', { name: /POIN KANAN/i });

    fireEvent.click(left); // 15
    fireEvent.click(left); // 30
    fireEvent.click(left); // 40
    fireEvent.click(right); // 15
    fireEvent.click(right); // 30
    fireEvent.click(right); // 40 -> 40-40

    expect(screen.getByText('GOLDEN')).toBeTruthy();
  });

  it('reverts a point with the Revert button', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /Serve/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /POIN KIRI/i })); // 15
    expect(screen.getByText('15')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Revert/i })); // back to 0
    expect(screen.queryByText('15')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the integration test to verify it passes**

Run: `npx vitest run src/components/App.test.jsx`
Expected: PASS (3 tests). If jsdom env is not picked up, confirm the `// @vitest-environment jsdom` comment is the very first line of the file.

- [ ] **Step 3: Run the full suite**

Run: `npm test`
Expected: PASS — all logic + integration tests green.

- [ ] **Step 4: Commit**

```bash
git add src/components/App.test.jsx
git commit -m "$(cat <<'EOF'
test: app integration (serve gate, scoring, golden, revert)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: README + manual verification + Cloudflare Pages deploy

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

````markdown
# Itung Skor

Papan skor padel doubles untuk iPad (landscape). React SPA statis, tanpa backend.

## Jalankan lokal

```bash
npm install
npm run dev      # buka URL yang ditampilkan (http://localhost:5173)
```

## Test

```bash
npm test
```

## Build produksi

```bash
npm run build    # output ke folder dist/
npm run preview  # cek hasil build secara lokal
```

## Deploy ke Cloudflare Pages

1. Push repo ke GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Save & Deploy. Tidak perlu environment variable / database.

## Cara pakai

- Pilih format di tab atas (Best of 3 / 4 / 5) — bisa diganti kapan saja.
- Klik tombol 🎾 Serve di salah satu pemain untuk menentukan server pertama (setelah suit).
- Tambah poin lewat **+ POIN KIRI** / **+ POIN KANAN**.
- 40-40 = **GOLDEN** (1 poin penentu).
- Salah pencet? Tekan **⤺ Revert** (bisa berkali-kali, kronologis).
- Match selesai → banner pemenang + **Match Baru** untuk reset.
````

- [ ] **Step 2: Manual verification in the browser**

Run: `npm run dev` and open the URL on a wide window (simulating iPad landscape). Confirm each:

- [ ] Format tabs show Bo3 active by default; clicking Bo5 highlights it.
- [ ] All four avatars show a "🎾 Serve" button; prompt "Pilih siapa yang serve duluan" is visible.
- [ ] Clicking one player's Serve button hides all Serve buttons and shows a 🎾 under that player.
- [ ] +POIN KIRI cycles the left score 0 → 15 → 30 → 40; a 4th point (right below 40) wins the game and "Games" increments, score resets to 0–0, and the 🎾 moves to the next server in order.
- [ ] Driving both sides to 40 shows **GOLDEN**; the next point to either side wins the game.
- [ ] Winning enough games (e.g. Bo3 to 2) shows the winner overlay with "Match Baru".
- [ ] In Bo4, reaching 2–2 shows "SERI".
- [ ] Revert steps back through points, game wins, and the winner overlay correctly.
- [ ] "Match Baru" resets the board to pre-serve, keeping the selected format.

- [ ] **Step 3: Final full build + test gate**

Run: `npm run build && npm test`
Expected: build succeeds and all tests pass.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs: add README with usage and Cloudflare Pages deploy

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Notes for the implementer

- **Pure logic first:** `scoring.js` and `serve.js` have no React imports and are fully unit-tested. Keep them that way — the reducer and components only compose them.
- **Server is derived, not stored:** never add a `currentServer` field to state. It is computed from `firstServerId` + completed games so undo works automatically.
- **Undo is uniform:** every mutating action (`SCORE_POINT`, `SET_FIRST_SERVER`, `SET_FORMAT`) pushes the prior `present` via `commit()`. `UNDO`/`RESET` do not push.
- **Future avatar feature (out of scope now):** `players[id].avatar` already exists in state. A later picker will set it in memory only; do not add persistence.
- **Tailwind v4:** styling comes from `@import "tailwindcss";` in `index.css` + the `@tailwindcss/vite` plugin. No `tailwind.config.js` needed.
