# Laundry Mobile

Aplikasi operasional laundry (kasir & pemilik) untuk **Android** dan **iOS**, dibangun dengan **Expo SDK 55**, **React Native**, **TypeScript**, **Expo Router**, **TanStack Query**, serta **React Hook Form** + **Zod**.

Backend API memakai proyek Go di folder `../backend` (lihat README backend untuk autentikasi dan endpoint).

## Prasyarat

- **Node.js** 20+ (disarankan LTS)
- **npm** atau **yarn** / **pnpm**
- Untuk menjalankan di perangkat: **Expo Go** versi yang mendukung **SDK 55** (perbarui dari App Store / Play Store), *atau* gunakan **emulator/simulator** / **development build** (lihat di bawah)
- Untuk **development build** native: **Android Studio** (Android) dan/atau **Xcode** (iOS, hanya macOS)

## Instalasi

```bash
cd laundry-mobile
npm install
```

## Menjalankan (Expo dev server)

```bash
npm start
```

Lalu:

- Tekan **`a`** untuk membuka **Android** (emulator atau perangkat dengan Expo Go)
- Tekan **`i`** untuk **iOS Simulator** (macOS)
- atau pindai **QR code** dengan **Expo Go** di HP (Wi‑Fi sama dengan komputer)

Perintah terbatas:

```bash
npx expo start --android
npx expo start --ios
```

## Development build (tanpa Expo Go)

Membangun aplikasi native lokal (berguna jika Expo Go di HP tidak mendukung SDK 55):

```bash
npm run android
# atau
npm run ios
```

Pastikan Android Studio / Xcode sudah terkonfigurasi. Build pertama bisa memakan waktu lebih lama.

## Web (opsional)

```bash
npm run web
```

## Konfigurasi API

URL dasar backend **tanpa** slash di akhir. Diambil dari:

1. `expo.extra.apiBaseUrl` di **`app.json` → `expo.extra.apiBaseUrl`**
2. Jika tidak ada, variabel lingkungan **`EXPO_PUBLIC_API_BASE_URL`**

Contoh override saat menjalankan:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:8080 npm start
```

### Tips per lingkungan

| Lingkungan | Contoh `apiBaseUrl` |
|------------|---------------------|
| Backend lokal (Android Emulator) | `http://10.0.2.2:8080` (mengarah ke `localhost` di komputer Anda) |
| Backend lokal (iOS Simulator) | `http://127.0.0.1:8080` |
| HP fisik (jaringan Wi‑Fi sama) | `http://<IP-LAN-komputer>:8080` |
| Backend ter-deploy (mis. Railway) | `https://your-api.example.com` |

Backend harus mengizinkan koneksi dari perangkat Anda (firewall, binding `0.0.0.0`, HTTPS di produksi).

Setelah mengubah `app.json`, jalankan ulang bundler (`npm start`).

## Autentikasi

Login memakai **JWT** dari backend (`POST /api/v1/auth/login`). Token disimpan di **expo-secure-store** dan dikirim sebagai header `Authorization: Bearer <token>`.

Pastikan backend dikonfigurasi dengan `AUTH_MODE=jwt` dan `JWT_SECRET` sesuai dokumentasi backend.

## Struktur proyek (ringkas)

| Path | Deskripsi |
|------|-----------|
| `app/` | Rute Expo Router (layar, grup `(auth)`, `(app)`, tabs, stack) |
| `src/services/` | Client HTTP & pemanggilan API |
| `src/providers/` | React Query & autentikasi |
| `src/components/ui/` | Komponen UI bersama |
| `src/theme/` | Token desain & warna |
| `src/validation/` | Skema Zod |

## Navigasi (selaras panel web)

**Tab bawah:** Beranda · Nota · Pelanggan · **Menu** · Profil.

Tab **Menu** berisi pintasan ke modul yang di web ada di sidebar: **Jenis layanan**, **Perencanaan pengiriman**, **Karyawan**, **Laporan**, **Pengguna** (daftar pengguna butuh peran admin/owner; jika 403, pesan ditampilkan).

**Ikon:** [@tabler/icons-react-native](https://tabler.io/icons) (outline, konsisten dengan ekosistem Tabler) + **react-native-svg**. Gunakan prop **`strokeWidth`**, bukan `stroke`, agar sesuai tipe komponen SVG.

## Tambah nota (alur sama seperti web)

Alur mengikuti halaman **Tambah Nota** di web (`/orders/new`):

1. **Pelanggan** — pencarian + daftar (hingga 200 data awal, seperti web); pelanggan pertama dipilih otomatis jika ada (sama seperti default di web).
2. **Tanggal masuk / tanggal selesai** — opsional selesai; format ke API `YYYY-MM-DD`.
3. **Item** — beberapa baris; **satuan m²** → panjang & lebar, qty = p × l; **m1** → panjang mengisi qty; selain itu qty manual; harga default dari jenis layanan; diskon; subtotal per baris + **total nota**.
4. **Gambar nota (opsional)** — galeri; jika ada gambar, request memakai **multipart/form-data** seperti web (field `items` berisi JSON string).
5. **Catatan** — opsional.

Paket terkait: `@react-native-community/datetimepicker`, `expo-image-picker` (izin galeri di `app.json` plugins).

## Orientasi layar

`app.json` memakai `"orientation": "default"` agar portrait dan landscape didukung (tablet / ponsel memutar).

## Pemecahan masalah

### Expo Go: “Unsupported SDK” / versi tidak cocok

Versi **Expo Go** di HP harus mendukung **SDK 55**. Perbarui Expo Go dari toko aplikasi, atau gunakan **emulator** dengan Expo Go terbaru, atau jalankan **`npm run android`** / **`npm run ios`** (development build).

### Tidak bisa login / API error

- Pastikan URL di `app.json` / `EXPO_PUBLIC_API_BASE_URL` benar dan backend hidup.
- Dari HP fisik, jangan memakai `localhost` atau `10.0.2.2`— gunakan IP LAN komputer atau URL HTTPS publik.
- Cek backend: `GET /health` dan `POST /api/v1/auth/login` dengan curl.

### Metro / cache aneh

```bash
npx expo start -c
```

## Lisensi

Private project.
