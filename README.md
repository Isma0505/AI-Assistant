# AI Assistant Studio (Gemini)

Aplikasi chatbot sederhana berbasis **Google Gemini API** (vanilla JS) dengan pilihan *use case templates*, pengaturan parameter (temperature, max tokens, top-p), dan fitur export chat.

> Catatan penting: Aplikasi ini butuh **API Key Gemini** untuk mode asli. Tanpa API Key, aplikasi akan berjalan di **Demo Mode**.

---

## Fitur Utama

- **Template Usecase**: Pilih dari berbagai persona AI (Umum, Coding, Bahasa, dll) dengan instruksi sistem dan parameter yang telah dikonfigurasi.
- **Konfigurasi Penuh**: Atur model AI (`gemini-2.5-pro`/`flash`), *temperature*, *max tokens*, dan *top-p* secara real-time.
- **Mode Demo Cerdas**: Aplikasi tetap fungsional tanpa API key, memberikan respons simulasi yang relevan dengan usecase yang dipilih.
- **Render Markdown**: Respons dari AI ditampilkan dengan format yang kaya, mendukung:
  - Blok kode dengan penanda bahasa dan tombol "Salin Kode".
  - Teks tebal (`**bold**`) dan miring (`*italic*`).
  - Daftar tidak berurutan (`- item`) dan berurutan (`1. item`).
  - Blockquotes (`> kutipan`).
- **Manajemen Sesi**: Hapus percakapan saat ini atau mulai dari awal dengan mudah.
- **Ekspor Riwayat**: Unduh seluruh percakapan sebagai file `.txt` atau `.json`.
- **Desain Responsif**: Antarmuka yang dapat diakses di desktop maupun perangkat mobile.
- **Tema Terang & Gelap**: Ganti tema sesuai preferensi Anda.

## Prasyarat

- Browser modern (Chrome/Edge recommended)
- (Opsional) Internet untuk akses API Gemini
- **Gemini API Key**

---

## Cara Menjalankan

### Opsi A (Disarankan): Jalankan via Local Server
Karena file `index.html` membuka halaman dengan skema `file://` sering memunculkan error security origin, gunakan local server.

1. Pastikan Anda berada di folder project ini: `d:/AiAsisstent`
2. Jalankan command berikut (PowerShell/Terminal):

```bash
npx serve .
```

Jika `npx` belum ada, instal terlebih dahulu `serve`:

```bash
npm i -g serve
serve .
```

3. Buka URL yang diberikan oleh server (contoh: `http://localhost:3000`).
4. Masukkan Gemini API Key di panel kiri.
5. Ketik pesan di chat lalu klik **Send**.

### Opsi B: Buka langsung `index.html`

1. Double click `index.html`.

⚠️ Ini tidak selalu berjalan untuk request API karena perbedaan security origin (`file://`). Jika terjadi error CORS/security, gunakan Opsi A.

---

## Cara Konfigurasi

1. Buka halaman `index.html` di browser
2. Di sidebar kiri:
   - **Gemini API Key**: tempel API key Anda
   - **Model**: pilih `gemini-2.5-flash` atau `gemini-2.5-pro`
   - **Temperature**: 0.0–2.0
   - **Max Output Tokens**: batas panjang output
   - **Top-P**: sampling nucleus
   - **System Instruction**: instruksi tambahan untuk “role” AI
3. Pilih preset use case (General/Coding/etc.)

---

## Cara Menggunakan

- Ketik pesan pada kolom chat
- Tekan **Enter** untuk kirim (Shift+Enter untuk baris baru)
- Klik tombol **Send** jika ingin mengirim manual

### Starter Prompts
- Saat pertama kali membuka halaman atau setelah reset, akan muncul kartu *starter prompts*
- Klik kartu starter untuk otomatis mengisi input chat

---

## Troubleshooting

### 1) Error `charCount.trim is not a function`
Sudah diperbaiki di kode. Pastikan Anda menggunakan versi terbaru file `app.js`.

### 2) Error terkait `file://` atau CORS
Gunakan **Opsi A** (jalankan via local server), bukan buka file langsung.

### 3) Response API kosong / HTTP error
Cek:
- API key benar dan aktif
- Model sesuai dengan akses di akun Gemini Anda
- Pastikan format request tidak terblokir oleh network

---

## Export Chat

- **Ekspor TXT**: unduh percakapan dalam format teks
- **Ekspor JSON**: unduh riwayat chat dalam format JSON

---

## Struktur File

- `index.html` : UI
- `style.css` : styling
- `app.js` : logika chat, template preset, dan call Gemini API


