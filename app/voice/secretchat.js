/*
・alfa〜mikeにだけ実装
・vcに1人でもいる場合は全員閲覧可
・vcから誰もいなくったら閲覧権限だけ削除
・過去ログは管理者以外見えないようにする
・これで一般ユーザーからは誰かがvc接続時にしか現れない秘密の部屋になるけど、ログは残る。
・vc接続時は全員に見えるから秘密のお喋りでもない
*/
// Discord bot implements
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});
const request = require('request');

module.exports = {
  onVoiceStateUpdate: onVoiceStateUpdate,
};

const CHANNEL_PREFIX = 'bot用';
const BOT_ROLE_NAME = 'bot';
const pattern = /^[a-m]|^bot用/;
async function onVoiceStateUpdate(oldState, newState) {
  if (oldState.channelId === newState.channelId) {
    return;
  }

  if (oldState.channelId != null) {
    const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
    if (oldChannel.members.size == 0) {
      await chHide(oldChannel);
    }
  }

  if (newState.channelId != null) {
    const newChannel = newState.guild.channels.cache.get(newState.channelId);
    if (!newChannel.name.match(pattern)) {
      return;
    }
    let txtChannel;
    let chName = CHANNEL_PREFIX + newChannel.name;
    if (newChannel.members.size == 1 && !newState.guild.channels.cache.some((ch) => ch.name === chName)) {
      txtChannel = await txChCreate(newChannel, newState.member);
    } else {
      txtChannel = await chJoin(newChannel, newState.member);
    }
  }
}

async function txChCreate(voiceChannel, voiceJoinedMember) {
  try {
    const guild = voiceChannel.guild;
    let chName = CHANNEL_PREFIX + voiceChannel.name;
    let botRole = guild.roles.cache.find((val) => val.name === BOT_ROLE_NAME);
    let result = await guild.channels.create(chName, {
      parent: voiceChannel.parent,
      type: 'text',
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ['READ_MESSAGE_HISTORY'],
        },
        {
          id: voiceJoinedMember.id,
          allow: ['VIEW_CHANNEL'],
        },
        {
          id: botRole.id,
          allow: ['VIEW_CHANNEL'],
        },
      ],
    });
    return result;
  } catch (err) {
    console.log(err);
  }
}

function chFind(voiceChannel) {
  const guild = voiceChannel.guild;
  let chName = CHANNEL_PREFIX + voiceChannel.name;
  let result = guild.channels.cache.find((val) => val.name === chName);
  return result;
}

async function chJoin(ch, user) {
  let target = await chFind(ch);
  if (target != null) {
    target.permissionOverwrites.edit(ch.guild.roles.everyone, {
      VIEW_CHANNEL: true,
      READ_MESSAGE_HISTORY: true,
    });
    return target;
  }
}

async function chHide(ch) {
  let target = await chFind(ch);
  if (target != null) {
    target.permissionOverwrites.edit(ch.guild.roles.everyone, {
      VIEW_CHANNEL: false,
    });
  }
}
