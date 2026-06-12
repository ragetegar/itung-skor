import { useEffect, useState } from 'react';
import { POINT_LABELS } from '../lib/scoring.js';
import { makeInitialPresent } from '../state/matchReducer.js';
import {
  readScoreboardSnapshot,
  subscribeToScoreboard,
} from '../lib/scoreboardSync.js';

export default function Scoreboard() {
  const [match, setMatch] = useState(() => readScoreboardSnapshot() ?? makeInitialPresent());

  useEffect(() => subscribeToScoreboard(setMatch), []);

  const golden = match.points.left === 3 && match.points.right === 3;

  return (
    <main className="grid h-full grid-rows-[auto_1fr] bg-slate-950 px-8 py-8 text-white sm:px-16 sm:py-12">
      <section
        className="grid grid-cols-2 border-b border-white/15 pb-6 text-center sm:pb-10"
        aria-label="Games"
      >
        <TeamHeading
          label="Tim Kiri"
          games={match.games.left}
        />
        <TeamHeading
          label="Tim Kanan"
          games={match.games.right}
        />
      </section>

      <section className="flex items-center justify-center" aria-label="Poin">
        {golden ? (
          <div className="text-center text-[clamp(5rem,18vw,16rem)] font-black leading-none tracking-tight text-amber-400">
            GOLDEN
          </div>
        ) : (
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center text-center font-mono font-black tabular-nums">
            <span className="text-[clamp(8rem,28vw,28rem)] leading-none text-white">
              {POINT_LABELS[match.points.left]}
            </span>
            <span className="px-4 text-[clamp(4rem,10vw,10rem)] text-white/25">-</span>
            <span className="text-[clamp(8rem,28vw,28rem)] leading-none text-white">
              {POINT_LABELS[match.points.right]}
            </span>
          </div>
        )}
      </section>
    </main>
  );
}

function TeamHeading({ label, games }) {
  return (
    <div>
      <p className="text-[clamp(1rem,3vw,2.5rem)] font-black uppercase tracking-[0.16em] text-white/70">
        {label}
      </p>
      <p className="mt-2 text-[clamp(3.5rem,9vw,8rem)] font-black leading-none tabular-nums">
        {games}
      </p>
    </div>
  );
}
