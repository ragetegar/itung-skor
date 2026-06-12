import { describe, it, expect } from 'vitest';
import { TEAMS, currentServingTeam } from './serve.js';

describe('TEAMS', () => {
  it('left is A,B and right is C,D', () => {
    expect(TEAMS).toEqual({ left: ['A', 'B'], right: ['C', 'D'] });
  });
});

describe('currentServingTeam', () => {
  it('alternates teams per completed game starting from left', () => {
    expect(currentServingTeam('left', 0)).toBe('left');
    expect(currentServingTeam('left', 1)).toBe('right');
    expect(currentServingTeam('left', 2)).toBe('left');
  });

  it('alternates teams per completed game starting from right', () => {
    expect(currentServingTeam('right', 0)).toBe('right');
    expect(currentServingTeam('right', 1)).toBe('left');
  });

  it('returns null before a serving team is chosen', () => {
    expect(currentServingTeam(null, 0)).toBeNull();
  });
});
