import { useEffect, useReducer, useState } from 'react';
import {
  matchReducer,
  initialState,
  selectCurrentServer,
  isGolden,
  canUndo,
} from '../state/matchReducer.js';
import { TEAMS } from '../lib/serve.js';
import FormatSelector from './FormatSelector.jsx';
import TeamPanel from './TeamPanel.jsx';
import BigScore from './BigScore.jsx';
import Controls from './Controls.jsx';
import WinnerOverlay from './WinnerOverlay.jsx';
import AvatarPicker from './AvatarPicker.jsx';
import { publishScoreboardSnapshot } from '../lib/scoreboardSync.js';

const NO_AVATARS = { A: null, B: null, C: null, D: null };

export default function App() {
  const [state, dispatch] = useReducer(matchReducer, initialState);
  // Avatars are cosmetic only — kept outside the scoring/undo state and never persisted.
  const [avatars, setAvatars] = useState(NO_AVATARS);
  const [pickerFor, setPickerFor] = useState(null);

  const { present } = state;
  const serverId = selectCurrentServer(present);
  const golden = isGolden(present);
  const firstServerChosen = present.firstServerId !== null;

  useEffect(() => {
    publishScoreboardSnapshot(present);
  }, [present]);

  function pickAvatar(descriptor) {
    setAvatars((prev) => ({ ...prev, [pickerFor]: descriptor }));
    setPickerFor(null);
  }

  function newMatch() {
    dispatch({ type: 'RESET' });
    setAvatars(NO_AVATARS);
  }

  const teamProps = {
    players: present.players,
    avatars,
    currentServerId: serverId,
    firstServerChosen,
    onChooseServe: (id) => dispatch({ type: 'SET_FIRST_SERVER', playerId: id }),
    onOpenPicker: setPickerFor,
  };

  return (
    <div className="relative flex h-full flex-col bg-slate-50 px-3 py-4 text-slate-900 sm:px-6">
      <header className="flex justify-center">
        <FormatSelector
          format={present.format}
          onChange={(f) => dispatch({ type: 'SET_FORMAT', format: f })}
        />
      </header>

      {/* Avatar band: teams pinned to the screen edges (left = A/B, right = C/D). */}
      <div className="mx-auto mt-3 flex w-full max-w-md items-start justify-between">
        <div className="flex items-start gap-1 sm:gap-3">
          <TeamPanel playerIds={TEAMS.left} {...teamProps} />
          <GamesBadge value={present.games.left} />
        </div>
        <div className="flex items-start gap-1 sm:gap-3">
          <GamesBadge value={present.games.right} />
          <TeamPanel playerIds={TEAMS.right} {...teamProps} />
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <BigScore points={present.points} golden={golden} />
          {!firstServerChosen && (
            <div className="animate-pulse rounded-2xl bg-emerald-500 px-6 py-3 text-center shadow-lg shadow-emerald-500/30">
              <p className="text-2xl font-black uppercase tracking-wide text-white">
                🎾 Pilih yang serve duluan
              </p>
              <p className="text-sm font-medium text-emerald-50">
                Tap tombol <span className="font-bold">Serve</span> di salah satu pemain
              </p>
            </div>
          )}
        </div>
      </main>

      <footer>
        <Controls
          onScoreLeft={() => dispatch({ type: 'SCORE_POINT', team: 'left' })}
          onScoreRight={() => dispatch({ type: 'SCORE_POINT', team: 'right' })}
          onUndo={() => dispatch({ type: 'UNDO' })}
          canUndo={canUndo(state)}
          disabledScoring={present.status !== 'in-progress'}
        />
      </footer>

      {present.status === 'finished' && (
        <WinnerOverlay
          winner={present.winner}
          games={present.games}
          players={present.players}
          avatars={avatars}
          onReset={newMatch}
          onUndo={() => dispatch({ type: 'UNDO' })}
        />
      )}

      {pickerFor && (
        <AvatarPicker
          playerName={present.players[pickerFor].name}
          onPick={pickAvatar}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}

// Centered vertically against the avatar circle (h-16) so the chip stays level
// regardless of the serve indicator / serve button below the avatars.
function GamesBadge({ value }) {
  return (
    <div className="flex h-12 items-center sm:h-16">
      <span
        className="min-w-8 rounded-xl bg-slate-100 px-2 py-1 text-center text-2xl font-black text-slate-500 sm:min-w-12 sm:px-3 sm:py-2 sm:text-3xl"
        title="Games dimenangkan"
      >
        {value}
      </span>
    </div>
  );
}
