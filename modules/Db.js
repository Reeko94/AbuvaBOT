const sql = require("mssql");
const Logger = require("./Logger");

class Db {

  constructor (client) {
    this.client = client;
  }

  async login (dbName) {
    try {
      this.dbo = await sql.connect({
        user: this.client.config.defaultSettings.dbUser,
        password: this.client.config.defaultSettings.dbPassword,
        server: this.client.config.defaultSettings.dbHost,
        database: dbName,
        port: this.client.config.defaultSettings.dbPort,
        debug: this.client.config.defaultSettings.dbDebug,
        options: {
          instanceName: this.client.config.defaultSettings.dbInstance
        }
      });
    } catch (err) {
      Logger.error(err);
    }

  }

  query (sql) {
    try {
      return this.dbo.request().query(sql);
    } catch (err) {
      Logger.error(err);
    }
  }

  async logout () {
    await this.dbo.close();
  }
}

module.exports = Db;
