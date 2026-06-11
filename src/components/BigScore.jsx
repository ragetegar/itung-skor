import { POINT_LABELS } from '../lib/scoring.js';

export default function BigScore({ points, golden }) {
  if (golden) {
    return (
      <div className="text-7xl font-black tracking-tight text-amber-500">GOLDEN</div>
    );
  }
  return (
    <div className="flex items-center gap-8 text-8xl font-black text-slate-800">
      <span>{POINT_LABELS[points.left]}</span>
      <span className="text-slate-300">—</span>
      <span>{POINT_LABELS[points.right]}</span>
    </div>
  );
}
