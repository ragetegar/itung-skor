export const TEAMS = {
  left: ['A', 'B'],
  right: ['C', 'D'],
};

export function currentServingTeam(firstServingTeam, completedGames) {
  if (!firstServingTeam) return null;
  if (completedGames % 2 === 0) return firstServingTeam;
  return firstServingTeam === 'left' ? 'right' : 'left';
}
