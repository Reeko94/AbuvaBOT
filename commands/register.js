const Command = require("../base/Command.js");
const prompter = require("discordjs-prompter");
const md5 = require("md5");

class Register extends Command {
  constructor (client) {
    super(client, {
      name: "register",
      description: "Inscription d'un utilisateur",
      usage: "register",
    });
  }

  async run (message, args, level) { // eslint-disable-line no-unused-vars
    if (message.guild) return message.reply("Cette commande ne s'execute qu'en message privée");
    await this.client.db.login("discord_data");
    const user = await this.client.db.query(`SELECT COUNT(id) FROM discord_data.dbo.register_users WHERE discord_tag = '${message.author.tag}'`);
    if (user.recordset.length === 1) return message.reply("Un compte exist déjà avec votre pseudo");
    const questionList = ["Quelle est votre adresse e-mail ?", "Merci de choisir un nom d'utilisateur pour vous connecter","Choisir un mot de passe (**8 caracteres minimum, majuscule, minuscule et au moins un chiffre**)"];
    const responseList = await questionList.reduce(
      async (previousQuestions, currentQuestion, index) => {
        // responses will contain an array of the previous responses
        const responses = await previousQuestions;

        // Here you could use the index variable to check in which question you
        // are at and use the responses array to change the question accordingly.
        const question = currentQuestion;

        const messageCollection = await prompter.message(message.channel, {
          question,
          userId: message.author.id,
          max: 1,
        });

        // Get the first message from the returned collection
        const msg = messageCollection.first();
        // If the user timed out the collection will be empty
        const response = msg ? msg.content : null;

        return [...responses, response];
      },
      [],
    );

    let exit = 0;
    responseList.map(async (response, index) => {
      if (exit === 0) {

        switch (index) {
          case 0:
            const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (await this.emailAlreadyExist(response)) {
              message.reply("Un compte existe déjà avec cette adresse email");
              exit = 1;
            }
            if (!regex.test(response)) {
              message.reply("L'adresse email n'est pas dans le bon format");
              exit = 1;
            }
            break;
          case 1:
            if (await this.usernameAlreadyExist(response)) {
              message.reply("Un compte existe déjà avec ce pseudo");
              exit = 1;
            }
            break;
          case 2:
            const regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
            if (!regexPassword.test(response)) {
              message.reply("Le mot de passe n'est pas assez complèxe");
              exit = 1;
            }
        }
      }
    });
    if (exit === 0) {
      await this.client.db.login("Auth");
      const users = await this.client.db.query("SELECT MAX(account_id) as account_id FROM Auth.dbo.Account");
      await this.client.db.logout();
      try {
        await this.client.db.insert("Auth","Account", {
          account_id: users.recordset[0].account_id + 1,
          account: responseList[1],
          password: md5("2011"+responseList[2]),
          email: responseList[0],
          password2: md5("2011"+responseList[2]),
          block: 0,
          IP_user: "127.0.0.1",
          last_login_server_idx:1,
          Admin: 0,
          point: 0,
          datePassword: "2017-10-20",
          type_: "com.elixir.billing.impl.ImmAccount"
        });
        await this.client.db.insert("discord_data","register_users", {
          discord_tag: message.author.tag,
          id_profile: users.recordset[0].account_id + 1
        });
        message.reply("Votre compte est maintenant créé ! 🎉");
      } catch (error) {
        console.error(error);
      }

    }
  }

  async emailAlreadyExist (email) {
    await this.client.db.login("Auth");
    const account = await this.client.db.query(`SELECT * FROM Auth.dbo.Account WHERE email = '${email}'`);
    await this.client.db.logout();
    return account.recordset.length > 0;
  }

  async usernameAlreadyExist (pseudo) {
    await this.client.db.login("Auth");
    const account = await this.client.db.query(`SELECT * FROM Auth.dbo.Account WHERE account = '${pseudo}'`);
    await this.client.db.logout();
    return account.recordset.length > 0;
  }
}

module.exports = Register;
