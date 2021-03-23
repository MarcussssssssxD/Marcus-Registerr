const Discord = require("discord.js");
const client = new Discord.Client();
const ayarlar = require("./ayarlar.json");
const id = require("./idler.json");

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


/////////////////////////////////////////////////HOŞ GELDİN MESAJI////////////////////////////////////////////////////

client.on("guildMemberAdd", member => {
  let yetkili = id.yetkili;
  let kayıtsohbet2 = id.kayıtsohbet;

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
      `${member.user} Aramıza Hoşgeldin \n\n
      Seninle beraber **${guild.memberCount  }** kişi olduk! \n\n
      Kaydının yapılması için ses kanalına geçmelisin. \n\n
      Hesabın **(${moment(user.createdAt ).format("DD")} ${aylar[moment(user.createdAt).format("MM")]} ${moment(user.createdAt).format("YYYY HH:mm:ss")})** zamanında kurulmuş! \n\n
      Hesabın: ${kontrol} \n\n
      Kayıt yetkilileri seninle ilgilenecektir.`
    );
  client.channels.cache.get(kanal).send(`<@&${yetkili}>, ${member.user}`);
  client.channels.cache.get(kanal).send(embed);
});



client.on("userUpdate", async (oldUser, newUser) => {
  if (oldUser.username !== newUser.username) {
          let tag = id.tag
          let sunucu = id.sunucu
          let kanal = id.tagkanal
          let rol = id.tagrol

          

  try {

  if (newUser.username.includes(tag) && !client.guilds.cache.get(sunucu).members.cache.get(newUser.id).roles.cache.has(rol)) {
  await client.channels.cache.get(kanal).send(new Discord.MessageEmbed().setColor("#00ff51").setDescription(`${newUser} \`${tag}\` Tagımızı Aldığı İçin <@&${rol}> Rolünü Verdim`));
  await client.guilds.cache.get(sunucu).members.cache.get(newUser.id).roles.add(rol);  
  }
  if (!newUser.username.includes(tag) && client.guilds.cache.get(sunucu).members.cache.get(newUser.id).roles.cache.has(rol)) {
  await client.channels.cache.get(kanal).send(new Discord.MessageEmbed().setColor("#ff0000").setDescription(`${newUser} \`${tag}\` Tagımızı Çıkardığı İçin <@&${rol}> Rolünü Aldım`));
  await client.guilds.cache.get(sunucu).members.cache.get(newUser.id).roles.remove(rol);
  } 
} catch (e) {
console.log(`Bir hata oluştu! ${e}`)
 }
} 
});

client.on("guildMemberAdd", member => {
    member.roles.add(id.kayıtsız); 
});

client.on("ready", () => {
  client.channels.cache.get(id.ses).join();
  });  

client
  .login('ODIzOTEwNjI4OTY3ODQxODQy.YFnskQ.QUrCMXTvxb3dOGLfuUL8LurDbFE')
  .then(console.log("Bot başarılı bir şekilde giriş yaptı."));
