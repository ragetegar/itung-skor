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
