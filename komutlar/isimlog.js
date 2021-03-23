const Discord = require("discord.js"),
  client = new Discord.Client();
const db = require("quick.db");

module.exports.run = async (client, message, args) => {
 
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["nickname", "isimler", "isimleri"],
  permLevel: 0
};
exports.help = {
  name: "isimleri",
  description: "Erkek Kayıt",
  usage: "prefix!erkek"
};
