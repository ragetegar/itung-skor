// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import WinnerOverlay from './WinnerOverlay.jsx';

afterEach(cleanup);

const players = { A: { name: 'A' }, B: { name: 'B' }, C: { name: 'C' }, D: { name: 'D' } };
const noAvatars = { A: null, B: null, C: null, D: null };

const noop = () => {};

describe('WinnerOverlay', () => {
  it('shows only the winning team avatars (left)', () => {
    render(
      <WinnerOverlay winner="left" games={{ left: 3, right: 1 }} players={players} avatars={noAvatars} onReset={noop} onUndo={noop} />,
    );
    expect(screen.getByText('Tim Kiri Menang!')).toBeTruthy();
    expect(screen.getByText('3 - 1')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
    expect(screen.queryByText('C')).toBeNull();
    expect(screen.queryByText('D')).toBeNull();
  });

  it('shows only the winning team avatars (right)', () => {
    render(
      <WinnerOverlay winner="right" games={{ left: 1, right: 3 }} players={players} avatars={noAvatars} onReset={noop} onUndo={noop} />,
    );
    expect(screen.getByText('Tim Kanan Menang!')).toBeTruthy();
    expect(screen.getByText('1 - 3')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
    expect(screen.getByText('D')).toBeTruthy();
    expect(screen.queryByText('A')).toBeNull();
    expect(screen.queryByText('B')).toBeNull();
  });

  it('shows all four avatars on a tie', () => {
    render(
      <WinnerOverlay winner="tie" games={{ left: 2, right: 2 }} players={players} avatars={noAvatars} onReset={noop} onUndo={noop} />,
    );
    expect(screen.getByText('SERI')).toBeTruthy();
    expect(screen.getByText('2 - 2')).toBeTruthy();
    ['A', 'B', 'C', 'D'].forEach((letter) => {
      expect(screen.getByText(letter)).toBeTruthy();
    });
  });
});
