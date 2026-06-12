import { useEffect, useState } from 'react';
import { POINT_LABELS } from '../lib/scoring.js';
import { makeInitialPresent } from '../state/matchReducer.js';
import {
  getScoreboardRoomId,
  readScoreboardSnapshot,
  subscribeToScoreboard,
} from '../lib/scoreboardSync.js';

export default function Scoreboard() {
  const [roomId, setRoomId] = useState(getScoreboardRoomId);
  const [match, setMatch] = useState(
    () => readScoreboardSnapshot(roomId) ?? makeInitialPresent(),
  );

  useEffect(() => {
    if (!roomId) return undefined;
    setMatch(readScoreboardSnapshot(roomId) ?? makeInitialPresent());
    return subscribeToScoreboard(setMatch, roomId);
  }, [roomId]);

  const golden = match.points.left === 3 && match.points.right === 3;

  if (!roomId) {
    return <ScoreboardJoin onJoin={setRoomId} />;
  }

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

function ScoreboardJoin({ onJoin }) {
  const [code, setCode] = useState('');

  function join(event) {
    event.preventDefault();
    if (!/^\d{4}$/.test(code)) return;

    window.history.pushState(null, '', `/scoreboard/${code}`);
    onJoin(code);
  }

  return (
    <main className="flex h-full items-center justify-center bg-slate-950 px-6 text-white">
      <form className="w-full max-w-md text-center" onSubmit={join}>
        <p className="text-sm font-black uppercase tracking-[0.25em] text-white/50">
          Scoreboard Lapangan
        </p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Masukkan kode</h1>
        <p className="mt-3 text-base font-medium text-white/50">
          Lihat kode 4 digit yang tampil di iPad pencatat skor.
        </p>
        <input
          className="mt-8 w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-5 text-center font-mono text-6xl font-black tracking-[0.3em] outline-none focus:border-white/60"
          aria-label="Kode scoreboard"
          autoFocus
          inputMode="numeric"
          maxLength={4}
          pattern="\d{4}"
          placeholder="0000"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
        />
        <button
          className="mt-4 w-full rounded-2xl bg-white px-6 py-4 text-xl font-black text-slate-950 disabled:opacity-30"
          disabled={code.length !== 4}
          type="submit"
        >
          Tampilkan Scoreboard
        </button>
      </form>
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
