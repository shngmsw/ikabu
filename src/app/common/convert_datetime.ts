// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const format = require('date-fns/format');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { formatInTimeZone } = require('date-fns-tz');
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const ja = require('date-fns/locale/ja');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dateformat... Remove this comment to see the full error message
const dateformat = {
    ymdwhm: 'yyyy/M/d(E) H:mm',
    ymdw: 'yyyy/M/d(E)',
    mdwhm: 'M/d(E) H:mm',
    hm: 'H:mm',
};

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = {
    dateformat: dateformat,
    formatDatetime,
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'formatDate... Remove this comment to see the full error message
function formatDatetime(datetime: $TSFixMe, formatString: $TSFixMe) {
    let timezone = formatInTimeZone(datetime, 'Asia/Tokyo', dateformat.ymdwhm);
    let locale = format(new Date(timezone), formatString, { locale: ja });
    return locale;
}
