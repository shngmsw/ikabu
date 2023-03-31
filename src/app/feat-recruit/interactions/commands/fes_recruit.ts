import { AttachmentBuilder, PermissionsBitField } from "discord.js";
import { RecruitService } from "../../../../db/recruit_service";
import { log4js_obj } from "../../../../log4js_settings";
import {
  checkFes,
  fetchSchedule,
  getFesData,
} from "../../../common/apis/splatoon3_ink";
import { setButtonDisable } from "../../../common/button_components";
import { searchMemberById } from "../../../common/manager/member_manager";
import { searchMessageById } from "../../../common/manager/message_manager";
import {
  searchRoleById,
  searchRoleIdByName,
} from "../../../common/manager/role_manager";
import { isEmpty, isNotEmpty, sleep } from "../../../common/others";
import {
  recruitActionRow,
  recruitDeleteButton,
  unlockChannelButton,
} from "../../buttons/create_recruit_buttons";
import { recruitFesCanvas, ruleFesCanvas } from "../../canvases/fes_canvas";
import { getMemberMentions } from "../buttons/recruit_button_events";
const logger = log4js_obj.getLogger("recruit");

export async function fesRecruit(interaction: $TSFixMe) {
  if (!interaction.isCommand()) return;

  const options = interaction.options;
  const channel = interaction.channel;
  const voice_channel = interaction.options.getChannel("使用チャンネル");
  const recruit_num = options.getInteger("募集人数");
  let condition = options.getString("参加条件");
  const guild = await interaction.guild.fetch();
  const host_member = await searchMemberById(guild, interaction.member.user.id);
  const user1 = options.getUser("参加者1");
  const user2 = options.getUser("参加者2");
  const team = interaction.commandName;
  let member_counter = recruit_num; // プレイ人数のカウンター
  let type;

  if (options.getSubcommand() === "now") {
    type = 0;
  } else if (options.getSubcommand() === "next") {
    type = 1;
  }

  if (recruit_num < 1 || recruit_num > 3) {
    await interaction.reply({
      content: "募集人数は1～3までで指定するでし！",
      ephemeral: true,
    });
    return;
  } else {
    member_counter++;
  }

  // プレイヤー指定があればカウンターを増やす
  if (user1 != null) member_counter++;
  if (user2 != null) member_counter++;

  if (member_counter > 4) {
    await interaction.reply({
      content: "募集人数がおかしいでし！",
      ephemeral: true,
    });
    return;
  }

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
      !voice_channel.members.has(host_member.user.id)
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

  // 'インタラクションに失敗'が出ないようにするため
  await interaction.deferReply();

  try {
    const data = await fetchSchedule();

    if (!checkFes(data.schedule, type)) {
      await interaction.editReply({
        content: "募集を建てようとした期間はフェスが行われていないでし！",
        ephemeral: true,
      });
      return;
    }

    const fes_data = await getFesData(data, type);

    let txt = `<@${host_member.user.id}>` + "**たんのフェスマッチ募集**\n";
    const members = [];

    if (user1 != null) {
      members.push(`<@${user1.id}>` + "たん");
    }
    if (user2 != null) {
      members.push(`<@${user2.id}>` + "たん");
    }

    if (members.length != 0) {
      for (let i = 0; i < members.length; i++) {
        if (i == 0) {
          txt = txt + members[i];
        } else {
          txt = txt + "と" + members[i];
        }
      }
      txt += "の参加が既に決定しているでし！\n";
    }

    txt += "よければ合流しませんか？";

    if (condition == null) condition = "なし";

    await sendFesMatch(
      interaction,
      team,
      txt,
      recruit_num,
      condition,
      member_counter,
      host_member,
      user1,
      user2,
      fes_data
    );
  } catch (error) {
    channel.send("なんかエラーでてるわ");
    logger.error(error);
  }
}

async function sendFesMatch(
  interaction: $TSFixMe,
  team: $TSFixMe,
  txt: $TSFixMe,
  recruit_num: $TSFixMe,
  condition: $TSFixMe,
  count: $TSFixMe,
  host_member: $TSFixMe,
  user1: $TSFixMe,
  user2: $TSFixMe,
  fes_data: $TSFixMe
) {
  const guild = await interaction.guild.fetch();
  const mention_id = await searchRoleIdByName(guild, team);
  const team_role = await searchRoleById(guild, mention_id);

  if (mention_id == null) {
    await interaction.editReply({
      content:
        "設定がおかしいでし！\n「お手数ですがサポートセンターまでご連絡お願いします。」でし！",
      ephemeral: false,
    });
    return;
  }

  const reserve_channel = interaction.options.getChannel("使用チャンネル");

  let channel_name = "🔉 VC指定なし";
  if (reserve_channel != null) {
    channel_name = "🔉 " + reserve_channel.name;
  }

  // サーバーメンバーとして取得し直し
  if (user1 != null) {
    user1 = await searchMemberById(guild, user1.id);
  }
  if (user2 != null) {
    user2 = await searchMemberById(guild, user2.id);
  }

  const recruitBuffer = await recruitFesCanvas(
    recruit_num,
    count,
    host_member,
    user1,
    user2,
    team,
    team_role.hexColor,
    condition,
    channel_name
  );
  const recruit = new AttachmentBuilder(recruitBuffer, {
    name: "ikabu_recruit.png",
  });

  const rule = new AttachmentBuilder(await ruleFesCanvas(fes_data), {
    name: "rules.png",
  });

  try {
    const image1_message = await interaction.editReply({
      content: txt,
      files: [recruit],
      ephemeral: false,
    });
    const image2_message = await interaction.channel.send({ files: [rule] });
    const sentMessage = await interaction.channel.send({
      content: `<@&${mention_id}>` + " ボタンを押して参加表明するでし！",
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
      components: [
        recruitDeleteButton(sentMessage, image1_message, image2_message),
      ],
    });
    if (isLock) {
      sentMessage.edit({
        components: [recruitActionRow(image1_message, reserve_channel.id)],
      });
      reserve_channel.permissionOverwrites.set(
        [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.Connect],
          },
          {
            id: host_member.user.id,
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
      sentMessage.edit({ components: [recruitActionRow(image1_message)] });
      await interaction.followUp({
        content:
          "募集完了でし！参加者が来るまで待つでし！\n15秒間は募集を取り消せるでし！",
        ephemeral: true,
      });
    }

    // ピン留め
    image1_message.pin();

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
          host_member.user,
          "UnLock Voice Channel"
        );
      }
      return;
    }

    // 2時間後にボタンを無効化する
    await sleep(7200 - 15);
    const checkMessage = await searchMessageById(
      guild,
      interaction.channel.id,
      sentMessage.id
    );

    if (isEmpty(checkMessage)) {
      return;
    }
    const message_first_row = checkMessage.content.split("\n")[0];
    if (
      message_first_row.indexOf("〆") !== -1 ||
      message_first_row.indexOf("キャンセル") !== -1
    ) {
      return;
    }

    const recruit_data = await RecruitService.getRecruitAllByMessageId(
      checkMessage.id
    );
    const member_list = getMemberMentions(recruit_data);
    const host_mention = `<@${host_member.user.id}>`;

    checkMessage.edit({
      content:
        "`[自動〆]`\n" + `${host_mention}たんの募集は〆！\n${member_list}`,
      components: await setButtonDisable(checkMessage),
    });
    // ピン留め解除
    image1_message.unpin();
    if (isLock) {
      reserve_channel.permissionOverwrites.delete(
        guild.roles.everyone,
        "UnLock Voice Channel"
      );
      reserve_channel.permissionOverwrites.delete(
        host_member.user,
        "UnLock Voice Channel"
      );
    }
  } catch (error) {
    logger.error(error);
  }
}