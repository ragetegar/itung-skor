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
