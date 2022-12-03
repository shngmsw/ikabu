const format = require('date-fns/format');
const { formatInTimeZone } = require('date-fns-tz');
const ja = require('date-fns/locale/ja');
const dateformat = {
    ymdwhm: 'yyyy/M/d(E) H:mm',
    ymdw: 'yyyy/M/d(E)',
    mdwhm: 'M/d(E) H:mm',
    hm: 'H:mm',
};

module.exports = {
    dateformat: dateformat,
    formatDatetime,
};

function formatDatetime(datetime, formatString) {
    let timezone = formatInTimeZone(datetime, 'Asia/Tokyo', dateformat.ymdwhm);
    let locale = format(new Date(timezone), formatString, { locale: ja });
    return locale;
}
