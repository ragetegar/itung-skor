# Itung Skor

Papan skor padel doubles untuk iPad (landscape). React SPA statis, tanpa backend.

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

## Deploy ke Cloudflare Pages

1. Push repo ke GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Save & Deploy. Tidak perlu environment variable / database.

## Cara pakai

- Pilih format di tab atas (Best of 3 / 4 / 5) — bisa diganti kapan saja, skor tetap.
- Klik tombol 🎾 Serve di salah satu pemain untuk menentukan server pertama (setelah suit).
- Tambah poin lewat **+ POIN KIRI** / **+ POIN KANAN**.
- 40-40 = **GOLDEN** (1 poin penentu).
- Salah pencet? Tekan **⤺ Revert** (bisa berkali-kali, kronologis).
- **Klik avatar** untuk pilih karakter: ilustrasi cowok/cewek, 📷 foto pakai kamera, atau balik ke huruf. (Cuma tampil selama pertandingan — gak disimpan, hilang saat Match Baru/refresh. Kamera perlu localhost atau HTTPS.)
- Match selesai → banner pemenang + **Match Baru** untuk reset.

## Catatan teknis

- Logika skor murni di `src/lib/scoring.js` & rotasi serve di `src/lib/serve.js` (tanpa React, di-unit-test).
- State match + riwayat undo di `src/state/matchReducer.js`. Server saat ini *diturunkan* dari (server pertama + jumlah game), jadi Revert otomatis mengembalikan giliran serve.
- Tidak ada penyimpanan: refresh / Match Baru = reset.
