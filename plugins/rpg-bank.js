// plugins/rpg-bank.js
const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let target = m.mentionedJid[0] || m.sender;
  let user = global.db.data.users[target];

  let name = user.name || 'Pemain Misterius';
  let exp = user.exp || 0;
  let limit = user.limit || 0;
  let balance = user.money || 0;
  let atm = user.bank || 0;
  let level = user.level || 1;
  let role = user.role || 'Newbie';

  // Daftar fitur tambahan (plugin)
  const bankFeatures = {
    atm: {
      desc: 'Simpan Kredit ke Vault',
      usage: `${usedPrefix}atm <jumlah>`,
      execute: async (m, { conn, args }) => {
        let amount = parseInt(args[0]);
        if (!amount || amount <= 0) return conn.reply(m.chat, '⚠️ Masukkan jumlah kredit yang valid!', m);
        if (balance < amount) return conn.reply(m.chat, '❌ Kredit tidak cukup! Cek saldo kamu.', m);
        user.money -= amount;
        user.bank += amount;
        return conn.reply(m.chat, `✅ Berhasil menyimpan Rp ${amount.toLocaleString('id-ID')} ke Vault!`, m);
      }
    },
    tarik: {
      desc: 'Tarik Kredit dari Vault',
      usage: `${usedPrefix}tarik <jumlah>`,
      execute: async (m, { conn, args }) => {
        let amount = parseInt(args[0]);
        if (!amount || amount <= 0) return conn.reply(m.chat, '⚠️ Masukkan jumlah kredit yang valid!', m);
        if (user.bank < amount) return conn.reply(m.chat, '❌ Saldo Vault tidak cukup! Cek ATM.', m);
        user.bank -= amount;
        user.money += amount;
        return conn.reply(m.chat, `✅ Berhasil menarik Rp ${amount.toLocaleString('id-ID')} dari Vault!`, m);
      }
    }
    // Fitur lain seperti crypto dan stock diatur di file terpisah
  };

  // Jika perintah adalah salah satu fitur
  if (bankFeatures[command]) {
    await bankFeatures[command].execute(m, { conn, args, usedPrefix });
    return;
  }

  // Format waktu real-time: tanggal/bulan/tahun, waktu
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jakarta' });
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
  const timeDisplay = `${dateStr}, ${timeStr}`;

  // Tampilan status bank modern dan canggih
  let featureList = Object.keys(bankFeatures)
    .map(key => `  〉 ${bankFeatures[key].usage} : ${bankFeatures[key].desc}`)
    .join('\n');

  let capt = `
*≡≡≡ 🌌 RPG BANK DASHBOARD 🌌 ≡≡≡*

*🔹 User Profile*
  〉 Nama   : ${name}
  〉 Role   : ${role}
  〉 Level  : ${level} 🚀
  〉 Exp    : ${exp.toLocaleString('id-ID')} XP

*🔹 Vault Status*
  〉 Saldo  : Rp ${Math.floor(balance).toLocaleString('id-ID')} IDR 💰
  〉 ATM    : Rp ${Math.floor(atm).toLocaleString('id-ID')} IDR 🏦
  〉 Limit  : ${limit} Unit ⚡

*🔹 Fitur Interaktif*
${featureList}

*≡≡≡ 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝙽𝚒𝚡 ≡≡≡*
  〉 Waktu: ${timeDisplay}
  〉 Investasi cerdas, kuasai galaksi! 🌠
  `.trim();

  await conn.relayMessage(m.chat, {
    extendedTextMessage: {
      text: capt,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: `🌌 RPG Bank Center`,
          body: `Kuasai Kekayaan di Dunia RPG!`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: 'https://telegra.ph/file/88a5dbbcb9fc975cb82ec.jpg',
          sourceUrl: 'https://github.com/BOTCAHX'
        }
      }
    }
  }, {});
};

handler.help = ['bank'];
handler.tags = ['rpg'];
handler.command = /^(bank|atm|tarik)$/i;

module.exports = handler;