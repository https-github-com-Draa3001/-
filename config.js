global.owner = ['6285603256172']  
global.mods = ['6285603256172'] 
global.prems = ['6285603256172']
global.nameowner = 'ℕ𝕚𝕩'
global.numberowner = '6285603256172' 
global.mail = 'support@tioprm.eu.org' 
global.gc = '_'
global.instagram = '_'
global.wm = '© 𝙽𝚒𝚡'
global.wait = '_*Tunggu sedang di proses...*_'
global.eror = '_*Server Error*_'
global.stiker_wait = '*⫹⫺ Stiker sedang dibuat...*'
global.packname = 'Made With'
global.author = 'Bot WhatsApp'
global.maxwarn = '5' // Peringatan maksimum Warn

global.autobio = false // Set true/false untuk mengaktifkan atau mematikan autobio (default: false)
global.antiporn = false // Set true/false untuk Auto delete pesan porno (bot harus admin) (default: false)
global.spam = false // Set true/false untuk anti spam (default: false)
global.gcspam = false // Set true/false untuk menutup grup ketika spam (default: false)
    

// APIKEY INI WAJIB DI ISI! //
global.btc = 'S57o3LaE' 
//Daftar terlebih dahulu https://api.botcahx.eu.org



// INI HANYA OPTIONAL SAJA BOLEH DI ISI BOLEH JUGA ENGGA //
global.lann = 'Btz-3LtGs'
//Daftar https://api.betabotz.eu.org 

//Gausah diganti atau di ubah
global.APIs = {   
  btc: 'https://api.botcahx.eu.org'
}

//Gausah diganti atau di ubah
global.APIKeys = { 
  'https://api.botcahx.eu.org': global.btc
}


let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  delete require.cache[file]
  require(file)
})
