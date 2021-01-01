const Command = require("../base/Command");
const Discord = require("discord.js");

class Online extends Command {
  constructor (client) {
    super(client, {
      name:"online",
      description: "Recupération des joueurs en ligne",
      usage: "online",
      permLevel: "Bot Owner"
    });
  }

  async run (message,args, level) {
    await this.client.db.login("Telecaster");
    const users = await this.client.db.query("SELECT name FROM Telecaster.dbo.Character WHERE logout_time < getdate() and logout_time < Character.login_time");
    const members = await Promise.all(
      users.recordset.map(u => {
        return u.name;
      })
    );
    const messageEmbed = new Discord.MessageEmbed()
      .setTitle("Joueurs en ligne")
      .addField("Joueurs",members,true);

    await this.client.db.logout();
    await message.reply(messageEmbed);
  }
}

module.exports = Online;
