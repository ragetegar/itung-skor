// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App.jsx';

afterEach(cleanup);

function chooseLeftServingTeam() {
  fireEvent.click(screen.getAllByRole('button', { name: /Serve/i })[0]);
}

function winGame(buttonName) {
  const btn = screen.getByRole('button', { name: buttonName });
  fireEvent.click(btn); // 15
  fireEvent.click(btn); // 30
  fireEvent.click(btn); // 40
  fireEvent.click(btn); // win game (opponent at 0)
}

describe('App full-match flows', () => {
  it('serve indicator moves to the other team after a game', () => {
    render(<App />);
    chooseLeftServingTeam();
    expect(screen.getAllByLabelText('serving team')).toHaveLength(1);
    expect(screen.getByLabelText('serving team').parentElement.parentElement.textContent).toContain('A');
    winGame(/POIN KIRI/i);
    expect(screen.getByLabelText('serving team').parentElement.parentElement.textContent).toContain('C');
  });

  it('Bo3: left winning 2 games shows winner overlay; Match Baru resets', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Best of 3/i }));
    chooseLeftServingTeam();
    winGame(/POIN KIRI/i); // 1-0
    winGame(/POIN KIRI/i); // 2-0 -> finished
    expect(screen.getByText('Tim Kiri Menang!')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Match Baru/i }));
    expect(screen.getByText(/Pilih tim yang serve duluan/)).toBeTruthy();
  });

  it('Bo4: reaching 2-2 shows SERI', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Best of 4/i }));
    chooseLeftServingTeam();
    winGame(/POIN KIRI/i); // 1-0
    winGame(/POIN KANAN/i); // 1-1
    winGame(/POIN KIRI/i); // 2-1
    winGame(/POIN KANAN/i); // 2-2 -> tie
    expect(screen.getByText('SERI')).toBeTruthy();
  });

  it('Revert undoes a finished match back to play', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Best of 3/i }));
    chooseLeftServingTeam();
    winGame(/POIN KIRI/i); // 1-0
    winGame(/POIN KIRI/i); // 2-0 -> finished overlay
    expect(screen.getByText('Tim Kiri Menang!')).toBeTruthy();
    // When finished, both the footer and the overlay show a Revert button;
    // the overlay (rendered last, on top) is the one a user can tap.
    const reverts = screen.getAllByRole('button', { name: /Revert/i });
    fireEvent.click(reverts[reverts.length - 1]);
    expect(screen.queryByText('Tim Kiri Menang!')).toBeNull();
  });
});
