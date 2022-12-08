module.exports = {
    sendContentWebhook: sendContentWebhook,
    sendEmbedsWebhook: sendEmbedsWebhook,
};

const axios = require('axios');

async function sendContentWebhook(url, content) {
    await axios.post(
        url,
        { content: content }, // このオブジェクトがJSONとして送信される
    );
}

async function sendEmbedsWebhook(url, embeds) {
    await axios.post(
        url,
        { embeds: embeds }, // このオブジェクトがJSONとして送信される
    );
}
