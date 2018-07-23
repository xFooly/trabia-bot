const mongoose = require('mongoose')

const config = require('./config.js')
const Discord = require('discord.js');

const client = new Discord.Client();
mongoose.connect(config.database, { useNewUrlParser: true });
require('./schemas');

const commands = require('./commands')(client);
const commandPrefix = config.prefix

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if(config.allowedChannels.indexOf(msg.channel.id) !== -1) {
    if((msg.content).length > 1 && (msg.content).startsWith(commandPrefix)) {
      const cmd = ((msg.content).split(" ")[0]).substring(1)
      if(commands[cmd]) {
        commands[cmd].forwardMessage(msg)
      } else {
        msg.reply(`Non conosco il comando ${cmd}. Hai bisogno di aiuto? Scrivi ${commandPrefix}help`)
      }
    }

    if((msg.content) === `${commandPrefix}help`) {
      let reply = "Questi sono i comandi attualmente disponibili: \n\n"
      for(var key in commands) {
        reply += `**\`${commandPrefix}${key}\`**: ${commands[key].description()} \n`
      }
      msg.reply(reply)
    }
  }
});

const token = config.token
client.login(token);