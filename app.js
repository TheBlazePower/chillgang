const botconfig = require("./botconfig.json");
const {YouTubeAPIKey} = require('./credentials.json');
const Discord = require("discord.js");
const cleverbot = require("cleverbot.io");
const fs = require("fs");
const Canvas = require('canvas');
const snekfetch = require('snekfetch');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commands = JSON.parse(fs.readFileSync(`Storage/commands.json`, `utf8`));

fs.readdir("./commands/", (err, files) => {
  if (err) console.error(err);
  let jsfiles = files.filter(f => f.split(".").pop() === "js");

  if (jsfiles.length <= 0) return console.log("There are no commands to load...");

  console.log(`Loading ${jsfiles.length} commands...`);
  jsfiles.forEach((f, i) => {
    let props = require(`./commands/${f}`);
    console.log(`${i + 1}: ${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });
});

const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};

bot.on('guildMemberAdd', async member => {

  let role = member.guild.roles.find("name", "💢Members💢");
  member.addRole(role).catch(console.error);

  var ch = JSON.parse(fs.readFileSync("./channel.json", "utf8"));
  var channel = member.guild.channels.get(`506419271316930561`) || member.guild.channels.get(`425303643890122753`);
  if (!channel) return;

    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('./shader.jpg');
    ctx.drawImage(background, 10, 10, canvas.width, canvas.height);

    ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Slightly smaller text placed above the member's display name
    ctx.font = '38px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`SELAMAT DATANG DI \n${member.guild.name}`, canvas.width / 2.6, canvas.height / 3.5);

    // Add an exclamation point here and below
    ctx.font = '48px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${member.user.username}#${member.user.discriminator}`, canvas.width / 2.4, canvas.height / 1.5);

  // Slightly smaller text placed above the member's display name
  ctx.font = '36px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`KAU ADALAH MEMBER KE ${member.guild.memberCount}`, canvas.width / 3.3, canvas.height / 1.1);

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const { body: buffer } = await snekfetch.get(member.user.displayAvatarURL);
    const avatar = await Canvas.loadImage(buffer);
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');

  channel.send(`Selamat Datang ${member} Di ${member.guild.name}`, attachment);

});

bot.on('guildMemberRemove', async member => {

    var ch = JSON.parse(fs.readFileSync("./channel.json", "utf8"));
    var channel = member.guild.channels.get(`506419271316930561`) || member.guild.channels.get(`425303643890122753`);
    if (!channel) return;

    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    const background = await Canvas.loadImage('./shader.jpg');
    ctx.drawImage(background, 10, 10, canvas.width, canvas.height);

    ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Slightly smaller text placed above the member's display name
    ctx.font = '38px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`SELAMAT TINGGAL DARI \n${member.guild.name}`, canvas.width / 2.6, canvas.height / 3.5);

    // Add an exclamation point here and below
  	ctx.font = '48px sans-serif';
  	ctx.fillStyle = '#ffffff';
  	ctx.fillText(`${member.user.username}#${member.user.discriminator}`, canvas.width / 2.4, canvas.height / 1.5);

    // Slightly smaller text placed above the member's display name
    ctx.font = '25px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`JUMLAH SEKARANG MEMILIKI TOTAL ${member.guild.memberCount}TH`, canvas.width / 3.3, canvas.height / 1.1);

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const { body: buffer } = await snekfetch.get(member.user.displayAvatarURL);
    const avatar = await Canvas.loadImage(buffer);
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');

    channel.send(`Selamat Tinggal ${member} Dia Meninggalkan ${member.guild.name}`, attachment);

});

bot.on("ready", async () => {
console.log(`${bot.user.username} is ready for action!`);
  bot.user.setActivity("Tag Saya Untuk Prefix Command");
});

bot.afk = new Map();
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let command = messageArray[0].toLowerCase();
  let args = messageArray.slice(1);

  if (message == `<@${bot.user.id}>` || message == `<@!${bot.user.id}>`) {
     message.channel.send("Halo Prefix Ku Ini `cg!` Jika Ada Masalah Mohon DM `zChillRey#7627`");
   }

  if (message.content.includes(message.mentions.users.first())) {
    let mentioned = bot.afk.get(message.mentions.users.first().id);
    if (mentioned) message.reply(`| **<@${mentioned.id}>** <:away:511231308916326452> Sedang AFK Jangan Di Ganggu. Reason: ${mentioned.reason}`);
  }
  let afkcheck = bot.afk.get(message.author.id);
  if (afkcheck) return [bot.afk.delete(message.author.id), message.reply(`<:online:511231781148688395> Sudah Kembali Dari AFK`).then(msg => msg.delete(5000))];

  if (!command.startsWith(prefix)) return;

  let cmd = bot.commands.get(command.slice(prefix.length));
  if (cmd) cmd.run(bot, message, args);

});

bot.login(process.env.TOKEN);
