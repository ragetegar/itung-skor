import { useEffect, useRef, useState } from 'react';
import { CowokArt, CewekArt } from './AvatarArt.jsx';

// Center modal to choose a player's avatar: illustration, camera photo, or letter.
// Avatars are cosmetic and never persisted (kept only for the current match).
export default function AvatarPicker({ playerName, onPick, onClose }) {
  const [mode, setMode] = useState('options'); // 'options' | 'camera'
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setError(null);
    setMode('camera');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch {
      setError('Kamera tidak bisa diakses');
      setMode('options');
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const size = Math.min(video.videoWidth, video.videoHeight) || 240;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    const src = canvas.toDataURL('image/jpeg', 0.85);
    stopStream();
    onPick({ kind: 'photo', src });
  }

  function cancelCamera() {
    stopStream();
    setMode('options');
  }

  // Always release the camera when the picker unmounts.
  useEffect(() => () => stopStream(), []);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-[min(90vw,420px)] rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Avatar {playerName}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full px-3 py-1 text-xl text-slate-400 active:text-slate-600"
          >
            ✕
          </button>
        </div>

        {mode === 'options' && (
          <div className="grid grid-cols-2 gap-3">
            <PickerTile label="Cowok" onClick={() => onPick({ kind: 'cowok' })}>
              <div className="h-20 w-20">
                <CowokArt />
              </div>
            </PickerTile>
            <PickerTile label="Cewek" onClick={() => onPick({ kind: 'cewek' })}>
              <div className="h-20 w-20">
                <CewekArt />
              </div>
            </PickerTile>
            <PickerTile label="Kamera" onClick={startCamera}>
              <div className="flex h-20 w-20 items-center justify-center text-4xl">📷</div>
            </PickerTile>
            <PickerTile label="Huruf" onClick={() => onPick(null)}>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-3xl font-bold text-slate-600">
                {playerName}
              </div>
            </PickerTile>
            {error && <p className="col-span-2 text-center text-sm text-rose-500">{error}</p>}
          </div>
        )}

        {mode === 'camera' && (
          <div className="flex flex-col items-center gap-4">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-56 w-56 rounded-2xl bg-slate-900 object-cover"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={capture}
                className="rounded-full bg-emerald-500 px-6 py-3 text-lg font-bold text-white active:bg-emerald-600"
              >
                📸 Jepret
              </button>
              <button
                type="button"
                onClick={cancelCamera}
                className="rounded-full bg-slate-200 px-6 py-3 text-lg font-semibold text-slate-700 active:bg-slate-300"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PickerTile({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 p-3 active:bg-slate-50"
    >
      {children}
      <span className="text-sm font-semibold text-slate-600">{label}</span>
    </button>
  );
}
