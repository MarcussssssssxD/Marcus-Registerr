const Discord = require("discord.js");
const client = new Discord.Client();
const ayarlar = require("./ayarlar.json");
const chalk = require("chalk");
const moment = require("moment");
const { Client, Util } = require("discord.js");
const fs = require("fs");
const db = require("quick.db");
const http = require("http");
const express = require("express");
require("./util/eventLoader.js")(client);
const request = require("request");
const queue = new Map();

const app = express();
app.get("/", (request, response) => {
  console.log(" Ping tamamdır.");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;

client.on("warn", e => {
  console.log(chalk.bgYellow(e.replace(regToken, "that was redacted")));
});

client.on("error", e => {
  console.log(chalk.bgRed(e.replace(regToken, "that was redacted")));
});

client.on("ready", () => {
  client.channels.cache.get("795982385601839106").join();
});

client.on("message", msg => {
  if (msg.content.toLowerCase() === "tag") {
    msg.channel.send("`₰` ");
  }
});

client.on("message", msg => {
  if (msg.content.toLowerCase() === ".tag") {
    msg.channel.send("`₰` ");
  }
});

client.on("userUpdate", async (oldUser, newUser) => {
  if (oldUser.username !== newUser.username) {
    let tag = ayarlar.tag;
    let sunucu = ayarlar.sunucu;
    let kanal = ayarlar.tagkanal;
    let rol = ayarlar.tagrol;

    try {
      if (
        newUser.username.includes(tag) &&
        !client.guilds.cache
          .get(sunucu)
          .members.cache.get(newUser.id)
          .roles.cache.has(rol)
      ) {
        await client.channels.cache
          .get(kanal)
          .send(
            ` ${newUser} \`adlı kullanıcı (${tag}) tagımızı alarak bizi mutlu etti. Aramıza hoş geldin :)\``
          )

          .then(x => x.delete({ timeout: 7000 }));
        await client.guilds.cache
          .get(sunucu)
          .members.cache.get(newUser.id)
          .roles.add(rol);
      }
      if (
        !newUser.username.includes(tag) &&
        client.guilds.cache
          .get(sunucu)
          .members.cache.get(newUser.id)
          .roles.cache.has(rol)
      ) {
        await client.channels.cache
          .get(kanal)
          .send(
            ` ${newUser} \`adlı kullanıcı (${tag}) tagımızı çıkararak bizi üzdü. Ailemize tekrardan bekleriz...\``
          )
          .then(x => x.delete({ timeout: 7000 }));
        await client.guilds.cache
          .get(sunucu)
          .members.cache.get(newUser.id)
          .roles.remove(rol);
      }
    } catch (e) {
      console.log(`Bir hata oluştu! ${e}`);
    }
  }
});
/////////////////////////////////////////////////TAG ALANA ROL////////////////////////////////////////////////////

/////////////////////////////////////////////////HOŞ GELDİN MESAJI////////////////////////////////////////////////////

client.on("guildMemberAdd", member => {
  let yetkili = ayarlar.kayıtyetkili;
  let kayıtsohbet2 = ayarlar.kayıtsohbet;

  let guild = member.guild;

  const channel = member.guild.channels.cache.find(
    channel => channel.id === kayıtsohbet2
  );
  let aylartoplam = {
    "01": "Ocak",
    "02": "Şubat",
    "03": "Mart",
    "04": "Nisan",
    "05": "Mayıs",
    "06": "Haziran",
    "07": "Temmuz",
    "08": "Ağustos",
    "09": "Eylül",
    "10": "Ekim",
    "11": "Kasım",
    "12": "Aralık"
  };
  let aylar = aylartoplam;

  let user = client.users.cache.get(member.id);
  require("moment-duration-format");

  const kurulus = new Date().getTime() - user.createdAt.getTime();
  const gün = moment.duration(kurulus).format("D");
  var kontrol = [];

  if (gün < 7) {
    kontrol = " **Bu Hesap Şüphelidir**";
  }
  if (gün > 7) {
    kontrol = " **Bu Hesap Güvenlidir**";
  }
  let kanal = ayarlar.kayıtsohbet;
  if (!kanal) return;

  const embed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setThumbnail(
      user.avatarURL({
        dynamic: true,
        format: "gif",
        format: "png",
        format: "jpg",
        size: 2048
      })
    )
    .setDescription(
      `<a:cizgilikalp:796041657216270396> ${
        member.user
      } Aramıza Hoşgeldin \n\n<a:alev:796041955586474005> Seninle beraber **${
        guild.memberCount
      }** kişi olduk! \n\n<a:alev:796041955586474005> Kaydının yapılması için ses kanalına geçmelisin. \n\n<a:alev:796041955586474005> Hesabın **(${moment(
        user.createdAt
      ).format("DD")} ${aylar[moment(user.createdAt).format("MM")]} ${moment(
        user.createdAt
      ).format(
        "YYYY HH:mm:ss"
      )})** zamanında kurulmuş! \n\n<a:alev:796041955586474005> Hesabın: ${kontrol} \n\n<a:alev:796041955586474005> Kayıt yetkilileri seninle ilgilenecektir.`
    );
  client.channels.cache.get(kanal).send(`<@&${yetkili}>, ${member.user}`);
  client.channels.cache.get(kanal).send(embed);
});

//////////////////////////////////////////////////////////OTO ROL//////////////////////////////////////////////////////////////

client.on("guildMemberAdd", member => {
  member.roles.add("786384746070540288");
});

client.on("message", async message => {
  let uyarisayisi = await db.fetch(`reklamuyari_${message.author.id}`);
  let reklamkick = await db.fetch(`kufur_${message.guild.id}`);
  let kullanici = message.member;
  if (!reklamkick) return;
  if (reklamkick == "Açık") {
    const reklam = ["discord.app", "discord.gg"];
    if (reklam.some(word => message.content.toLowerCase().includes(word))) {
      if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.delete();
        db.add(`reklamuyari_${message.author.id}`, 1); //uyarı puanı ekleme
        if (uyarisayisi === null) {
          let ikrudka = new Discord.MessageEmbed().setDescription(
            ` <@${message.author.id}> Sunucuda reklam yapmak yasaktır! (1/3)`
          );
          return message.channel
            .send(ikrudka)
            .then(x => x.delete({ timeout: 3000 }));
        }
        if (uyarisayisi === 1) {
          let ikrudka = new Discord.MessageEmbed().setDescription(
            ` <@${message.author.id}> Sunucuda reklam yapmak yasaktır. (2/3)`
          );
          return message.channel
            .send(ikrudka)
            .then(x => x.delete({ timeout: 3000 }));
        }
        if (uyarisayisi === 2) {
          message.delete();
          await kullanici.kick({ reason: `Reklam Yapma Orsp Coc!` });
          let ikrudka = new Discord.MessageEmbed()

            .setColor("#0054ff")
            .setDescription(
              ` <@${message.author.id}> Uyarılmasına Rağmen \`3\` Kez Reklam Yaptığı İçin Sunucudan Atıldı! (3/3)`
            );
          return message.channel
            .send(ikrudka)
            .then(x => x.delete({ timeout: 3000 }));
        }
        if (uyarisayisi === 3) {
          message.delete();
          await kullanici.ban({ reason: `ORSP COC!` });
          db.delete(`reklamuyari_${message.author.id}`);
          let ikrudka = new Discord.MessageEmbed().setDescription(
            ` <@${message.author.id}> Atıldıktan Sonra Tekrar Reklam Yaptığı İçin Sunucudan Yasaklandı! (4/3)`
          );
          return message.channel
            .send(ikrudka)
            .then(x => x.delete({ timeout: 3000 }));
        }
      }
    }
  }
});

client.on("message", async message => {
  let uyarisayisi = await db.fetch(`reklamuyari_${message.author.id}`);
  let reklamkick = await db.fetch(`kufur_${message.guild.id}`);
  let kullanici = message.member;
  if (!reklamkick) return;
  if (reklamkick == "Açık") {
    const reklam = [
      "amk",
      "sikim",
      "siksem",
      "PEZEVENK",
      "pezevenk",
      "kaltak",
      "KALTAK",
      "İBNE",
      "İBNE",
      "evladi",
      "orsb",
      "orsbcogu",
      "amnskm",
      "anaskm",
      "amina",
      "amina g",
      "amina k",
      "aminako",
      "aminakoyarim",
      "amina koyarim",
      "amm",
      "ammak",
      "ammna",
      "amn",
      "amna",
      "amnda",
      "amndaki",
      "amngtn",
      "amnn",
      "amona",
      "amq",
      "YAVŞAK",
      "SÜRTÜK",
      "sürtük",
      "AMCIK",
      "amcık",
      "amcik",
      "surtuk",
      "SURTUK",
      "oruspu çocuğu",
      "OROSPU COCUGU",
      "ORUSPU COCUGU",
      "oruspu çocugu",
      "oruspu çocuğu",
      "sikecem",
      "SİKECEM",
      "Orospu Cocuğu",
      "orospu",
      "piç",
      "yavşak",
      "Amını Sikim",
      "amk",
      "aq",
      "Götünü Sikim",
      "ANANI SİKİM",
      "SİKİM",
      "AMK",
      "OROSPU ÇOCUĞU",
      "PİÇ",
      "YAVŞAK",
      "YARRAK",
      "YARAK",
      "yarrak",
      "yarak",
      "gavat",
      "lavuk",
      "LAVUK",
      "GAVAT",
      "şerefsiz",
      "ŞEREFSİZ",
      "Ananı Sikim",
      "Anani Sikim"
    ];
    if (reklam.some(word => message.content.toLowerCase().includes(word))) {
      if (!message.member.hasPermission("ADMINISTRATOR")) {
        {
          message.delete();
          db.add(`reklamuyari_${message.author.id}`, 1); //uyarı puanı ekleme
          if (uyarisayisi === null) {
          }
        }
      }
    }
  }
});

client.on("guildMemberAdd", member => {
  let tag = ayarlar.yasaklıtag;
  let kayıtsızcık = ayarlar.kayıtsız; //acebots
  let cezalıcık = ayarlar.cezalı;

  if (member.user.username.includes("Δ")) {
    member.send(
      ` \`${member.guild.name}\` adlı **sunucuda __yasaklı tag__ kullandığınız için siktirip gidiniz!**`
    );
    member.ban({ reason: `YASAKLI TAG!` });
  }
});

const ms = require("parse-ms");
const { DiscordAPIError } = require("discord.js");

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.content.includes(`afk`)) return;

  if (await db.fetch(`afk_${message.author.id}`)) {
    db.delete(`afk_${message.author.id}`);
    db.delete(`afk_süre_${message.author.id}`);
  }

  var USER = message.mentions.users.first();
  if (!USER) return;
  var REASON = await db.fetch(`afk_${USER.id}`);

  if (REASON) {
    let süre = await db.fetch(`afk_süre_${USER.id}`);
    let timeObj = ms(Date.now() - süre);

    message.channel
      .send(
        `<@${message.author.id}> **\`etiketlediğin (${USER.tag}) adlı kullanıcı (${REASON}) sebebiyle ${timeObj.hours} saat ${timeObj.minutes} dakika ${timeObj.seconds} saniye'dir afk.\`**`
      )
      .then(x => x.delete({ timeout: 60000 }));
  }
});

client
  .login(ayarlar.token)
  .then(console.log("Bot başarılı bir şekilde giriş yaptı."));
