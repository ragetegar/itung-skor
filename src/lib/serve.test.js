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
