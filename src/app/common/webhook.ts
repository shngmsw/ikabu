// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    sendContentWebhook: sendContentWebhook,
    sendEmbedsWebhook: sendEmbedsWebhook,
};

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const axios = require('axios');

async function sendContentWebhook(url: $TSFixMe, content: $TSFixMe) {
    await axios.post(
        url,
        { content: content }, // このオブジェクトがJSONとして送信される
    );
}

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sendEmbeds... Remove this comment to see the full error message
async function sendEmbedsWebhook(url: $TSFixMe, embeds: $TSFixMe) {
    await axios.post(
        url,
        { embeds: embeds }, // このオブジェクトがJSONとして送信される
    );
}
