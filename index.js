require("dotenv").config()
const Discord = require("discord.js")
const request = require('sync-request');

class NFCBot {
    constructor() {
        this.commandData = {};
        this.commandEmbeds = {};
        this.dmEmbeds = {};
        this.commandListEmbed = {};
        this.client = null;
    }

    updateCommands() {
        this.commandEmbeds = {};
        this.dmEmbeds = {};
        const res = request('GET', process.env.COMMAND_URL);

        if (res.statusCode != "200") {
            const err = new Error(
                'Server responded with status code ' +
                this.statusCode +
                ':\n' +
                this.body.toString(encoding)
            );
            err.statusCode = this.statusCode;
            err.headers = this.headers;
            err.body = this.body;
            throw err;
        } else {
            console.log("Successfully retrieved JSON command file")
            this.commandData = JSON.parse(res.body);
        }

        this.commandListEmbed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle("Command list")

        for (const k of Object.keys(this.commandData)) {
            // When building the command list, add @username for DM-targeted commands
            if (this.commandData[k].dm == false) {
                this.commandListEmbed.addField(k, this.commandData[k].info, true);
            } else {
                this.commandListEmbed.addField(k + ' [@username]', this.commandData[k].info, true);
            }

            // Create embed for main channel
            this.commandEmbeds[k] = new Discord.MessageEmbed()
                .setColor(this.commandData[k].color)
                .setTitle(this.commandData[k].title)
                .setDescription(this.commandData[k].description);

            // Create embed for DM reply
            this.dmEmbeds[k] = new Discord.MessageEmbed()
                .setColor(this.commandData[k].color)
                .setTitle(this.commandData[k].title)
                .setDescription(this.commandData[k].description);

            // Loop through fields
            for (const field of this.commandData[k].fields) {
                // If the command is channel-targeted, add fields to main command embed. Otherwise, add fields to DM embed
                if (this.commandData[k].dm == false) {
                    this.commandEmbeds[k].addField(field.name, field.value, !!field.inline);
                } else {
                    this.dmEmbeds[k].addField(field.name, field.value, !!field.inline);
                }
            }
            // If command is DM-targeted, add note field
            if (this.commandData[k].dm == true) {
                this.commandEmbeds[k].addField('Notes', 'There is a *lot* of data on this topic. Please check the DM you were just sent.');
            }
        }
    }

    start() {
        this.updateCommands();
        this.client = new Discord.Client();
        this.client.on("ready", this.onReady);
        this.client.on("message", this.onMessage);
        this.client.login(process.env.BOT_TOKEN)
    }

    // It's important that event handlers be arrow functions.  Arrow functions share "this" with their outer code block.
    // Other wise "this" inside an event hander points to the global namespace.

    onReady = () => {
        console.log(`Logged in as ${this.client.user.tag}!`);
        //client.channels.cache.get('516778810465583124').send(("Hi! I'm your friendly neighborhood NFC-Bot, here to lend a hand! Start out with `!info-bot`. For any questions or feedback, hit up @Sm0keWag0n."));
    }

    onMessage = (msg) => {
        // Ignore anything but commands
        if (msg.content.startsWith("!")) {
            // Grab first user mentioned
            let user = msg.mentions.users.first();
            // If no user mentioned, default to author of message for self-pings
            if (!user) {
                user = msg.author;
            }
            // Extract the command in case of user mention
            const command = msg.content.split(" ")[0];
            const channelEmbed = this.commandEmbeds[command];
            if (channelEmbed) {
                msg.channel.send(channelEmbed);
                if (this.commandData[command].dm == true) {
                    const dmEmbed = this.dmEmbeds[command];
                    if (dmEmbed) {
                        user.send(dmEmbed);
                    }
                }
            } else if (msg.content == "!info-bot") {
                msg.channel.send(this.commandListEmbed);
            } else if (msg.content == "!update-commands") {
                if (msg.author.id == process.env.ADMIN_USER) {
                    this.updateCommands();
                    msg.channel.send("Commands updated");
                } else {
                    msg.channel.send("You don't have permission to do that, " + msg.author.username);
                }
            }
        }
    }
}


const bot = new NFCBot();
bot.start();

const cron = require('node-cron');
cron.schedule('0 0 0/1 * * * *', () => {
    console.log('Updating commands from remote file');
    bot.updateCommands();
});