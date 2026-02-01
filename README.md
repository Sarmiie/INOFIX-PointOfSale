# 🛒 Point of Sale (POS) System

Aplikasi Point of Sale berbasis web untuk manajemen produk, pelanggan, dan transaksi dengan antarmuka modern dan responsif.

## 📋 Fitur Utama

### ✅ Manajemen Produk
- CRUD produk dengan upload gambar
- Pencarian dan pagination
- Validasi stok real-time

### ✅ Manajemen Pelanggan
- CRUD pelanggan
- Tambah pelanggan langsung dari halaman transaksi
- Validasi data pelanggan

### ✅ Transaksi POS
- Antarmuka point of sale interaktif
- Keranjang belanja dinamis
- Perhitungan diskon otomatis:
  - 10% untuk pembelian ≥ Rp500.000
  - 15% untuk pembelian ≥ Rp1.000.000
- Validasi stok saat transaksi

### ✅ Autentikasi & Keamanan
- Sistem login admin
- Proteksi rute berbasis token
- Session management

### ✅ UI/UX Modern
- Desain responsive (mobile & desktop)
- Header tetap dengan profil user
- Notifikasi toast untuk feedback pengguna
- Loading states dan error handling

### ✅ Teknologi
- **Frontend**: React 18, Tailwind CSS, React Router v6
- **Backend**: Laravel 12, Sanctum API Authentication
- **Database**: MySQL
- **State Management**: Custom Hooks
- **UI Components**: Reusable components

## 🚀 Instalasi & Setup

### Prasyarat
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- Git

### Langkah Instalasi Backend (Laravel)

1. **Clone repository**
   ```bash
   git clone https://github.com/Sarmiie/INOFIX-PointOfSale.git
   cd pos-backend
2. **Install dependencies PHP**
   ```bash
   composer install
3. **Setup Environment**
   ```bash
   cp .env.example .env
   ```
   Edit file `.env` sesuaikan dengan konfigurasi database Anda:
   
   ```bash
   DB_DATABASE=pos_system
   DB_USERNAME=root
   DB_PASSWORD=

   SANCTUM_STATEFUL_DOMAINS=
   SESSION_DRIVER=cookie
5. **Generate application:key**
   ```bash
   php artisan key:generate
6. **Jalankan migrasi dan seeder**
   ```bash
   php artisan migrate --seed
5. **Jalankan server backend**
   ```bash
   php artisan serve
   ```
   Server akan berjalan di `http://127.0.0.1:8000`

  ### Langkah Instalasi Frontend (React)

  1. **Masuk ke direktori frontend**
     ```bash
     cd frontend
     
  2. **Install dependensies**
     ```bash
     npm install
  3. **Konfigurasi environment**
     Buat file `.env.local`:
    
     ```bash
     VITE_API_URL=http://127.0.0.1:8000
  4. **Jalankan development server**
     ```bash
     npm run dev
  ### Akun Default
  Setelah menjalankan seeder, gunakan akun berikut untuk login:
  
  * **Email:** `admin@example.com`
  * **Password:** `admin123`

  ## 🗃️ Struktur Database
  ![INOFIX-ERD-POS](https://github.com/Sarmiie/INOFIX-PointOfSale/blob/master/INOFIX-ERD-POS.png)
  



