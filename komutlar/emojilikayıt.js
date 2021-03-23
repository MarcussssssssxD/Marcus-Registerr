const Discord = require("discord.js"),
  client = new Discord.Client();
const db = require("quick.db");
const id = require("../idler.json");

module.exports.run = async (client, message, args) => {
  if (
    !message.member.hasPermission("ADMINISTRATOR") &
    !message.member.roles.cache.get(id.yetkili)
  )
    return message.channel
      .send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setDescription(
            "Bu komudu kullanmak için gerekli yetkin bulunmamaktadır!"
          )
      )
      .then(x => x.delete({ timeout: 3000 }));

  let üye =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[0]);



  if (!üye)
    return message.channel
      .send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setDescription(`Lütfen Bir Kullanıcı Etiketleyiniz`)
      )
      .then(m => m.delete({ timeout: 3000 }));
  
    let uye = message.guild.member(üye);
  let logs = db.get(`kullanici.${uye.id}.islog`) || [];
  logs = logs.reverse();
  let ismleri =
    logs.length > 0
      ? logs
          .map(
            (value, index) =>
              `\`${index + 1}.\` **${value.İsim} | ${value.Yaş}** (<@&${
                value.Rol
              }>)`
          )
          .join("\n")
      : "Kaydı Bulunamadı!";
  
  args = args.filter(a => a !== "" && a !== " ").splice(1);
  let isim = args
    .filter(arg => isNaN(arg))
    .map(
      arg =>
        arg
          .charAt(0)
          .replace("i", "İ")
          .toUpperCase() + arg.slice(1)
    )
    .join(" ");
  let yas = args.filter(arg => !isNaN(arg))[0];

  if (!isim || !yas)
    return message.channel
      .send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setDescription("Geçerli bir isim ve yaş belirtmelisin!")
      )
      .then(x => x.delete({ timeout: 3000 }));

  let kayıtmesaj = await message.channel.send(
    new Discord.MessageEmbed().setColor("BLUE")
      .setDescription(`**__Kayıt İşlemi Başlatıldı;__**
    
    • \`Kullanıcı:\` ${üye}
    • \`Yetkili:\` ${message.author} 
    • \`Yeni İsim:\` **${"id.tag"} ${isim} | ${yas}**
    
    Kayıt Türünü Emojilere Basarak Seçebilirsiniz;
    ♂ : \`Erkek Kayıt\`, ♀ : \`Kız Kayıt\`, ❌ : \`Kayıt İşlemi İptal\``)
  );

  kayıtmesaj
    .react("♂")
    .then(() => kayıtmesaj.react("♀").then(() => kayıtmesaj.react("❌")));
  const filter = (reaction, victim) => {
    return (
      ["♂", "♀", "❌"].includes(reaction.emoji.name) &&
      victim.id === message.author.id
    );
  };
  kayıtmesaj
    .awaitReactions(filter, { max: 1, time: 30000, errors: ["time"] })
    .then(collected => {
      const reaction = collected.first();
      if (reaction.emoji.name === "♂") {
        kayıtmesaj
          .edit(
            new Discord.MessageEmbed()
              .setColor("GREEN")
              .setAuthor("Erkek olarak bir kullanıcı kaydedildi!")
              .setDescription(
                `<a:basarili:796036099562012674> ${
                  üye.user
                } adlı kullanıcının ismini başarılı bir şekilde \`₰ ${isim} | ${yas}\` yapıp, <@&${id.erkekrol1}>, <@&${id.erkekrol2}> rollerini verdim. Kullanıcının önceki isimleri\n${ismleri}`
              )
          )
          .then(m => m.delete({ timeout: 15000 }));
        ekayıt();
      } else if (reaction.emoji.name === "♀") {
        kayıtmesaj
          .edit(
            new Discord.MessageEmbed()
              .setColor("GREEN")
              .setAuthor("Kız olarak bir kullanıcı kaydedildi!")
              .setDescription(
                `<a:basarili:796036099562012674> ${
                  üye.user
                } adlı kullanıcının ismini başarılı bir şekilde \`₰ ${isim} | ${yas}\` yapıp, <@&${id.kızrol1}>, <@&${id.kızrol2}> rollerini verdim. Kullanıcının önceki isimleri\n${ismleri} `
              )
          )
          .then(m => m.delete({ timeout: 15000 }));
        kkayıt();
      } else if (reaction.emoji.name === "❌") {
        kayıtmesaj
          .edit(
            new Discord.MessageEmbed().setDescription(
              `${message.author} Tarafından Kayıt İşlemi İptal Edildi!`
            )
          )
          .then(m => m.delete({ timeout: 3000 }));
      }
    });

  const ekayıt = async () => {
    üye.roles.remove(id.kayıtsız);
    üye.roles.add(id.erkekrol1);
    üye.roles.add(id.erkekrol2);
    üye.setNickname(`₰ ${isim} | ${yas}`);
    client.channels.cache
      .get(id.genelsohbet)
      .send(
        `${üye.user} \`adlı üye sunucumuza kayıt oldu. Aramıza hoş geldin :)`
      )
      .then(x => x.delete({ timeout: 60000 }));

    db.push(`kullanici.${üye.id}.islog`, {
      İsim: isim,
      Yaş: yas,
      Rol: id.erkekrol1
    });
  };

  const kkayıt = () => {
    üye.roles.remove(id.kayıtsız);
    üye.roles.add(id.kızrol1);
    üye.roles.add(id.kızrol2);
    üye.setNickname(`₰ ${isim} | ${yas}`);
    client.channels.cache
      .get(id.genelsohbet)
      .send(
        `${üye.user} \`adlı üye sunucumuza kayıt oldu. Aramıza hoş geldin :)`
      )
      .then(x => x.delete({ timeout: 60000 }));

    db.push(`kullanici.${üye.id}.islog`, {
      İsim: isim,
      Yaş: yas,
      Rol: id.kızrol1
    });
  };
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["erkek", "kız", "kayıt", "k", "e"],
  permLevel: 0
};
exports.help = {
  name: "kayıt",
  description: "Erkek Kayıt",
  usage: "prefix!erkek"
};
