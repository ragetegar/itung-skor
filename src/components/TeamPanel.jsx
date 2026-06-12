import PlayerAvatar from './PlayerAvatar.jsx';

export default function TeamPanel({
  playerIds,
  players,
  avatars,
  isServing,
  showServeButton,
  onChooseServe,
  onOpenPicker,
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1 sm:gap-4">
        {playerIds.map((id) => (
          <PlayerAvatar
            key={id}
            player={players[id]}
            avatar={avatars[id]}
            onOpenPicker={() => onOpenPicker(id)}
          />
        ))}
      </div>
      <div className="flex h-8 items-center justify-center">
        {showServeButton && (
          <button
            type="button"
            onClick={onChooseServe}
            className="whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white active:bg-emerald-600 sm:px-4 sm:text-sm"
          >
            <span className="inline-block animate-bounce">🎾</span> Serve
          </button>
        )}
        {isServing && (
          <div className="text-2xl" aria-label="serving team" title="Serving team">
            🎾
          </div>
        )}
      </div>
    </div>
  );
}
