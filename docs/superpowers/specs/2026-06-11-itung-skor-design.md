# Itung Skor — Padel/Tennis Scoreboard (Design Spec)

**Tanggal:** 2026-06-11
**Status:** Disetujui (menunggu review tertulis)

## 1. Tujuan

Aplikasi papan skor (scoreboard) untuk **padel doubles (4 pemain)** yang dipajang di **iPad (landscape, tema terang)** di pinggir lapangan. Skor ditambah manual lewat tombol besar yang ramah sentuh. Tanpa backend, tanpa database — semua state di memori dan hilang saat refresh / "Match Baru".

Tennis singles (2 pemain) **ditunda** ke versi berikutnya.

## 2. Tech stack & deploy

- **Vite + React** (SPA statis, JavaScript).
- **Tailwind CSS v4** untuk styling (layout besar, responsif). Plugin `@tailwindcss/vite`.
- **Vitest** untuk unit test logika.
- **Tanpa database / backend.** State match = React state di memori.
- **Deploy: Cloudflare Pages.** Build command `npm run build`, output dir `dist`, preset framework "Vite". Tidak ada env var / server function.
- Orientasi target: **landscape**, tema **terang**.

## 3. Domain & aturan skor

### 3.1 Tim & pemain
- **Tim Kiri** = pemain **A**, **B**.
- **Tim Kanan** = pemain **C**, **D**.
- Selalu doubles (4 pemain) di versi ini.

### 3.2 Poin dalam 1 game
- Skala poin: `0 → 15 → 30 → 40` (disimpan sebagai indeks `0,1,2,3`; label tampil `0/15/30/40`).
- Saat sebuah tim menang poin:
  - Jika tim itu **belum di 40** (indeks < 3) → naik 1 tingkat.
  - Jika tim itu **sudah di 40** (indeks = 3) dan lawan **belum 40** → **menang game**.
  - Jika **kedua tim di 40** (40–40) → state **GOLDEN**: tim mana pun yang menang poin berikutnya **langsung menang game** (1 poin sudden death, "punto de oro"). Tidak ada deuce/advantage.
- Tampilan saat 40–40: tampilkan **"GOLDEN"** (bukan "40–40").

### 3.3 Game → Match (best of)
Hanya **2 level**: poin → menang game; kumpulan game → menang match. **Tidak ada** layer "set sampai 6 game".

| Format | Menang jika capai | Maks game | Bisa seri |
|--------|-------------------|-----------|-----------|
| Best of 3 | 2 game | 3 | tidak |
| Best of 4 | 3 game | 4 | ya (2–2 = Seri) |
| Best of 5 | 3 game | 5 | tidak |

Aturan umum yang dipakai engine:
- `winTarget`: Bo3 → 2, Bo4 → 3, Bo5 → 3.
- `maxGames`: Bo3 → 3, Bo4 → 4, Bo5 → 5.
- Match **selesai-menang** begitu sebuah tim mencapai `winTarget`.
- Match **selesai-seri** jika total game yang dimainkan = `maxGames` dan belum ada yang capai `winTarget` (hanya mungkin di Bo4 pada skor 2–2).

### 3.4 Ganti format saat main
- Format ditampilkan sebagai **tab/segmen di atas-tengah** (`Bo3 | Bo4 | Bo5`); tab yang aktif di-highlight.
- Tab bisa **di-klik kapan saja** untuk pindah format — saat awal maupun di tengah match.
- Pindah format **TIDAK me-reset poin/game yang sedang berjalan**. Yang berubah cuma "garis menang" (`winTarget`/`maxGames`), dan status menang/seri **dihitung ulang** dari jumlah game saat ini.
  - Contoh: lagi 1–1 di Bo3, klik ke Bo5 → skor tetap 1–1, tapi sekarang butuh 3 game untuk menang.
- Edge case: jika setelah ganti format kedua tim sama-sama memenuhi/melebihi `winTarget`, pemenang = tim dengan game terbanyak; jika sama → Seri. (Disimpan sederhana; ganti format paling ideal dilakukan di awal.)

## 4. Serve / giliran service

### 4.1 Memilih server pertama
- **Awal match (status `pre-serve`):** belum ada server. Setiap avatar (A/B/C/D) menampilkan **tombol bola kecil "Serve"**.
- Setelah suit di lapangan, user **klik 1 pemain** → pemain itu jadi server pertama, tombol "Serve" pemain lain **hilang**, dan pemain terpilih mendapat **ikon bola 🎾** di bawah avatarnya. Status berubah ke `in-progress`.

### 4.2 Rotasi (ganti tiap selesai 1 game)
- Tim **selalu gantian** tiap game; dalam 1 tim, 2 pemainnya juga gantian.
- Urutan diturunkan dari **server pertama**:
  - Mulai **A** → `A, C, B, D, A, C, …`
  - Mulai **C** → `C, A, D, B, C, …`
  - Mulai **B** → `B, C, A, D, …`
  - Mulai **D** → `D, A, C, B, …`
- Aturan formal: `serveSequence(first)` = `[first, otherTeamStarter, firstPartner, otherTeamOther]`, lalu berulang. `otherTeamStarter` = pemain pertama tim lawan secara kanonik (A untuk tim kiri, C untuk tim kanan).

### 4.3 Server saat ini = turunan, bukan state tersimpan
- `currentServer = serveSequence(firstServerId)[completedGames % 4]`.
- Karena diturunkan dari (`firstServerId`, jumlah game selesai), **revert otomatis mengembalikan giliran serve dengan benar** tanpa logika tambahan.

## 5. Revert (undo global, kronologis)

- **Satu** tombol **Revert** di bawah-tengah.
- Setiap aksi yang mengubah state (tambah poin, pilih server pertama, ganti format) menyimpan **snapshot state sebelumnya** ke tumpukan riwayat (`past`).
- Tiap tap Revert = **mundur 1 aksi paling terakhir secara kronologis**, sisi mana pun. Mundur **tanpa batas** sampai awal.
- Karena kronologis, kombinasi skor apa pun yang pernah tercapai bisa dibalikin. Contoh: `30–40` (harusnya `15–30`) → Revert 2× → `30–30` → `15–30`.
- Revert juga **membatalkan game/match yang terlanjur dimenangkan** dan **overlay pemenang** (karena snapshot mengembalikan `games`, `status`, `winner`, `points`).

## 6. UI / Layout (landscape, tema terang)

```
┌────────────────────────────────────────────────────────┐
│                  [ Bo3 ]  [•Bo4•]  [ Bo5 ]              │  selektor format (atas-tengah)
│                                                          │
│   (A) (B)                                    (C) (D)    │  avatar: tim kiri vs tim kanan
│      🎾  (server)                                        │  ikon bola di bawah server
│                                                          │
│   Games 2          40    —    GOLDEN          Games 1   │  skor RAKSASA game berjalan + jml game
│                                                          │
│  [      + POIN  KIRI      ]   [      + POIN  KANAN     ] │  tombol poin per tim (besar)
│                     [  ⤺  Revert  ]                     │  undo global
└────────────────────────────────────────────────────────┘
```

- **Skor poin game berjalan** ditampilkan paling besar di tengah; saat 40–40 ganti jadi **"GOLDEN"**.
- **Jumlah game** ("Games X") per tim tampil di dekat skor.
- **Tab format** (`Bo3 | Bo4 | Bo5`) real-time di atas-tengah, tab aktif ditonjolkan; klik untuk ganti kapan saja.
- Saat match **selesai/seri** → muncul **overlay banner pemenang** ("Tim Kiri Menang!" / "Tim Kanan Menang!" / "Seri") + tombol **"Match Baru"** (reset penuh). Overlay tetap bisa di-Revert kalau ternyata kepencet.

## 7. Arsitektur kode

Modul dipisah agar tiap unit punya satu tujuan jelas & bisa dites independen.

- `src/lib/scoring.js` — **mesin skor murni** (no React). Fungsi: `POINT_LABELS`, `formatConfig(format)`, `scorePoint(state, team)`, `evaluateMatch(games, format)`. **Dikembangkan TDD.**
- `src/lib/serve.js` — **logika serve murni**. Fungsi: `TEAMS`, `serveSequence(firstServerId)`, `currentServer(firstServerId, completedGames)`. **Dikembangkan TDD.**
- `src/state/matchReducer.js` — `initialState`, reducer dengan tumpukan `past` untuk undo. Aksi: `SCORE_POINT(team)`, `SET_FIRST_SERVER(playerId)`, `SET_FORMAT(format)`, `UNDO`, `RESET`.
- Komponen React (`src/components/`):
  - `App.jsx` — host reducer + layout utama.
  - `FormatSelector.jsx` — toggle Bo3/Bo4/Bo5.
  - `TeamPanel.jsx` (×2, kiri & kanan) — avatar tim + indikator/tombol serve + jumlah game.
  - `PlayerAvatar.jsx` — lingkaran avatar (placeholder inisial/warna) + tombol "Serve"/ikon bola. Sudah disiapkan baca field `avatar` untuk fitur masa depan.
  - `BigScore.jsx` — skor poin raksasa di tengah, termasuk state GOLDEN.
  - `Controls.jsx` — tombol "+POIN KIRI", "+POIN KANAN", "Revert".
  - `WinnerOverlay.jsx` — banner pemenang/seri + "Match Baru".

### 7.1 Bentuk state
```js
{
  format: 'bo3' | 'bo4' | 'bo5',      // default 'bo3'
  players: {                           // disiapkan untuk avatar masa depan
    A: { name: 'A', avatar: null },
    B: { name: 'B', avatar: null },
    C: { name: 'C', avatar: null },
    D: { name: 'D', avatar: null },
  },
  firstServerId: 'A'|'B'|'C'|'D'|null, // null = pre-serve
  points: { left: 0..3, right: 0..3 }, // poin game berjalan (indeks)
  games:  { left: int,  right: int },  // game yang sudah dimenangkan
  status: 'pre-serve' | 'in-progress' | 'finished',
  winner: 'left' | 'right' | 'tie' | null,
}
```
Wrapper undo: `{ present: <state di atas>, past: <state[]> }`.

Nilai turunan (tidak disimpan): `currentServerId`, flag `golden` (`points.left===3 && points.right===3`), label poin.

## 8. Testing

- **TDD** untuk `scoring.js` & `serve.js` (paling rawan bug):
  - Naik poin 0→15→30→40, menang game di 40 saat lawan < 40.
  - 40–40 → GOLDEN; poin berikutnya menang game.
  - Menang match per format (Bo3/Bo4/Bo5) & seri 2–2 di Bo4.
  - `serveSequence` untuk tiap kemungkinan server pertama; `currentServer` per indeks game.
- Tes reducer: SCORE_POINT mengubah poin/game/status benar; UNDO mengembalikan snapshot persis; RESET; SET_FORMAT menghitung ulang.
- Tes komponen ringan opsional (interaksi tombol poin & overlay).

## 9. Out of scope (versi ini)

- **Tennis singles / mode 2 pemain.**
- **Pemilihan avatar (ikon cowok/cewek / upload foto).** State `players[x].avatar` sudah disediakan sebagai seam; UI picker dibangun nanti. Saat dibangun: disimpan di memori saja, hilang saat refresh/Match Baru.
- Persistensi/penyimpanan, riwayat match antar sesi, multi-lapangan, akun.
- Layer set tenis penuh (first-to-6 + tiebreak).
