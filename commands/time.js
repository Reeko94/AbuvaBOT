const Command = require("../base/Command");
const Discord = require("discord.js");

class Time extends Command {
  constructor (client) {
    super(client, {
      name: "time",
      description: "Voir le temps de jeu des joueurs",
      usage: "time",
      guildOnly:true,
      aliases: ["tiem"]
    });
  }

  async run (message, args, level) {
    await this.client.db.login("Telecaster");
    const characters = await this.client.db.query("SELECT * FROM dbo.Character WHERE SUBSTRING(name,1,1) <> '@' AND SUBSTRING(name,1,7) <> '[ADMIN]' ORDER BY lv DESC");
    await this.client.db.logout();

    const persons = await Promise.all(characters.recordset.map(async (c,index) => {
      return {time: c.play_time, name: c.name};
    }));

    const players = persons.map(p => {
      return p.name;
    });

    const times = persons.map(p => {
      return Number.parseFloat(p.time/60).toFixed(1) + " minutes";
    });

    const exampleEmbed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Classement des joueurs")
      .setURL("https://discord.js.org/")
      .setAuthor("AbhuvaBOT", "https://i.imgur.com/wSTFkRM.png", "https://discord.js.org")
      .addFields(
        { name: "Joueurs", value: players, inline: true },
        { name: "Temps de jeu", value: times, inline: true },
      );

    await this.client.db.logout();
    await message.channel.send(exampleEmbed);
  }
}

module.exports = Time;
