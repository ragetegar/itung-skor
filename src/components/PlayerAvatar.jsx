import AvatarFace from './AvatarFace.jsx';

// avatar descriptor: null (letter) | {kind:'cowok'} | {kind:'cewek'} | {kind:'photo', src}
export default function PlayerAvatar({
  player,
  avatar,
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
    </div>
  );
}
