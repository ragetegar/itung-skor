import { POINT_LABELS } from '../lib/scoring.js';

export default function BigScore({ points, golden }) {
  if (golden) {
    return (
      <div className="text-7xl font-black tracking-tight text-amber-500">GOLDEN</div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-6xl font-black tabular-nums text-slate-800 sm:gap-8 sm:text-8xl">
      <span className="w-20 text-center sm:w-28">{POINT_LABELS[points.left]}</span>
      <span className="text-4xl text-slate-300 sm:text-8xl">—</span>
      <span className="w-20 text-center sm:w-28">{POINT_LABELS[points.right]}</span>
    </div>
  );
}
