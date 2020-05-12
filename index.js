require("dotenv").config()
const Discord = require("discord.js")

var embeds = require('./embeds.js');

const client = new Discord.Client()
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", msg => {
    if (msg.content.startsWith("!")) {
        switch(msg.content) {
            case "!brickless":
                msg.channel.send(embeds.bricklessEmbed);
                break;
            case "!hdplex":
                msg.reply("Info about HDPlex")
                break;
            case "!gpu":
                msg.channel.send(embeds.gpuEmbed);
                break;
            default:
                msg.reply("Currently available commands:\n" + 
                            "!brickless\t\tInfo about brickless configurations\n" +
                            "!hdplex\t\t\tInfo about HDPlex power supplies\n" + 
                            "!gpu\t\t\t\tInfo about GPU options and fitment")
        }
  }
})
client.login(process.env.BOT_TOKEN)