import { CowokArt, CewekArt } from './AvatarArt.jsx';

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
        className="h-16 w-16 overflow-hidden rounded-full bg-slate-200 ring-2 ring-slate-300 active:ring-slate-400"
      >
        {avatar == null && (
          <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-700">
            {player.name}
          </span>
        )}
        {avatar?.kind === 'cowok' && <CowokArt />}
        {avatar?.kind === 'cewek' && <CewekArt />}
        {avatar?.kind === 'photo' && (
          <img src={avatar.src} alt={`Foto ${player.name}`} className="h-full w-full object-cover" />
        )}
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
