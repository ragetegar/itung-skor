export default function PlayerAvatar({ player, isServer, showServeButton, onChooseServe }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-700 ring-2 ring-slate-300">
        {player.name}
      </div>
      {showServeButton && (
        <button
          type="button"
          onClick={onChooseServe}
          className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white active:bg-emerald-600"
        >
          🎾 Serve
        </button>
      )}
      {isServer && (
        <div className="text-2xl" aria-label="server" title="Serve">
          🎾
        </div>
      )}
    </div>
  );
}
