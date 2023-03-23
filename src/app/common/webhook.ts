import axios from "axios";

export async function sendContentWebhook(url: $TSFixMe, content: $TSFixMe) {
  await axios.post(
    url,
    { content: content } // このオブジェクトがJSONとして送信される
  );
}

export async function sendEmbedsWebhook(url: $TSFixMe, embeds: $TSFixMe) {
  await axios.post(
    url,
    { embeds: embeds } // このオブジェクトがJSONとして送信される
  );
}
