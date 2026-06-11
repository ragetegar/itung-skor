import PlayerAvatar from './PlayerAvatar.jsx';

export default function TeamPanel({
  playerIds,
  players,
  avatars,
  currentServerId,
  firstServerChosen,
  onChooseServe,
  onOpenPicker,
}) {
  return (
    <div className="flex gap-4">
      {playerIds.map((id) => (
        <PlayerAvatar
          key={id}
          player={players[id]}
          avatar={avatars[id]}
          isServer={currentServerId === id}
          showServeButton={!firstServerChosen}
          onChooseServe={() => onChooseServe(id)}
          onOpenPicker={() => onOpenPicker(id)}
        />
      ))}
    </div>
  );
}
