// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App.jsx';

afterEach(cleanup);

describe('App integration', () => {
  it('requires choosing a server before scoring, then scores a point', () => {
    render(<App />);
    expect(screen.getByText('Pilih siapa yang serve duluan')).toBeTruthy();

    const serveButtons = screen.getAllByRole('button', { name: /Serve/i });
    expect(serveButtons).toHaveLength(4);

    fireEvent.click(serveButtons[0]); // A serves first
    expect(screen.queryByText('Pilih siapa yang serve duluan')).toBeNull();
    expect(screen.queryAllByRole('button', { name: /Serve/i })).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: /POIN KIRI/i }));
    expect(screen.getByText('15')).toBeTruthy();
  });

  it('shows GOLDEN at 40-40', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /Serve/i })[0]); // A serves
    const left = screen.getByRole('button', { name: /POIN KIRI/i });
    const right = screen.getByRole('button', { name: /POIN KANAN/i });

    fireEvent.click(left); // 15
    fireEvent.click(left); // 30
    fireEvent.click(left); // 40
    fireEvent.click(right); // 15
    fireEvent.click(right); // 30
    fireEvent.click(right); // 40 -> 40-40

    expect(screen.getByText('GOLDEN')).toBeTruthy();
  });

  it('reverts a point with the Revert button', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /Serve/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /POIN KIRI/i })); // 15
    expect(screen.getByText('15')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Revert/i })); // back to 0
    expect(screen.queryByText('15')).toBeNull();
  });
});
