import { CowokArt, CewekArt } from './AvatarArt.jsx';

// Presentational avatar circle: renders a letter, an illustration, or a photo.
// No interactivity — wrap in a button if you need clicks.
export default function AvatarFace({ player, avatar, sizeClass = 'h-16 w-16', textClass = 'text-2xl' }) {
  return (
    <div className={`${sizeClass} overflow-hidden rounded-full bg-slate-200 ring-2 ring-slate-300`}>
      {avatar == null && (
        <span
          className={`flex h-full w-full items-center justify-center font-bold text-slate-700 ${textClass}`}
        >
          {player.name}
        </span>
      )}
      {avatar?.kind === 'cowok' && <CowokArt />}
      {avatar?.kind === 'cewek' && <CewekArt />}
      {avatar?.kind === 'photo' && (
        <img src={avatar.src} alt={`Foto ${player.name}`} className="h-full w-full object-cover" />
      )}
    </div>
  );
}
