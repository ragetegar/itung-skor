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
    <div className="flex w-14 flex-col items-center gap-1 sm:w-20">
      <button
        type="button"
        onClick={onOpenPicker}
        aria-label={`Pilih avatar ${player.name}`}
        className="rounded-full active:opacity-80"
      >
        <AvatarFace
          player={player}
          avatar={avatar}
          sizeClass="h-12 w-12 sm:h-16 sm:w-16"
          textClass="text-xl sm:text-2xl"
        />
      </button>
      {/* Fixed-height slot so showing/hiding the serve button never shifts the avatars. */}
      <div className="flex h-8 items-center justify-center">
        {showServeButton && (
          <button
            type="button"
            onClick={onChooseServe}
            className="whitespace-nowrap rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold text-white active:bg-emerald-600 sm:px-3 sm:text-sm"
          >
            <span className="inline-block animate-bounce">🎾</span> Serve
          </button>
        )}
        {isServer && (
          <div className="text-2xl" aria-label="server" title="Serve">
            🎾
          </div>
        )}
      </div>
    </div>
  );
}
