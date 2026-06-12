// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import Scoreboard from './Scoreboard.jsx';
import { SCOREBOARD_STORAGE_KEY } from '../lib/scoreboardSync.js';
import { makeInitialPresent } from '../state/matchReducer.js';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('Scoreboard', () => {
  it('shows the latest saved match snapshot', () => {
    const match = {
      ...makeInitialPresent(),
      points: { left: 1, right: 2 },
      games: { left: 0, right: 1 },
    };
    window.localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(match));

    render(<Scoreboard />);

    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('updates when a storage snapshot arrives', () => {
    render(<Scoreboard />);

    const match = {
      ...makeInitialPresent(),
      points: { left: 2, right: 3 },
    };

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: SCOREBOARD_STORAGE_KEY,
          newValue: JSON.stringify(match),
        }),
      );
    });

    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('40')).toBeTruthy();
  });
});
