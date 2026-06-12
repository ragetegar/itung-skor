# Itung Skor

Papan skor padel doubles untuk iPad (landscape). React SPA dengan relay realtime kecil di Cloudflare Worker.

## Jalankan lokal

```bash
npm install
npm run dev      # buka URL yang ditampilkan (http://localhost:5173)
```

## Test

```bash
npm test
```

## Build produksi

```bash
npm run build    # output ke folder dist/
npm run preview  # cek hasil build secara lokal
```

## Deploy

Worker dipakai sebagai relay realtime:

```bash
npm run build
npx wrangler deploy
```

Frontend tetap dapat dideploy melalui project Cloudflare Pages lama dan dibuka di
`https://itung-skor.pages.dev`. Build production otomatis menghubungkan frontend Pages ke
relay `wss://itung-skor.ragetegar.workers.dev`.

Tidak perlu API token atau secret di frontend. URL relay dalam `.env.production` adalah
alamat publik, bukan credential.

## Cara pakai

- iPad pencatat skor menampilkan kode scoreboard 4 digit.
- Di layar lapangan, buka `/scoreboard`, masukkan kode tersebut, lalu skor akan mengikuti iPad secara realtime.
- Pilih format di tab atas (Best of 3 / 4 / 5) — bisa diganti kapan saja, skor tetap.
- Klik tombol 🎾 Serve di bawah salah satu tim untuk menentukan sisi yang serve pertama.
- Tambah poin lewat **+ POIN KIRI** / **+ POIN KANAN**.
- 40-40 = **GOLDEN** (1 poin penentu).
- Salah pencet? Tekan **⤺ Revert** (bisa berkali-kali, kronologis).
- **Klik avatar** untuk pilih karakter: ilustrasi cowok/cewek, 📷 foto pakai kamera, atau balik ke huruf. (Cuma tampil selama pertandingan — gak disimpan, hilang saat Match Baru/refresh. Kamera perlu localhost atau HTTPS.)
- Match selesai → banner pemenang + **Match Baru** untuk reset.

## Catatan teknis

- Logika skor murni di `src/lib/scoring.js` & pergantian tim serve di `src/lib/serve.js` (tanpa React, di-unit-test).
- State match + riwayat undo di `src/state/matchReducer.js`. Tim yang serve saat ini *diturunkan* dari (tim pertama + jumlah game), jadi Revert otomatis mengembalikan giliran serve.
- State controller utama reset saat refresh / Match Baru. Snapshot scoreboard terakhir disimpan di room Cloudflare agar penonton baru langsung melihat skor terbaru.
- Sinkronisasi lokal memakai `BroadcastChannel` + `localStorage`; sinkronisasi lintas perangkat memakai WebSocket Cloudflare Durable Object.
