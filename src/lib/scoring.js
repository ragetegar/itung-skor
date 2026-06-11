export const POINT_LABELS = ['0', '15', '30', '40'];

const OTHER = { left: 'right', right: 'left' };

export function formatConfig(format) {
  switch (format) {
    case 'bo3':
      return { winTarget: 2, maxGames: 3, mustPlayAll: false };
    case 'bo4':
      // Fixed 4-game format: semua 4 game tetap dimainkan walau sudah unggul 3-0.
      return { winTarget: 3, maxGames: 4, mustPlayAll: true };
    case 'bo5':
      return { winTarget: 3, maxGames: 5, mustPlayAll: false };
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

// Decide match status/winner purely from games won + format.
export function evaluateMatch(games, format) {
  const { winTarget, maxGames, mustPlayAll } = formatConfig(format);
  const totalPlayed = games.left + games.right;
  const reachedTarget =
    !mustPlayAll && (games.left >= winTarget || games.right >= winTarget);

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
