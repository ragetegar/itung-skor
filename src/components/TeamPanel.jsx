import PlayerAvatar from './PlayerAvatar.jsx';

export default function TeamPanel({
  side,
  playerIds,
  players,
  currentServerId,
  firstServerChosen,
  gamesCount,
  onChooseServe,
}) {
  const align = side === 'left' ? 'items-start' : 'items-end';
  return (
    <div className={`flex flex-col gap-3 ${align}`}>
      <div className="flex gap-4">
        {playerIds.map((id) => (
          <PlayerAvatar
            key={id}
            player={players[id]}
            isServer={currentServerId === id}
            showServeButton={!firstServerChosen}
            onChooseServe={() => onChooseServe(id)}
          />
        ))}
      </div>
      <div className="text-lg font-semibold text-slate-500">Games {gamesCount}</div>
    </div>
  );
}
