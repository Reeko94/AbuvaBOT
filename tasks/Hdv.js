const Cron = require("../base/Cron");
const moment = require("moment");

class Hdv extends Cron {
  constructor (client) {
    super(client, "*/10 * * * *");
  }

  async run (guild) {
    const channelHDV = guild.channels.cache.find(channel => channel.name === "hdv");
    await this.client.db.login("Telecaster");
    const itemsInHDV = await this.client.db.query("select *\n" +
      "from Telecaster.dbo.Auction hdv\n" +
      "    left join Telecaster.dbo.Item ON hdv.item_id = Item.sid\n" +
      "    LEFT JOIN Arcadia.dbo.ItemResource AI on AI.id = Item.code\n" +
      "    LEFT JOIN Arcadia.dbo.StringResource ON StringResource.code = AI.name_id\n" +
      "WHERE seller_name NOT LIKE 'SVR%'");
    await this.client.db.logout();
    while (channelHDV.messages.cache.size > 0) {
      await channelHDV.bulkDelete(100, true);
    }
    if (itemsInHDV.recordset.length > 0) {
      channelHDV.send("**___Hotel des ventes___**");
      let messageHDV = "";
      itemsInHDV.recordset.map(item => {
        var duration = moment(item.end_time).diff(moment());
        var timeBeforeEnd = moment.duration(duration);
        messageHDV += `__${item.seller_name}__ >> __**${item.value}**__  >> ** ${item.highest_bidding_price} ** (**${item.instant_purchase_price}**)  >>  __***${timeBeforeEnd.format("hh:mm:ss")} Restant***__ \n `;
      });
      const messages = messageHDV.replace(/^\s+|\s+$/g, "").split("\n");
      messages.splice(-1);
      let messageReadyToSend = "";
      messages.map(m => {
        if (messageReadyToSend.length + m.length + 3 > 2000) {
          channelHDV.send(messageReadyToSend);
          messageReadyToSend = "";
        } else {
          messageReadyToSend += "\n" + m;
        }
      });
      channelHDV.send(messageReadyToSend);
    }
  }
}

module.exports = Hdv;
