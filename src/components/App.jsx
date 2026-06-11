import { useReducer } from 'react';
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

export default function App() {
  const [state, dispatch] = useReducer(matchReducer, initialState);
  const { present } = state;
  const serverId = selectCurrentServer(present);
  const golden = isGolden(present);
  const firstServerChosen = present.firstServerId !== null;

  return (
    <div className="relative flex h-full flex-col bg-slate-50 px-6 py-4 text-slate-900">
      <header className="flex justify-center">
        <FormatSelector
          format={present.format}
          onChange={(f) => dispatch({ type: 'SET_FORMAT', format: f })}
        />
      </header>

      <main className="flex flex-1 items-center justify-between gap-6">
        <TeamPanel
          side="left"
          playerIds={TEAMS.left}
          players={present.players}
          currentServerId={serverId}
          firstServerChosen={firstServerChosen}
          gamesCount={present.games.left}
          onChooseServe={(id) => dispatch({ type: 'SET_FIRST_SERVER', playerId: id })}
        />

        <div className="flex flex-col items-center gap-2">
          <BigScore points={present.points} golden={golden} />
          {!firstServerChosen && (
            <p className="text-lg text-slate-400">Pilih siapa yang serve duluan</p>
          )}
        </div>

        <TeamPanel
          side="right"
          playerIds={TEAMS.right}
          players={present.players}
          currentServerId={serverId}
          firstServerChosen={firstServerChosen}
          gamesCount={present.games.right}
          onChooseServe={(id) => dispatch({ type: 'SET_FIRST_SERVER', playerId: id })}
        />
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
          onReset={() => dispatch({ type: 'RESET' })}
          onUndo={() => dispatch({ type: 'UNDO' })}
        />
      )}
    </div>
  );
}
