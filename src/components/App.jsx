import { useReducer, useState } from 'react';
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
    <div className="relative flex h-full flex-col bg-slate-50 px-6 py-4 text-slate-900">
      <header className="flex justify-center">
        <FormatSelector
          format={present.format}
          onChange={(f) => dispatch({ type: 'SET_FORMAT', format: f })}
        />
      </header>

      {/* Avatar band: near the top, pulled toward center (not at screen edges) */}
      <div className="mt-3 flex items-start justify-center gap-24">
        <div className="flex items-start gap-3">
          <TeamPanel playerIds={TEAMS.left} {...teamProps} />
          <GamesBadge value={present.games.left} />
        </div>
        <div className="flex items-start gap-3">
          <GamesBadge value={present.games.right} />
          <TeamPanel playerIds={TEAMS.right} {...teamProps} />
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <BigScore points={present.points} golden={golden} />
          {!firstServerChosen && (
            <p className="text-lg text-slate-400">Pilih siapa yang serve duluan</p>
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
    <div className="flex h-16 items-center">
      <span
        className="min-w-[3rem] rounded-xl bg-slate-100 px-3 py-2 text-center text-3xl font-black text-slate-500"
        title="Games dimenangkan"
      >
        {value}
      </span>
    </div>
  );
}
