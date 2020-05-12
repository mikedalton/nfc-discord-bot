require("dotenv").config()
const Discord = require("discord.js")
const fs = require('fs');

const commandData = JSON.parse(fs.readFileSync('commands.json'));

const commands = {};
const info = ['Currently available commands:'];

for (const k of Object.keys(commandData)) {
    info.push(commandData[k].info)

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
            msg.reply(info.join('\n'))
        }
    }
})

client.login(process.env.BOT_TOKEN)