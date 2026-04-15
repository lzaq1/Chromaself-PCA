# 📊 PCA Analysis Tool
**Dimensionality Reduction made simple with Interactive AI Insights.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

## 🧬 Overview

**PCA Analysis Tool** adalah aplikasi web interaktif yang dirancang untuk membantu Machine Learning Engineer dan Data Scientist melakukan *Principal Component Analysis* (PCA) dengan mudah. Aplikasi ini tidak hanya menghitung reduksi dimensi, tetapi juga menggunakan integrasi Gemini AI untuk memberikan interpretasi otomatis terhadap fitur-fitur yang paling berpengaruh (Principal Components).

### Key Features:
- **Instant PCA Calculation:** Unggah dataset Anda dan lihat visualisasi varians secara real-time.
- **Interactive Visualizations:** Scatter plots dan scree plots yang responsif untuk memahami struktur data.
- **AI-Powered Insights:** Penjelasan otomatis mengenai korelasi antar fitur menggunakan Large Language Models.
- **Data Preprocessing:** Dilengkapi dengan fitur standarisasi data otomatis sebelum proses PCA dilakukan.

## 🛠️ Tech Stack

- **Frontend:** React.js dengan Tailwind CSS untuk UI yang modern.
- **Data Processing:** Integrasi algoritma matematika untuk analisis komponen utama.
- **AI Engine:** Gemini API (Google AI Studio) untuk analisis konteks data.

## 💻 Cara Menjalankan Proyek

Pastikan Anda telah menginstal **Node.js** di perangkat Anda sebelum memulai.

### Langkah-langkah Instalasi:

1.  **Clone Repositori:**
    ```bash
    git clone [https://github.com/username/pca-analysis-web.git](https://github.com/username/pca-analysis-web.git)
    cd pca-analysis-web
    ```

2.  **Instal Dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi API Key:**
    Buat file `.env.local` di direktori utama dan tambahkan API Key Gemini Anda:
    ```env
    GEMINI_API_KEY=masukkan_api_key_anda_di_sini
    ```

4.  **Jalankan Aplikasi:**
    ```bash
    npm run dev
    ```

## 🌐 Akses melalui AI Studio

Anda juga dapat mencoba dan mengembangkan logika AI aplikasi ini langsung melalui Google AI Studio:
[Buka Project di AI Studio](https://ai.studio/apps/edd56ccd-3713-45d2-a9b9-adcf80bb85bc)

---
<p align="center">Built with 💻 and ☕ by YourName</p>
