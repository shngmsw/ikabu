import { AttachmentBuilder } from "discord.js";
import path from "path";
import { log4js_obj } from "../../../log4js_settings";
const fs = require("fs").promises;

const ENV_FILE_PATH = path.resolve("./", ".env");

const logger = log4js_obj.getLogger("interaction");

export async function setVariables(interaction: $TSFixMe) {
  try {
    const options = interaction.options;
    const key = options.getString("key");
    const value = options.getString("value");

    // .envファイル更新
    await setEnvValue(key, value);

    let env_file = new AttachmentBuilder("./.env", { name: "env.txt" });

    // dotenv更新 (override trueにしないと上書きされない)
    require("dotenv").config({ override: true });

    await interaction.editReply({
      content: "設定したでし！",
      files: [env_file],
    });
  } catch (error) {
    logger.error(error);
  }
}

/**
 * 既存のkeyの値を更新、なければ新しく「key=value」の行を作成
 * @param {string} key 更新または作成するkey
 * @param {string} value 設定する値
 */
async function setEnvValue(key: $TSFixMe, value: $TSFixMe) {
  try {
    const envFile = await fs.readFile(ENV_FILE_PATH, "utf-8");
    const envVars = envFile.split(/\r\n|\n|\r/);
    const targetLine = envVars.find(
      (line: $TSFixMe) => line.split("=")[0] === key
    );
    if (targetLine !== undefined) {
      const targetLineIndex = envVars.indexOf(targetLine);
      // keyとvalueを置き換え
      envVars.splice(targetLineIndex, 1, `${key}=${value}`);
    } else {
      // 新しくkeyとvalueを設定
      envVars.push(`${key}=${value}`);
    }
    envVars.sort();
    // ファイル書き込み
    await fs.writeFile(ENV_FILE_PATH, envVars.join("\n"));
  } catch (error) {
    logger.error(error);
  }
}
