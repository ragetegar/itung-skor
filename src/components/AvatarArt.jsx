// Simple inline-SVG character illustrations. Sized to fill their container.

export function CowokArt() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Avatar cowok" className="h-full w-full">
      <circle cx="32" cy="32" r="32" fill="#dbeafe" />
      {/* shoulders / shirt */}
      <path d="M13 64 C13 49 51 49 51 64 Z" fill="#2563eb" />
      {/* face */}
      <circle cx="32" cy="29" r="12" fill="#f4c89b" />
      {/* short hair cap */}
      <path d="M20 27 C20 15 44 15 44 27 C44 22 40 19 32 19 C24 19 20 22 20 27 Z" fill="#1f2937" />
    </svg>
  );
}

export function CewekArt() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Avatar cewek" className="h-full w-full">
      <circle cx="32" cy="32" r="32" fill="#fce7f3" />
      {/* shoulders / shirt */}
      <path d="M13 64 C13 49 51 49 51 64 Z" fill="#db2777" />
      {/* long hair behind */}
      <path d="M16 32 C16 13 48 13 48 34 C48 46 44 52 44 52 L20 52 C20 52 16 46 16 32 Z" fill="#3f2a1d" />
      {/* face */}
      <circle cx="32" cy="29" r="12" fill="#f7cda3" />
      {/* hair over forehead */}
      <path d="M20 26 C20 15 44 15 44 26 C44 21 40 18 32 18 C24 18 20 21 20 26 Z" fill="#3f2a1d" />
    </svg>
  );
}
