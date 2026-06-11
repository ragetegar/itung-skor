// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App.jsx';

afterEach(cleanup);

describe('Avatar picker', () => {
  it('opens the picker when an avatar is clicked and sets the male illustration', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Pilih avatar A/i }));
    expect(screen.getByText('Avatar A')).toBeTruthy(); // modal title

    fireEvent.click(screen.getByRole('button', { name: /Cowok/i }));
    expect(screen.queryByText('Avatar A')).toBeNull(); // modal closed
    expect(screen.getByRole('img', { name: /Avatar cowok/i })).toBeTruthy();
  });

  it('Huruf option restores the letter', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Pilih avatar B/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cewek/i }));
    expect(screen.getByRole('img', { name: /Avatar cewek/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Pilih avatar B/i }));
    fireEvent.click(screen.getByRole('button', { name: /Huruf/i }));
    expect(screen.queryByRole('img', { name: /Avatar cewek/i })).toBeNull();
  });

  it('Match Baru clears avatars back to letters', () => {
    render(<App />);
    // set A to cowok
    fireEvent.click(screen.getByRole('button', { name: /Pilih avatar A/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cowok/i }));
    expect(screen.getByRole('img', { name: /Avatar cowok/i })).toBeTruthy();

    // play Bo3 to a finish: A serves, left wins 2 games
    fireEvent.click(screen.getAllByRole('button', { name: /Serve/i })[0]);
    const winGame = () => {
      const btn = screen.getByRole('button', { name: /POIN KIRI/i });
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
    };
    winGame();
    winGame();

    fireEvent.click(screen.getByRole('button', { name: /Match Baru/i }));
    expect(screen.queryByRole('img', { name: /Avatar cowok/i })).toBeNull();
  });
});
