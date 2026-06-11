import AvatarFace from './AvatarFace.jsx';

// avatar descriptor: null (letter) | {kind:'cowok'} | {kind:'cewek'} | {kind:'photo', src}
export default function PlayerAvatar({
  player,
  avatar,
  isServer,
  showServeButton,
  onChooseServe,
  onOpenPicker,
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onOpenPicker}
        aria-label={`Pilih avatar ${player.name}`}
        className="rounded-full active:opacity-80"
      >
        <AvatarFace player={player} avatar={avatar} />
      </button>
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
