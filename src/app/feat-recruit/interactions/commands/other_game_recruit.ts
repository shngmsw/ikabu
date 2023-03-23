import { EmbedBuilder, PermissionsBitField } from "discord.js";
import { log4js_obj } from "../../../../log4js_settings";
import { searchMemberById } from "../../../common/manager/member_manager";
import { searchMessageById } from "../../../common/manager/message_manager";
import { isNotEmpty, sleep } from "../../../common/others";
import {
  embedRecruitDeleteButton,
  recruitActionRow,
  unlockChannelButton,
} from "../../buttons/create_recruit_buttons";

const logger = log4js_obj.getLogger("recruit");

export async function otherGameRecruit(interaction: $TSFixMe) {
  // subCommands取得
  if (!interaction.isCommand()) return;

  const options = interaction.options;
  const voice_channel = interaction.options.getChannel("使用チャンネル");
  const usable_channel = [
    "alfa",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "fox",
    "golf",
    "hotel",
    "india",
    "juliett",
    "kilo",
    "lima",
    "mike",
  ];

  if (voice_channel != null) {
    if (
      voice_channel.members.size != 0 &&
      !voice_channel.members.has(interaction.member.user.id)
    ) {
      await interaction.reply({
        content: "そのチャンネルは使用中でし！",
        ephemeral: true,
      });
      return;
    } else if (!usable_channel.includes(voice_channel.name)) {
      await interaction.reply({
        content:
          "そのチャンネルは指定できないでし！\n🔉alfa ～ 🔉mikeの間のチャンネルで指定するでし！",
        ephemeral: true,
      });
      return;
    }
  }

  // 募集がfollowUpでないとリグマと同じfunctionでeditできないため
  await interaction.deferReply();
  const guild = await interaction.guild.fetch();
  const roles = await guild.roles.fetch();

  if (options.getSubcommand() === "apex") {
    apexLegends(interaction, roles);
  } else if (options.getSubcommand() === "mhr") {
    monsterHunterRise(interaction, roles);
  } else if (options.getSubcommand() === "overwatch") {
    overwatch(interaction, roles);
  } else if (options.getSubcommand() === "valo") {
    valorant(interaction, roles);
  } else if (options.getSubcommand() === "other") {
    others(interaction, roles);
  }
}

function monsterHunterRise(interaction: $TSFixMe, roles: $TSFixMe) {
  const role_id = roles.find((role: $TSFixMe) => role.name === "ハンター");
  const title = "MONSTER HUNTER RISE";
  const recruitNumText = interaction.options.getString("募集人数");
  const mention = role_id.toString();
  const txt = `<@${interaction.member.id}>` + "**たんのモンハンライズ募集**\n";
  const color = "#b71008";
  const image =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak.jpg";
  const logo =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/MonsterHunterRiseSunBreak_logo.png";
  sendOtherGames(
    interaction,
    title,
    recruitNumText,
    mention,
    txt,
    color,
    image,
    logo
  );
}

function apexLegends(interaction: $TSFixMe, roles: $TSFixMe) {
  const role_id = roles.find((role: $TSFixMe) => role.name === "レジェンド");
  const title = "Apex Legends";
  const recruitNumText = interaction.options.getString("募集人数");
  const mention = role_id.toString();
  const txt = `<@${interaction.member.id}>` + "**たんのApexLegends募集**\n";
  const color = "#F30100";
  const image =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends.jpg";
  const logo =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/ApexLegends_logo.png";
  sendOtherGames(
    interaction,
    title,
    recruitNumText,
    mention,
    txt,
    color,
    image,
    logo
  );
}

function overwatch(interaction: $TSFixMe, roles: $TSFixMe) {
  const role_id = roles.find((role: $TSFixMe) => role.name === "ヒーロー");
  const title = "Overwatch2";
  const recruitNumText = interaction.options.getString("募集人数");
  const mention = role_id.toString();
  const txt = `<@${interaction.member.id}>` + "**たんのOverwatch2募集**\n";
  const color = "#ED6516";
  const image =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/Overwatch2.png";
  const logo =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/Overwatch_logo.png";
  sendOtherGames(
    interaction,
    title,
    recruitNumText,
    mention,
    txt,
    color,
    image,
    logo
  );
}

function valorant(interaction: $TSFixMe, roles: $TSFixMe) {
  const role_id = roles.find((role: $TSFixMe) => role.name === "エージェント");
  const title = "VALORANT";
  const recruitNumText = interaction.options.getString("募集人数");
  const mention = role_id.toString();
  const txt = `<@${interaction.member.id}>` + "**たんのVALORANT募集**\n";
  const color = "#FF4654";
  const image =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant.jpg";
  const logo =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/valorant_logo.png";
  sendOtherGames(
    interaction,
    title,
    recruitNumText,
    mention,
    txt,
    color,
    image,
    logo
  );
}

function others(interaction: $TSFixMe, roles: $TSFixMe) {
  const role_id = roles.find((role: $TSFixMe) => role.name === "別ゲー");
  const title = interaction.options.getString("ゲームタイトル");
  const recruitNumText = interaction.options.getString("募集人数");
  const mention = role_id.toString();
  const txt = `<@${interaction.member.id}>` + `**たんの${title}募集**\n`;
  const color = "#379C30";
  const image =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others.jpg";
  const logo =
    "https://raw.githubusercontent.com/shngmsw/ikabu/stg/images/games/others_logo.png";
  sendOtherGames(
    interaction,
    title,
    recruitNumText,
    mention,
    txt,
    color,
    image,
    logo
  );
}

async function sendOtherGames(
  interaction: $TSFixMe,
  title: $TSFixMe,
  recruitNumText: $TSFixMe,
  mention: $TSFixMe,
  txt: $TSFixMe,
  color: $TSFixMe,
  image: $TSFixMe,
  logo: $TSFixMe
) {
  const options = interaction.options;

  const condition = options.getString("内容または参加条件");

  const guild = await interaction.guild.fetch();

  const author = await searchMemberById(guild, interaction.member.user.id);
  const reserve_channel = interaction.options.getChannel("使用チャンネル");

  const embed = new EmbedBuilder()
    .setAuthor({
      name: author.displayName,
      iconURL: author.displayAvatarURL(),
    })
    .setTitle(title + "募集")
    .setColor(color)
    .addFields([
      {
        name: "募集人数",
        value: recruitNumText,
      },
      {
        name: "参加条件",
        value: condition == null ? "なし" : condition,
      },
    ])
    .setImage(image)
    .setTimestamp()
    .setThumbnail(logo);

  if (reserve_channel != null) {
    embed.addFields({
      name: "使用チャンネル",
      value: "🔉 " + reserve_channel.name,
    });
  }

  try {
    const header = await interaction.editReply({
      content: txt,
      embeds: [embed],
      ephemeral: false,
    });
    const sentMessage = await interaction.channel.send({
      content: mention + " ボタンを押して参加表明するでし",
    });

    let isLock = false;
    // 募集文を削除してもボタンが動くように、bot投稿メッセージのメッセージIDでボタン作る
    if (
      reserve_channel != null &&
      interaction.member.voice.channelId != reserve_channel.id
    ) {
      // vc指定なし
      isLock = true;
    }

    const deleteButtonMsg = await interaction.channel.send({
      components: [embedRecruitDeleteButton(sentMessage, header)],
    });

    if (isLock) {
      sentMessage.edit({
        components: [recruitActionRow(header, reserve_channel.id)],
      });
      reserve_channel.permissionOverwrites.set(
        [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.Connect],
          },
          {
            id: interaction.member.user.id,
            allow: [PermissionsBitField.Flags.Connect],
          },
        ],
        "Reserve Voice Channel"
      );

      await interaction.followUp({
        content:
          "募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！",
        components: [unlockChannelButton(reserve_channel.id)],
        ephemeral: true,
      });
    } else {
      sentMessage.edit({ components: [recruitActionRow(header)] });
      await interaction.followUp({
        content:
          "募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！",
        ephemeral: true,
      });
    }

    // ピン留め
    header.pin();

    // 15秒後に削除ボタンを消す
    await sleep(15);
    const deleteButtonCheck = await searchMessageById(
      guild,
      interaction.channel.id,
      deleteButtonMsg.id
    );
    if (isNotEmpty(deleteButtonCheck)) {
      deleteButtonCheck.delete();
    } else {
      if (isLock) {
        reserve_channel.permissionOverwrites.delete(
          guild.roles.everyone,
          "UnLock Voice Channel"
        );
        reserve_channel.permissionOverwrites.delete(
          interaction.member.user,
          "UnLock Voice Channel"
        );
      }
      return;
    }

    // 2時間後にVCロック解除
    await sleep(7200 - 15);
    if (isLock) {
      reserve_channel.permissionOverwrites.delete(
        guild.roles.everyone,
        "UnLock Voice Channel"
      );
      reserve_channel.permissionOverwrites.delete(
        interaction.member.user,
        "UnLock Voice Channel"
      );
    }
  } catch (error) {
    logger.error(error);
  }
}
