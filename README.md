# 🚀 Web Authentication Project (Frontend)

Selamat datang di bagian **frontend** dari proyek otentikasi web kami! ✨ Dibangun dengan **Vue.js**, aplikasi ini menawarkan pengalaman pengguna yang modern dan responsif, dengan fokus pada **Multi-Factor Authentication (MFA)** dan praktik **Clean Code** terbaik.

---

## 💡 Gambaran Umum Proyek

Proyek frontend ini dirancang untuk memberikan antarmuka pengguna yang intuitif dan aman, melengkapi fungsionalitas backend otentikasi kami. Kami berkomitmen pada kualitas kode, desain yang adaptif, dan pengalaman *login* yang mulus.

---

## ✨ Fitur Unggulan

* **Clean Code**: Kami menerapkan prinsip-prinsip *clean code* untuk memastikan bahwa aplikasi ini tidak hanya berfungsi, tetapi juga mudah dipelihara, dipahami, dan dikembangkan di masa mendatang.
* **Sistem Login Modern**: Fungsionalitas *login* telah diperbaiki secara signifikan, menampilkan validasi input yang lebih baik dan alur pengguna yang lebih lancar, siap untuk integrasi MFA.
* **Desain Responsif**: Dengan pendekatan *mobile-first* dan dukungan penuh dari **Tailwind CSS**, aplikasi kami tampil memukau dan berfungsi dengan baik di berbagai ukuran perangkat, dari *smartphone* hingga *desktop*.
* **Pengujian Komprehensif**: Kualitas adalah prioritas kami! Kami menggunakan **Vitest** untuk pengujian unit dan integrasi yang ketat, memastikan setiap bagian aplikasi bekerja sesuai harapan.
* **Linting Kode Konsisten**: **ESLint** memastikan standar kualitas dan konsistensi kode yang tinggi di seluruh proyek, memfasilitasi kolaborasi tim yang efektif.

---

## 🛠️ Teknologi yang Digunakan

| Kategori            | Teknologi       | Deskripsi                                                                         |
| :------------------ | :---------------| :-------------------------------------------------------------------------------  |
| **Framework UI**    | **Vue.js**      | Framework JavaScript progresif untuk membangun antarmuka pengguna interaktif.     |
| **Styling**         | **Tailwind CSS**| Framework CSS utilitas-first untuk desain responsif dan cepat.                    |
| **Linting**         | **ESLint**      | Alat untuk analisis kode statis demi menjaga kualitas dan konsistensi kode.       |
| **Pengujian**       | **Vitest**      | Framework pengujian yang cepat dan ringan untuk unit dan integrasi tests.         |
| **Containerization**| **Docker**      | Platform untuk mengembangkan, mengirim, dan menjalankan aplikasi dalam kontainer. |
| **Kompiler JS**     | **Babel**       | Kompiler JavaScript untuk memastikan kompatibilitas kode di berbagai *browser*.   |
| **Pemrosesan CSS**  | **PostCSS**     | Alat untuk mengubah CSS dengan *plugin* JavaScript.                               |
| **Kualitas Kode**   | **SonarQube**   | Platform manajemen kualitas dan keamanan kode sumber berkelanjutan.               |

---

## 🚀 Memulai Proyek (Development)

Untuk menjalankan proyek frontend ini di lingkungan pengembangan lokal Anda, ikuti langkah-langkah di bawah ini.

### 📋 Prasyarat

Pastikan Anda memiliki perangkat lunak berikut terinstal di komputer Anda:

* **Node.js**: Unduh dan instal [Node.js](https://nodejs.org/) (disarankan versi LTS).
* **NPM**: Biasanya sudah termasuk dalam instalasi Node.js, atau instal [NPM](https://www.npmjs.com/) secara terpisah.
* **Docker**: (Opsional) Jika Anda ingin menjalankan aplikasi dalam kontainer, pastikan [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstal dan berjalan.

### ⚙️ Langkah-langkah Instalasi

1.  **Klon Repositori**
    Pertama, klon repositori ini ke komputer lokal Anda dan navigasikan ke direktori proyek:
    ```bash
    git clone [https://github.com/superthree3am/web.git]
    cd web # Pastikan Anda berada di root direktori proyek 'web'
    # Jika frontend Anda berada di sub-direktori tertentu (misal: 'frontend-app'), masuklah ke dalamnya:
    # cd frontend-app
    ```
    **Catatan**: *Branch* yang sedang Anda kerjakan (`FELAST`) mungkin perlu di-*checkout* secara eksplisit jika Anda tidak mengklon *branch* tersebut secara langsung.

2.  **Instal Dependensi**
    Jalankan perintah berikut untuk menginstal semua dependensi proyek yang diperlukan:
    ```bash
    npm install
    ```

3.  **Jalankan Aplikasi**
    Setelah semua dependensi terinstal, Anda dapat menjalankan aplikasi dalam mode pengembangan:
    ```bash
    npm run serve
    ```
    Ini akan memulai server pengembangan dan biasanya akan otomatis membuka aplikasi di *browser* Anda.

4.  **Akses Aplikasi**
    Buka *browser* Anda dan akses aplikasi di `http://localhost:8080`.

### 🧪 Pengujian
Untuk menjalankan rangkaian pengujian unit dan integrasi yang memastikan kualitas dan stabilitas aplikasi, gunakan perintah:
```bash
yarn test
# atau
npm run test
```
Pengujian ini akan memeriksa semua komponen dan fungsionalitas utama aplikasi, memastikan semuanya berjalan sesuai harapan.

### 🐳 Menjalankan dengan Docker (Opsional)
Jika Anda memilih untuk menjalankan aplikasi dalam kontainer Docker, pastikan Docker sudah berjalan, lalu ikuti langkah-langkah berikut:
Jalankan perintah berikut di terminal Anda:
```bash
docker compose up --build
```bash
Ini akan membangun dan menjalankan aplikasi dalam kontainer, memungkinkan Anda untuk mengaksesnya di `http://localhost:8080`.

SonarQube
### 📊 Analisis Kualitas Kode
Untuk menjalankan analisis kualitas kode menggunakan SonarQube, ikuti langkah-langkah berikut:
1.  **Konfigurasi SonarQube**
    Pastikan Anda telah menginstal dan menjalankan SonarQube di lingkungan lokal atau server Anda. Anda dapat mengunduhnya dari [situs resmi SonarQube](https://www.sonarqube.org/downloads/).
2.  **Jalankan Analisis**
Jalankan perintah berikut untuk menjalankan analisis kualitas kode menggunakan SonarQube:
    ```bash
    sonar-scanner
    ```
    Pastikan Anda telah mengonfigurasi file `sonar-project.properties` di direktori proyek Anda dengan pengaturan yang sesuai untuk SonarQube.
### 📜 Linting Kode
Untuk memastikan kode Anda sesuai dengan standar yang telah ditetapkan, jalankan linting menggunakan ESLint:
```bash
npx eslint .
atau
yarn lint
``` 
Ini akan memeriksa kode Anda dan memberikan laporan tentang potensi masalah atau pelanggaran terhadap aturan yang telah ditetapkan.
