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
};

function formatDatetime(datetime, formatString) {
    return format(new Date(datetime), formatString, { locale: ja });
}
