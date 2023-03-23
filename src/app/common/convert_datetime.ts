import { formatInTimeZone } from "date-fns-tz";
import format from "date-fns/format";
import ja from "date-fns/locale/ja";
export const dateformat = {
  ymdwhm: "yyyy/M/d(E) H:mm",
  ymdw: "yyyy/M/d(E)",
  mdwhm: "M/d(E) H:mm",
  hm: "H:mm",
};

export function formatDatetime(datetime: $TSFixMe, formatString: $TSFixMe) {
  let timezone = formatInTimeZone(datetime, "Asia/Tokyo", dateformat.ymdwhm);
  let locale = format(new Date(timezone), formatString, { locale: ja });
  return locale;
}
