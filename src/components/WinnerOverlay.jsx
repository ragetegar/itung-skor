import AvatarFace from './AvatarFace.jsx';
import { TEAMS } from '../lib/serve.js';

export default function WinnerOverlay({ winner, players, avatars, onReset, onUndo }) {
  const text =
    winner === 'tie'
      ? 'SERI'
      : winner === 'left'
        ? 'Tim Kiri Menang!'
        : 'Tim Kanan Menang!';

  // Show the winning team's avatars; on a tie show all four.
  const ids =
    winner === 'tie'
      ? [...TEAMS.left, ...TEAMS.right]
      : winner === 'left'
        ? TEAMS.left
        : TEAMS.right;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-white/90 backdrop-blur">
      <div className="flex gap-4">
        {ids.map((id) => (
          <AvatarFace
            key={id}
            player={players[id]}
            avatar={avatars[id]}
            sizeClass="h-24 w-24"
            textClass="text-4xl"
          />
        ))}
      </div>
      <div className="text-6xl font-black text-slate-900">{text}</div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-emerald-500 px-8 py-4 text-2xl font-bold text-white active:bg-emerald-600"
        >
          Match Baru
        </button>
        <button
          type="button"
          onClick={onUndo}
          className="rounded-full bg-slate-200 px-6 py-4 text-xl font-semibold text-slate-700 active:bg-slate-300"
        >
          ⤺ Revert
        </button>
      </div>
    </div>
  );
}
