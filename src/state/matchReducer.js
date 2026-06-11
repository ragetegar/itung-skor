import { scorePoint, evaluateMatch } from '../lib/scoring.js';
import { currentServer } from '../lib/serve.js';

export const PLAYER_IDS = ['A', 'B', 'C', 'D'];

export function makeInitialPresent(format = 'bo4') {
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
  present: makeInitialPresent('bo4'),
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
