require("dotenv").config()
const Discord = require("discord.js")
const fs = require('fs');

const commandData = JSON.parse(fs.readFileSync('commands.json'));

const commands = {};
const commandListEmbed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Command list")
    
const info = ['Currently available commands:'];

for (const k of Object.keys(commandData)) {
    commandListEmbed.addField(k, commandData[k].info, true);

    commands[k] = new Discord.MessageEmbed()
        .setColor(commandData[k].color)
        .setTitle(commandData[k].title)
        .setDescription(commandData[k].description);

    for (const field of commandData[k].fields) {
        commands[k].addField(field.name, field.value, !!field.inline)
    }
}

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {
    if (msg.content.startsWith("!")) {
        const messageEmbed = commands[msg.content];
        if (messageEmbed) {
            msg.channel.send(messageEmbed);
        } else {
            msg.channel.send(commandListEmbed)
        }
    }
})

client.login(process.env.BOT_TOKEN)