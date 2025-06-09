// plugins/rpg-crypto.js
const fetch = require('node-fetch');

const registerBankFeature = require('../plugins/rpg-bank').registerBankFeature;

registerBankFeature(
  'crypto',
  'Cek dan beli crypto (RPG)',
  'crypto <symbol> [jumlah]',
  async (m, { conn, args, usedPrefix }) => {
    let target = m.mentionedJid[0] || m.sender;
    let user = global.db.data.users[target];
    if (!user) return conn.reply(m.chat, '⚠️ Data pengguna tidak ditemukan!', m);

    if (!args[0]) return conn.reply(m.chat, '⚠️ Masukkan simbol crypto (contoh: BTC, ETH)!', m);
    let symbol = args[0].toUpperCase();
    const apiKey = '41b34c94-cdc9-4a6f-8c2b-85e86823e574'; // API key CoinMarketCap

    try {
      // Ambil harga crypto dalam USD
      const cryptoRes = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=USD`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': apiKey
          }
        }
      );
      const cryptoData = await cryptoRes.json();
      if (!cryptoData.data || !cryptoData.data[symbol]) return conn.reply(m.chat, '❌ Simbol crypto tidak ditemukan! Contoh: BTC, ETH, LTC', m);
      let priceUSD = cryptoData.data[symbol].quote.USD.price;

      // Ambil kurs USD ke IDR dari CoinGecko
      const rateRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=idr');
      const rateData = await rateRes.json();
      if (!rateData.usd || !rateData.usd.idr) return conn.reply(m.chat, '❌ Gagal mengambil data kurs USD/IDR!', m);
      let rate = rateData.usd.idr;
      let priceIDR = priceUSD * rate;

      // Inisialisasi inventory crypto jika belum ada
      if (!user.crypto) user.crypto = {};
      if (!user.crypto[symbol]) user.crypto[symbol] = 0;

      // Format waktu real-time
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jakarta' });
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
      const timeDisplay = `${dateStr}, ${timeStr}`;

      // Jika hanya cek harga
      if (!args[1]) {
        let capt = `
*≡≡≡ 🌌 RPG CRYPTO TERMINAL 🌌 ≡≡≡*

*🔹 Crypto Intel*
  〉 Koin    : ${symbol} 🪙
  〉 Harga   : Rp ${Math.floor(priceIDR).toLocaleString('id-ID')} IDR 📈
  〉 Inventory: ${user.crypto[symbol]} ${symbol} 🚀

*≡≡≡ Powered by xAI Tech ≡≡≡*
  〉 Sumber: CoinMarketCap (harga), CoinGecko (kurs)
  〉 Waktu: ${timeDisplay}
  〉 Ketik: ${usedPrefix}crypto ${symbol} <jumlah> untuk beli 🌠
        `.trim();
        return conn.reply(m.chat, capt, m);
      }

      // Fitur beli crypto (simulasi)
      let amount = parseFloat(args[1]);
      if (!amount || amount <= 0) return conn.reply(m.chat, '⚠️ Masukkan jumlah yang valid untuk dibeli!', m);
      let totalCost = amount * priceIDR;
      if (user.bank < totalCost) return conn.reply(m.chat, '❌ Saldo Vault tidak cukup! Saldo: Rp ' + user.bank.toLocaleString('id-ID'), m);

      user.bank -= totalCost;
      user.crypto[symbol] += amount;
      let capt = `
*≡≡≡ 🌌 RPG CRYPTO TERMINAL 🌌 ≡≡≡*

*🔹 Transaksi Crypto*
  〉 Koin    : ${symbol} 🪙
  〉 Jumlah  : ${amount} ${symbol} 🚀
  〉 Harga   : Rp ${Math.floor(priceIDR).toLocaleString('id-ID')} IDR per unit 📈
  〉 Total   : Rp ${Math.floor(totalCost).toLocaleString('id-ID')} IDR 💸
  〉 Inventory: ${user.crypto[symbol]} ${symbol} 🛠️
  〉 Sisa Vault: Rp ${Math.floor(user.bank).toLocaleString('id-ID')} IDR 🏦

*≡≡≡ Powered by xAI Tech ≡≡≡*
  〉 Sumber: CoinMarketCap (harga), CoinGecko (kurs)
  〉 Waktu: ${timeDisplay}
  〉 Dominasi pasar dimulai! 🌠
      `.trim();
      return conn.reply(m.chat, capt, m);
    } catch (e) {
      return conn.reply(m.chat, '❌ Gagal mengambil data harga crypto: ' + e.message, m);
    }
  }
);

module.exports = {
  help: ['crypto'],
  tags: ['rpg'],
  command: /^crypto$/i
};