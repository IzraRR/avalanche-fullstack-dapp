# 📘 Day 3 – Frontend dApp dengan Next.js (Avalanche)

> Avalanche Indonesia Short Course – **Day 3**

Hari ketiga difokuskan pada **Frontend Layer**: bagaimana **Next.js** berinteraksi dengan **wallet** dan **smart contract** yang sudah dideploy di Day 2.

---

## 🎯 Tujuan Pembelajaran

Pada akhir sesi Day 3, peserta mampu:

- Memahami peran frontend dalam arsitektur dApp
- Memahami **mental model frontend Web3**
- Menggunakan **Next.js (App Router)** untuk dApp
- Menghubungkan frontend dengan wallet menggunakan **Reown**
- Alternatif: memahami pendekatan **Thirdweb**
- Load **ABI & contract address**
- Melakukan **read (call)** ke smart contract
- Melakukan **write (transaction)** via wallet
- Menangani state transaksi (loading, success, error)

---

## 🧩 Studi Kasus

### Avalanche Simple Full Stack dApp – Frontend Layer

Frontend pada Day 3 berfungsi sebagai:

- UI interaksi user
- Penghubung wallet ↔ smart contract
- State management UX (loading, error, success)

📌 Frontend **tidak menyimpan logic bisnis** dan **tidak menyimpan state penting**.

Smart contract tetap menjadi **single source of truth**.

---

## ⏱️ Struktur Sesi (± 3 Jam)

| Sesi    | Durasi | Aktivitas                            |
| ------- | ------ | ------------------------------------ |
| Theory  | 1 Jam  | Frontend Web3 & Wallet Framework     |
| Demo    | 1 Jam  | Integrasi Next.js + Reown + Contract |
| Praktik | 1 Jam  | Read & Write Contract Mandiri        |

---

# 1️⃣ Theory

## 1.1 Peran Frontend dalam dApp

Frontend Web3 bertugas:

- Menyediakan UI
- Memanggil **read function** (call)
- Mengirim **transaction** via wallet
- Menampilkan status transaksi

❌ Frontend **bukan backend**
❌ Frontend **bukan tempat logic bisnis**

---

## 1.2 Mental Model Frontend Web3 (WAJIB)

```text
User
  ↓ click
Frontend (Next.js)
  ↓ request
Wallet (Core / WalletConnect)
  ↓ sign
Blockchain (Avalanche C-Chain)
  ↓ result
Frontend (update UI)
```

📌 Perbedaan besar dengan Web2:

- Tidak ada session
- Tidak ada password
- Semua aksi write = transaksi

---

## 1.3 Frontend Web2 vs Web3

| Web2 Frontend        | Web3 Frontend                  |
| -------------------- | ------------------------------ |
| Fetch ke backend API | Call / Transaction ke contract |
| Instant response     | Tunggu block confirmation      |
| Server bayar cost    | User bayar gas                 |
| Error bisa retry     | Tx gagal → gas tetap terpakai  |

---

## 1.4 Kenapa Next.js?

Next.js dipilih karena:

- React-based & production-ready
- App Router modern
- Mudah state management
- Populer di ekosistem Web3

📌 Di Day 1 kita pakai **plain HTML**
📌 Mulai Day 3 kita pakai **framework frontend**

---

## 1.5 Wallet Framework di Frontend

Mengelola wallet **manual (`window.ethereum`)** di Next.js itu:

- Repetitif
- Error-prone
- Sulit handle multi-wallet

Solusinya: **Wallet Framework**

---

## 1.6 Reown (Default)

🔗 [https://reown.com/](https://reown.com/)

**Reown** adalah framework modern untuk:

- Wallet connection
- WalletConnect v2
- Multi-wallet support
- UX & state management

### Kenapa Reown?

- Standar industri (WalletConnect ecosystem)
- Cocok untuk production
- Tidak mengunci ke vendor tertentu
- Mudah integrasi dengan Core Wallet

📌 **Reown menjadi default di course ini**

---

## 1.7 Thirdweb (Alternatif)

🔗 [https://thirdweb.com/](https://thirdweb.com/)

Thirdweb menyediakan:

- Wallet
- Contract SDK
- UI components
- Infra end-to-end

📌 Kelebihan:

- Cepat untuk prototyping
- Banyak abstraction

📌 Kekurangan:

- Lebih “opinionated”
- Lebih vendor-dependent

➡️ **Dipakai sebagai referensi tambahan, bukan default**

---

## 1.8 Read vs Write di Frontend

| Action | Cara        | Wallet |
| ------ | ----------- | ------ |
| Read   | `call`      | ❌     |
| Write  | transaction | ✅     |

📌 Write **selalu** memicu wallet popup.

---

# 2️⃣ Demo (1 Jam)

## 2.1 Setup Frontend Project

```bash
cd apps/frontend
npm install
npm run dev
```

Akses:

```text
http://localhost:3000
```

---

## 2.2 Setup Reown Provider

Langkah umum:

- Setup WalletConnect Project ID
- Bungkus app dengan provider Reown
- Aktifkan Avalanche Fuji

📌 Detail konfigurasi akan dijelaskan di demo live.

---

## 2.3 Connect Wallet (Core Wallet)

Yang didemokan:

- Tombol **Connect Wallet**
- Connect via Core Wallet
- Ambil wallet address
- Deteksi network (Fuji)

---

## 2.4 Load Smart Contract

Data dari Day 2:

- Contract address
- ABI JSON

Frontend akan:

- Load ABI
- Instantiate contract
- Siap untuk call & transaction

---

## 2.5 Read Contract (Call)

Demo:

- Panggil `getValue()`
- Tampilkan value di UI
- Tidak memicu wallet popup

---

## 2.6 Write Contract (Transaction)

Demo:

- Input value
- Panggil `setValue(uint256)`
- Wallet popup muncul
- Handle:

  - Loading
  - Success
  - Error / Revert

---

## 2.7 Event & UX Feedback

Ditampilkan:

- Transaction hash
- Status pending
- Status confirmed
- Error message jika revert

---

# 3️⃣ Praktik / Homework (1 Jam)

## 🎯 Objective Praktik

Peserta mampu **menghubungkan frontend Next.js ke smart contract secara mandiri**.

---

## 3.1 Task 1 – Wallet Connection

Implementasikan:

- Connect wallet dengan Reown
- Tampilkan wallet address
- Tampilkan network status

---

## 3.2 Task 2 – Read Contract

- Load ABI & address
- Panggil `getValue()`
- Tampilkan hasil ke UI

---

## 3.3 Task 3 – Write Contract

- Input value
- Call `setValue`
- Handle loading & error

---

## 3.4 Task 4 – UX Improvement (Opsional)

- Disable button saat tx pending
- Shorten address
- Toast / alert status transaksi
- Refresh value setelah tx success

---

## 🧪 Checklist

- [ ] Next.js app berjalan
- [ ] Wallet bisa connect
- [ ] Network Fuji terdeteksi
- [ ] Read contract berhasil
- [ ] Write contract berhasil
- [ ] Tx muncul di explorer

---

## ✅ Output Day 3

Pada akhir Day 3:

- Frontend Next.js terhubung ke wallet
- Smart contract bisa di-read & write
- Peserta memahami:

  - Frontend Web3 ≠ Web2
  - Wallet flow & UX transaksi
  - Contract sebagai source of truth

---

## 🚀 Preview Day 4

Di Day 4, kita akan fokus pada:

- Event listening
- Indexing & data query
- UX & state management lanjutan
- Best practice production dApp

---

## 📚 Referensi

- Reown: [https://reown.com/](https://reown.com/)
- Thirdweb: [https://thirdweb.com/](https://thirdweb.com/)
- Next.js Docs: [https://nextjs.org/docs](https://nextjs.org/docs)
- Avalanche Academy: [https://build.avax.network/academy](https://build.avax.network/academy)

---

🔥 **Frontend connected!**
Besok kita tingkatkan ke **UX, event, dan production-ready dApp** 🚀
