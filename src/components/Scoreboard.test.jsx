// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import Scoreboard from './Scoreboard.jsx';
import {
  getScoreboardRoomId,
  SCOREBOARD_STORAGE_KEY,
} from '../lib/scoreboardSync.js';
import { makeInitialPresent } from '../state/matchReducer.js';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.pushState(null, '', '/');
});

describe('Scoreboard', () => {
  it('reads a 4-digit room ID from a scoreboard link', () => {
    expect(getScoreboardRoomId('/scoreboard/1234')).toBe('1234');
    expect(getScoreboardRoomId('/scoreboard/asd33asd24')).toBeNull();
    expect(getScoreboardRoomId('/scoreboard')).toBeNull();
  });

  it('joins a scoreboard using the 4-digit code', () => {
    window.history.pushState(null, '', '/scoreboard');
    render(<Scoreboard />);

    fireEvent.change(screen.getByLabelText('Kode scoreboard'), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tampilkan Scoreboard' }));

    expect(window.location.pathname).toBe('/scoreboard/1234');
    expect(screen.getByLabelText('Games')).toBeTruthy();
  });

  it('shows the latest saved match snapshot', () => {
    window.history.pushState(null, '', '/scoreboard/1234');
    const match = {
      ...makeInitialPresent(),
      points: { left: 1, right: 2 },
      games: { left: 0, right: 1 },
    };
    window.localStorage.setItem(`${SCOREBOARD_STORAGE_KEY}:1234`, JSON.stringify(match));

    render(<Scoreboard />);

    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('updates when a storage snapshot arrives', () => {
    window.history.pushState(null, '', '/scoreboard/1234');
    render(<Scoreboard />);

    const match = {
      ...makeInitialPresent(),
      points: { left: 2, right: 3 },
    };

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: `${SCOREBOARD_STORAGE_KEY}:1234`,
          newValue: JSON.stringify(match),
        }),
      );
    });

    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('40')).toBeTruthy();
  });
});
