export default function Controls({ onScoreLeft, onScoreRight, onUndo, canUndo, disabledScoring }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full gap-4">
        <button
          type="button"
          onClick={onScoreLeft}
          disabled={disabledScoring}
          className="flex-1 rounded-2xl bg-sky-500 py-8 text-3xl font-black text-white active:bg-sky-600 disabled:opacity-40"
        >
          + POIN KIRI
        </button>
        <button
          type="button"
          onClick={onScoreRight}
          disabled={disabledScoring}
          className="flex-1 rounded-2xl bg-rose-500 py-8 text-3xl font-black text-white active:bg-rose-600 disabled:opacity-40"
        >
          + POIN KANAN
        </button>
      </div>
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="rounded-full bg-slate-700 px-6 py-3 text-lg font-semibold text-white active:bg-slate-800 disabled:opacity-30"
      >
        ⤺ Revert
      </button>
    </div>
  );
}
