// plugins/rpg-stock.js
const fetch = require('node-fetch');

const registerBankFeature = require('../plugins/rpg-bank').registerBankFeature;

registerBankFeature(
  'stock',
  'Cek dan beli saham (RPG)',
  'stock <symbol> [jumlah]',
  async (m, { conn, args, usedPrefix }) => {
    let target = m.mentionedJid[0] || m.sender;
    let user = global.db.data.users[target];
    if (!user) return conn.reply(m.chat, '⚠️ Data pengguna tidak ditemukan!', m);

    if (!args[0]) return conn.reply(m.chat, '⚠️ Masukkan simbol saham (contoh: AAPL, TSLA)!', m);
    let symbol = args[0].toUpperCase();
    const apiKey = 'd0toeo9r01qlvahde9l0d0toeo9r01qlvahde9lg'; // API key Finnhub

    try {
      // Ambil harga saham dalam USD
      const stockRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
      const stockData = await stockRes.json();
      if (!stockData.c || stockData.c === 0) return conn.reply(m.chat, '❌ Simbol saham tidak ditemukan! Contoh: AAPL, TSLA', m);
      let priceUSD = stockData.c;

      // Ambil kurs USD ke IDR dari CoinGecko
      const rateRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=idr');
      const rateData = await rateRes.json();
      if (!rateData.usd || !rateData.usd.idr) return conn.reply(m.chat, '❌ Gagal mengambil data kurs USD/IDR!', m);
      let rate = rateData.usd.idr;
      let priceIDR = priceUSD * rate;

      // Inisialisasi inventory saham jika belum ada
      if (!user.stocks) user.stocks = {};
      if (!user.stocks[symbol]) user.stocks[symbol] = 0;

      // Format waktu real-time
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jakarta' });
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
      const timeDisplay = `${dateStr}, ${timeStr}`;

      // Jika hanya cek harga
      if (!args[1]) {
        let capt = `
*≡≡≡ 🌌 RPG STOCK EXCHANGE 🌌 ≡≡≡*

*🔹 Stock Intel*
  〉 Symbol  : ${symbol} 📊
  〉 Harga   : Rp ${Math.floor(priceIDR).toLocaleString('id-ID')} IDR 📈
  〉 Inventory: ${user.stocks[symbol]} ${symbol} 🚀

*≡≡≡ Powered by xAI Tech ≡≡≡*
  〉 Sumber: Finnhub (harga), CoinGecko (kurs)
  〉 Waktu: ${timeDisplay}
  〉 Ketik: ${usedPrefix}stock ${symbol} <jumlah> untuk beli 🌠
        `.trim();
        return conn.reply(m.chat, capt, m);
      }

      // Fitur beli saham (simulasi)
      let amount = parseFloat(args[1]);
      if (!amount || amount <= 0) return conn.reply(m.chat, '⚠️ Masukkan jumlah yang valid untuk dibeli!', m);
      let totalCost = amount * priceIDR;
      if (user.bank < totalCost) return conn.reply(m.chat, '❌ Saldo Vault tidak cukup! Saldo: Rp ' + user.bank.toLocaleString('id-ID'), m);

      user.bank -= totalCost;
      user.stocks[symbol] += amount;
      let capt = `
*≡≡≡ 🌌 RPG STOCK EXCHANGE 🌌 ≡≡≡*

*🔹 Transaksi Saham*
  〉 Symbol  : ${symbol} 📊
  〉 Jumlah  : ${amount} ${symbol} 🚀
  〉 Harga   : Rp ${Math.floor(priceIDR).toLocaleString('id-ID')} IDR per unit 📈
  〉 Total   : Rp ${Math.floor(totalCost).toLocaleString('id-ID')} IDR 💸
  〉 Inventory: ${user.stocks[symbol]} ${symbol} 🛠️
  〉 Sisa Vault: Rp ${Math.floor(user.bank).toLocaleString('id-ID')} IDR 🏦

*≡≡≡ Powered by xAI Tech ≡≡≡*
  〉 Sumber: Finnhub (harga), CoinGecko (kurs)
  〉 Waktu: ${timeDisplay}
  〉 Dominasi pasar dimulai! 🌠
      `.trim();
      return conn.reply(m.chat, capt, m);
    } catch (e) {
      return conn.reply(m.chat, '❌ Gagal mengambil data harga saham: ' + e.message, m);
    }
  }
);

module.exports = {
  help: ['stock'],
  tags: ['rpg'],
  command: /^stock$/i
};