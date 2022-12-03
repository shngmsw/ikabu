const format = require('date-fns/format');
const ja = require('date-fns/locale/ja');

module.exports = {
    dateformat: {
        ymdwhm: 'yyyy/M/d(E) H:mm',
        ymdw: 'yyyy/M/d(E)',
        mdwhm: 'M/d(E) H:mm',
        hm: 'H:mm',
    },
    formatDatetime,
    unixTime2ymdw,
    unixTime2mdwhm,
    unixTime2hm,
};

function formatDatetime(datetime, formatString) {
    return format(new Date(datetime), formatString, { locale: ja });
}

function unixTime2ymdw(datetime) {
    const date = new Date(datetime);
    const d = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC = UTC + 9
    const year = d.getFullYear();
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const dow = d.getUTCDay();
    const week = ['日', '月', '火', '水', '木', '金', '土'][dow];
    return year + '/' + month + '/' + day + ' (' + week + ')';
}

function unixTime2mdwhm(datetime) {
    const date = new Date(datetime);
    const d = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC = UTC + 9
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const hour = d.getUTCHours();
    const min = ('0' + d.getUTCMinutes()).slice(-2);
    const dow = d.getUTCDay();
    const week = ['日', '月', '火', '水', '木', '金', '土'][dow];
    return month + '/' + day + '(' + week + ') ' + hour + ':' + min;
}

function unixTime2hm(datetime) {
    const date = new Date(datetime);
    const d = new Date(date.getTime() + 9 * 60 * 60 * 1000); // UTC = UTC + 9
    const hour = d.getUTCHours();
    const min = ('0' + d.getUTCMinutes()).slice(-2);
    return hour + ':' + min;
}
