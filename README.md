# Bot Minecraft (mcAdc)

## Deskripsi
Bot Minecraft canggih yang dibangun dengan Mineflayer, dilengkapi antarmuka web untuk interaksi dan manajemen perintah yang mudah.

## Fitur
- Antarmuka perintah berbasis web
- Kontrol bot real-time
- Sistem perintah yang dapat diperluas
- Mudah diatur dan dijalankan

## Prasyarat
- Node.js (versi 14 atau lebih tinggi)
- Server Minecraft yang berjalan

## Instalasi

1. Clone repositori:
```bash
git clone https://github.com/namapenggunaanda/mcAdc.git
cd mcAdc
```

2. Instal dependensi:
```bash
npm install
```

3. Konfigurasi Bot
Rename   `example.config.json` menjadi `config.json` di direktori root proyek dengan konten berikut:
```json
{
  "minecraftServer": {
    "host": "Ip Server",
    "port": port

  },
  "bot": {
    "username": "Username bot",
    "version": "versi Wajib"
  },
  "logging": {
    "level": "info",
    "directory": "logs",
    "maxSize": 5242880,
    "maxFiles": 5
  },
  "Auto_auth": {
    "enabled": true,
    "DefaultPass": "Password auto auth", // optional
    "randomPasswords": true // generate random password if true for each diferent server and saved in generatedpass.json
  }
}
```

## Struktur Proyek
```
mcAdc/
├── commands/           # Perintah bot kustom
│   ├── find.js
│   └── craft.js
├── public/             # Berkas antarmuka web
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── bot.js          # Logika bot utama
├── server.js       # Pengaturan server web
├── commandHandler.js # loader command
├── GeneratedPass.json # Pass untuh Auto Auth jika di nyalakan
├── config.json         # Konfigurasi
├── package.json
└── README.md
```

## Menjalankan Bot

Mulai bot dan antarmuka web:
```bash
npm run start
```

Antarmuka web akan dapat diakses di `http://localhost:3000`

## Menggunakan Perintah

Perintah dijalankan melalui antarmuka chat di `localhost:3000`:

- `!find <NamaPemain>`: Temukan pemain di server
  - Contoh: `!find Steve`

- `!craft <NamaItem> <Jumlah>`: Membuat item
  - Contoh: `!craft diamond_sword 1`

## Menambahkan Perintah Baru

1. Buat file baru di direktori `commands/`
2. Gunakan template berikut:
```javascript
module.exports = {
  data: {
    name: 'namaperintah',
    description: 'Deskripsi perintah',
    usage: '!namaperintah <argumen>',
  },
  async execute(bot, args) {
    // Implementasi perintah
    return "Hasil";
  },
};
```
3. Save dan coba di website

## Kontribusi

Untuk sekarang, Join discord kami dan saya akan menyentujui nya

Discord: [Click Here](https://discord.gg/PFBQYkzzg7)

## Dependensi
- "express": "^4.21.1"
- "minecraft-data": "^3.78.0"
- "minecrafthawkeye": "^1.3.9"
- "mineflayer": "^4.23.0"
- "mineflayer-collectblock": "^1.4.1"
- "mineflayer-pathfinder": "^2.4.5",
- "mineflayer-pvp": "^1.3.2",
- "mineflayer-tool": "^1.2.0",
- "prismarine-viewer": "^1.28.0",
- "socket.io": "^4.8.1",
- "winston": "^3.17.0"

## Lisensi
Didistribusikan di bawah Lisensi MIT.

## Kredit

- Mineflayer: [click here](https://github.com/PrismarineJS/mineflayer)
- Owner: [click here](https://github.com/mrcraked)

## Catatan Tambahan
- Pastikan untuk menginstal versi Mineflayer yang kompatibel dengan versi Minecraft server Anda
- Gunakan dengan bijak. jangan melangar peraturan minecraft. jika akun anda di ban atau di kunci. maka bukan tangung jawab kami.
