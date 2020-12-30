const Command = require("../base/Command");
const Discord = require("discord.js");

class Rank extends Command {
  constructor (client) {
    super(client, {
      name: "rank",
      description: "Display rank players",
      usage: "rank",
      guildOnly: true,
      aliases: ["r"]
    });
  }

  async run (message, args, level) {
    await this.client.db.login("Telecaster");
    const characters = await this.client.db.query("SELECT * FROM dbo.Character WHERE SUBSTRING(name,1,1) <> '@' AND SUBSTRING(name,1,7) <> '[ADMIN]' ORDER BY lv DESC");
    await this.client.db.logout();
    await this.client.db.login("Arcadia");
    const rankPerLevel = await this.client.db.query("select * from dbo.LevelResource");

    const persons = await Promise.all(
      characters.recordset.map(async (c, index) => {
        const actualLV = (c.lv);
        const jobID = c.job;
        let job = "Non renseigné";
        if (jobID > 0) {
          const jobResource = await this.client.db.query("select * from dbo.JobResource where id = " + jobID);
          const text_id = jobResource.recordset[0].text_id;
          const stringResource = await this.client.db.query("select * from dbo.StringResource where code = " + text_id);
          characters.recordset[index]["job_name"] = stringResource.recordset[0].value;
          job = stringResource.recordset[0].value;
        }
        return { name: "**" + c.name + "**", job: job, level: actualLV,play_time: c.play_time };
      }));

    const levels = persons.map(p => {
      return p.level;
    });
    const classes = persons.map(p => {
      return p.job;
    });

    const players = persons.map(p => {
      return p.name;
    });

    const exampleEmbed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Classement des joueurs")
      .setURL("https://discord.js.org/")
      .setAuthor("AbhuvaBOT", "https://i.imgur.com/wSTFkRM.png", "https://discord.js.org")
      .addFields(
        { name: "Joueurs", value: players, inline: true },
        { name: "Classe", value: classes, inline: true },
        { name: "Niveau", value: levels, inline: true }
      );


    await this.client.db.logout();
    await message.channel.send(exampleEmbed);
  }
}

module.exports = Rank;
