const FORMATS = [
  { id: 'bo3', label: 'Best of 3' },
  { id: 'bo4', label: 'Best of 4' },
  { id: 'bo5', label: 'Best of 5' },
];

export default function FormatSelector({ format, onChange }) {
  return (
    <div className="inline-flex rounded-full bg-slate-200 p-1">
      {FORMATS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            format === f.id ? 'bg-white text-slate-900 shadow' : 'text-slate-500'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
