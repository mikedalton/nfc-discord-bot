require("dotenv").config()
const Discord = require("discord.js")
const fs = require('fs');

const commandData = JSON.parse(fs.readFileSync('commands.json'));

const commandEmbeds = {};
const dmEmbeds = {};
const commandListEmbed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Command list")
    
const info = ['Currently available commands:'];

for (const k of Object.keys(commandData)) {
    // When building the command list, add @username for DM-targeted commands
    if (commandData[k].dm == false) {
        commandListEmbed.addField(k, commandData[k].info, true);
    } else {
        commandListEmbed.addField(k + ' [@username]', commandData[k].info, true);
    }

    // Create embed for main channel
    commandEmbeds[k] = new Discord.MessageEmbed()
        .setColor(commandData[k].color)
        .setTitle(commandData[k].title)
        .setDescription(commandData[k].description);

    // Create embed for DM reply
    dmEmbeds[k] = new Discord.MessageEmbed()
        .setColor(commandData[k].color)
        .setTitle(commandData[k].title)
        .setDescription(commandData[k].description);

    // Loop through fields
    for (const field of commandData[k].fields) {
        // If the command is channel-targeted, add fields to main command embed. Otherwise, add fields to DM embed
        if (commandData[k].dm == false) {
            commandEmbeds[k].addField(field.name, field.value, !!field.inline);
        } else {
            dmEmbeds[k].addField(field.name, field.value, !!field.inline);
        }
    }
    // If command is DM-targeted, add note field
    if (commandData[k].dm == true) {
        commandEmbeds[k].addField('Notes', 'There is a *lot* of data on this topic. Please check the DM you were just sent.');
    }
}

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.channels.cache.get('516778810465583124').send(("Hi! I'm your friendly neighborhood NFC-Bot, here to lend a hand! Start out with !help. For any questions or feedback, hit up @Sm0keWag0n."));
})

client.on("message", msg => {
    // Ignore anything but commands
    if (msg.content.startsWith("!")) {
        // Grab first user mentioned
        user = msg.mentions.users.first();
        // If no user mentioned, default to author of message for self-pings
        if (!user) {
            user = msg.author;
        }
        // Extract the command in case of user mention
        command = msg.content.split(" ")[0];
        const channelEmbed = commandEmbeds[command];
        if (channelEmbed) {
            msg.channel.send(channelEmbed);
            if (commandData[command].dm == true) {
                dmEmbed = dmEmbeds[command];
                if (dmEmbed) {
                    user.send(dmEmbed);
                }
            }
        } else {
            msg.channel.send(commandListEmbed);
        }
    }
})

client.login(process.env.BOT_TOKEN)