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
