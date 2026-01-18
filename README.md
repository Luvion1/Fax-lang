<p align="center">
  <img src="assets/logo.svg" width="160" height="160" />
</p>

<h1 align="center">Fax-lang</h1>

<p align="center">
  <strong>Modern Systems Programming Language with Life-Force Memory Management</strong>
</p>

<p align="center">
  <a href="https://github.com/Luvion1/Fax-lang/actions"><img src="https://github.com/Luvion1/Fax-lang/workflows/CI/badge.svg" alt="CI Status"></a>
  <a href="https://github.com/Luvion1/Fax-lang/actions"><img src="https://github.com/Luvion1/Fax-lang/workflows/Deploy%20Docs/badge.svg" alt="Docs Status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

---

## 🦊 Apa itu Fax-lang?

Fax-lang adalah bahasa pemrograman tingkat rendah yang dirancang untuk performa tinggi dengan paradigma manajemen memori yang revolusioner. Dibangun di atas LLVM, Fax menjamin keamanan memori tanpa menggunakan *Garbage Collector* atau *Borrow Checker* tradisional, melainkan menggunakan sistem **Life-Force**.

## ✨ Fitur Unggulan

### 1. Sistem Memori Life-Force (Rule 2)
Setiap variabel memiliki "energi" yang berkurang saat digunakan.
- **Read**: -0.02 | **Write**: -0.08
- Jika energi habis, variabel tidak bisa diakses lagi. Ini menjamin pembersihan memori yang deterministik.

### 2. State Machine Kontraktual (Rule 4)
*State machine* adalah warga kelas satu. Transisi antar status diperiksa secara ketat saat kompilasi.
```fax
state_machine Connection {
    state Closed {
        fn connect() -> Connecting { ... }
    }
}
```

### 3. Shadow & Mirroring (Rule 1)
Akses data melalui *read-only views* (Shadow) yang secara cerdas membuat salinan (*Mirror*) hanya pada bagian yang berubah.

### 4. Unified Memory Space (Rule 3)
Kompilator secara otomatis menentukan apakah data harus berada di **Stack**, **Heap**, atau **Hybrid** berdasarkan pola aksesnya.

---

## 🛠 Instalasi

### Prasyarat
- Node.js (v18+)
- LLVM (llc & clang v14/18)

### Setup Proyek
```bash
git clone https://github.com/Luvion1/Fax-lang.git
cd Fax-lang
npm install
```

---

## 🚀 Cara Penggunaan

### Kompilasi Kode
```bash
# Membangun file biner dari kode .fx
npm run dev build examples/mvp.fx

# Menjalankan hasil kompilasi
./examples/mvp
```

### Analisis AST
```bash
npm run dev ast examples/mvp.fx
```

---

## 📖 Dokumentasi
Dokumentasi lengkap yang dibangun dengan **mdBook** tersedia di folder `docs/`. Jika Anda menggunakan GitHub, dokumentasi ini otomatis terbit di GitHub Pages.

Jalankan secara lokal:
```bash
cd docs
mdbook serve --open
```

## 🤝 Kontribusi
Kami sangat terbuka bagi kontributor! Silakan ajukan *Issue* untuk melaporkan bug atau *Pull Request* untuk fitur baru. Pastikan untuk mengikuti standar kode yang ada.

---

<p align="center">
  Dibuat dengan ❤️ oleh <a href="https://github.com/Luvion1">Luvion1</a>
</p>