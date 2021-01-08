const Command = require("../base/Command");

class Report extends Command {
  constructor (client) {
    super(client, {
      name: "report",
      description: "Report un joueur en jeu (en MP ou sur le serveur)",
      usage: "report <player> (obligatoire) <raison> (facultative max 255 caractères)",
      guildOnly: false,
      category: "Jeu"
    });
  }

  async run (message, args, level) {
    if (args.length === 0) return message.reply("Un pseudo est obligatoire");
    if (args.length > 3) return message.reply("Trop de parametres envoyés");
    try {
      await this.client.db.login("discord_data");
      if (args.length > 1 && args.length) {
        const player = args[0];
        args.shift();
        const reason = args.join(" ");
        await this.client.db.query(`INSERT INTO discord_data.dbo.reported ([user], player, reason) VALUES ('${message.author.tag}','${player}','${reason}');`);
      } else {
        const player = args[0];
        await this.client.db.query(`INSERT INTO discord_data.dbo.reported ([user], player) VALUES ('${message.author.tag}','${player}');`);
      }
      message.reply("La personne a bien été report. Un administrateur vous recontactera s'il a besoin de plus d'informations.");
    } catch (error) {
      console.log(error);
      message.reply("Une erreur est survenue. Merci de le signaler à un administrateur");
    }
  }
}

module.exports = Report;
