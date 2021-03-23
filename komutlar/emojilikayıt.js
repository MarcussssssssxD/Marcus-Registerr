const Discord = require("discord.js"),
  client = new Discord.Client();
const ayar = require("../ayarlar.json");

module.exports.run = async (client, message, args) => {
  if (
    !message.member.hasPermission("ADMINISTRATOR") &
    !message.member.roles.cache.get(ayar.kayıtyetkili)
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

  let üye = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
  if (!üye)
    return message.channel
      .send(new Discord.MessageEmbed().setColor("RED").setDescription(`Lütfen Bir Kullanıcı Etiketleyiniz`)).then(m => m.delete({ timeout: 3000 }));
  args = args.filter(a => a !== "" && a !== " ").splice(1);
  let isim = args.filter(arg => isNaN(arg)).map(arg => arg.charAt(0).replace("i", "İ").toUpperCase() + arg.slice(1)).join(" ");
  let yas = args.filter(arg => !isNaN(arg))[0];

  if (!isim || !yas)
    return message.channel.send(new Discord.MessageEmbed().setColor("RED").setDescription("Geçerli bir isim ve yaş belirtmelisin!")).then(x => x.delete({ timeout: 3000 }));

  let kayıtmesaj = await message.channel.send(
    new Discord.MessageEmbed().setColor("BLUE")
      .setDescription(`**__Kayıt İşlemi Başlatıldı;__**
    
    • \`Kullanıcı:\` ${üye}
    • \`Yetkili:\` ${message.author} 
    • \`Yeni İsim:\` **${ayar.tag} ${isim} | ${yas}**
    
    Kayıt Türünü Emojilere Basarak Seçebilirsiniz;
    <a:qmierkek:823191512904106004> : \`Erkek Kayıt\`, <a:qmikiz:823191555895590912> : \`Kız Kayıt\`, <a:basarisiz:796036002044051476> : \`Kayıt İşlemi İptal\``)
  );

  kayıtmesaj.react("823191512904106004") .then(() => kayıtmesaj.react("823191555895590912").then(() => kayıtmesaj.react("796036002044051476")));
  const filter = (reaction, victim) => {
    return (
      ["823191512904106004", "823191555895590912", "796036002044051476"].includes(reaction.emoji.id) && victim.id === message.author.id );
  };
  kayıtmesaj.awaitReactions(filter, { max: 1, time: 30000, errors: ["time"] }).then(collected => { const reaction = collected.first();
      if (reaction.emoji.id === "823191512904106004") {
        kayıtmesaj .edit(new Discord.MessageEmbed().setColor("GREEN") .setAuthor("Erkek olarak bir kullanıcı kaydedildi!") .setDescription(`<a:basarili:796036099562012674> ${üye.user} adlı kullanıcının ismini başarılı bir şekilde \`₰ ${isim} | ${yas}\` yapıp, <@&${ayar.erkekrolcuk2}>, <@&${ayar.erkekrolcuk}> rollerini verdim.`)).then(m => m.delete({ timeout: 15000 }));
        ekayıt();
      } else if (reaction.emoji.id === "823191555895590912") {
        kayıtmesaj .edit( new Discord.MessageEmbed() .setColor("GREEN") .setAuthor("Kız olarak bir kullanıcı kaydedildi!") .setDescription(`<a:basarili:796036099562012674> ${üye.user} adlı kullanıcının ismini başarılı bir şekilde \`₰ ${isim} | ${yas}\` yapıp, <@&${ayar.kızrolcuk2}>, <@&${ayar.erkekrolcuk}> rollerini verdim.`
              )
          )
          .then(m => m.delete({ timeout: 15000 }));
        kkayıt();
      } else if (reaction.emoji.id === "796036002044051476") {
        kayıtmesaj .edit( new Discord.MessageEmbed().setDescription(`${message.author} Tarafından Kayıt İşlemi İptal Edildi!` )).then(m => m.delete({ timeout: 3000 }));
      }
    });

  const ekayıt = async () => {
    üye.roles.remove(ayar.kayıtsız);
    üye.roles.remove(ayar.kayıtsız);
    üye.roles.add(ayar.erkekrolcuk);
    üye.roles.add(ayar.erkekrolcuk2);
    üye.roles.add(ayar.erkekrolcuk);
    üye.roles.add(ayar.erkekrolcuk2);
    üye.setNickname(`₰ ${isim} | ${yas}`);
    üye.setNickname(`₰ ${isim} | ${yas}`);
    client.channels.cache
      .get(ayar.genelsohbet)
      .send(
        `${üye.user} \`adlı üye sunucumuza kayıt oldu. Rol seçim odalarından kendine uygun rolleri alabilirsin.\` \n<#791113448473493524>, <#791224432839360583>, <#793011391279005736>, <#803797050604388362>, <#793159439061483551>, <#793241595126218752>`
      )
      .then(x => x.delete({ timeout: 60000 }));
  };

  const kkayıt = () => {
    üye.roles.remove(ayar.kayıtsız);
    üye.roles.remove(ayar.kayıtsız);
    üye.roles.add(ayar.erkekrolcuk);
    üye.roles.add(ayar.kızrolcuk2);
    üye.roles.add(ayar.erkekrolcuk);
    üye.roles.add(ayar.kızrolcuk2);
    üye.setNickname(`₰ ${isim} | ${yas}`);
    üye.setNickname(`₰ ${isim} | ${yas}`);
    client.channels.cache
      .get(ayar.genelsohbet)
      .send(
        `${üye.user} \`adlı üye sunucumuza kayıt oldu. Rol seçim odalarından kendine uygun rolleri alabilirsin.\` \n<#791113448473493524>, <#791224432839360583>, <#793011391279005736>, <#803797050604388362>, <#793159439061483551>, <#793241595126218752>`
      )
      .then(x => x.delete({ timeout: 60000 }));
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
