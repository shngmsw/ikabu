const Canvas = require('canvas');
const path = require('path');
const Discord = require('discord.js');
const { dateDiff } = require('../common');
const backgroundImgPaths = [
    './images/over4years.jpg',
    './images/4years.jpg',
    './images/3years.jpg',
    './images/2years.jpg',
    './images/1year.jpg',
    './images/0.5year.jpg',
    './images/1month.jpg',
];
const colorCodes = ['#db4240', '#9849c9', '#2eddff', '#5d8e9c', '#f0c46e', '#86828f', '#ad745c'];
module.exports = async function handleIkabuExperience(msg) {
    let author = msg.author;
    const member = msg.guild.members.cache.get(author.id);
    const joinDate = member.joinedAt;
    let today = new Date();

    let years = dateDiff(joinDate, today, 'Y', true);
    let months = dateDiff(joinDate, today, 'YM', true);
    let days = dateDiff(joinDate, today, 'MD', true);

    Canvas.registerFont(path.resolve('./fonts/Splatfont.ttf'), { family: 'Splatfont' });
    Canvas.registerFont(path.resolve('./fonts/GenShinGothic-P-Bold.ttf'), { family: 'Genshin-Bold' });

    const canvas = Canvas.createCanvas(700, 250);
    const context = canvas.getContext('2d');
    let background;
    let experienceRank = 0;

    if (years >= 4) {
        experienceRank = 0;
    } else if (years >= 3) {
        experienceRank = 1;
    } else if (years >= 2) {
        experienceRank = 2;
    } else if (years >= 1) {
        experienceRank = 3;
    } else if (months >= 6) {
        experienceRank = 4;
    } else if (months >= 1) {
        experienceRank = 5;
    } else {
        experienceRank = 6;
    }
    // set & crop background image
    background = await Canvas.loadImage(backgroundImgPaths[experienceRank]);
    context.drawImage(background, 150, 200, canvas.width * 3, canvas.height * 3, 0, 0, canvas.width, canvas.height);

    context.strokeRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.globalAlpha = 0.6;
    context.fillStyle = '#ffffff';
    context.fillRect(15, 15, canvas.width - 30, canvas.height - 30);
    context.restore();

    // load avatar image
    const avatar = await Canvas.loadImage(author.displayAvatarURL({ format: 'png' }));

    // set path for clip
    context.beginPath();
    context.arc(125, 125, 85, 0, Math.PI * 2, true);
    context.closePath();
    context.save();
    context.clip();
    context.drawImage(avatar, 0, 0, avatar.width, avatar.height, 40, 40, 170, 170);
    context.restore();

    // stroke setting
    context.strokeStyle = colorCodes[experienceRank];
    context.lineWidth = 8;
    context.stroke();

    context.font = userText(canvas, member.displayName);
    context.fillStyle = colorCodes[experienceRank];

    var userWidth = context.measureText(member.displayName).width;

    context.fillText(member.displayName, (400 - userWidth) / 2 + 250, 63);
    context.strokeStyle = '#333333';
    context.lineWidth = 1.5;
    context.strokeText(member.displayName, (400 - userWidth) / 2 + 250, 63);

    context.font = '43px Splatfont';
    context.fillText('イカ部歴', 240, 130);
    context.strokeStyle = '#333333';
    context.lineWidth = 1.5;
    context.strokeText('イカ部歴', 240, 130);

    // 0のときは出力しない
    let output = '';
    output = years != 0 ? years + '年' : '';
    output = months != 0 ? output + months + 'ヶ月' : output + '';
    output = days != 0 ? output + days + '日' : output + '';

    var textWidth = context.measureText(output).width;
    context.font = exText(canvas, output);
    context.fillText(output, (400 - textWidth) / 2 + 230, 210);
    context.strokeStyle = '#333333';
    context.lineWidth = 2;
    context.strokeText(output, (400 - textWidth) / 2 + 230, 210);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'ikabu_experience.png');

    msg.reply({ files: [attachment] });
};

const userText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 50;

    do {
        context.font = `${(fontSize -= 1)}px Genshin-Bold`;
    } while (context.measureText(text).width > 440);

    return context.font;
};

// Pass the entire Canvas object because you'll need access to its width and context
const exText = (canvas, text) => {
    const context = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = 80;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        context.font = `${(fontSize -= 10)}px Splatfont`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (context.measureText(text).width > canvas.width - 306);

    // Return the result to use in the actual canvas
    return context.font;
};
