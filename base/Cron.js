class Cron {
  constructor (client, scheduler= "* * * * *") {
    this.client = client;
    this.scheduler = scheduler;
  }
}

module.exports = Cron;
