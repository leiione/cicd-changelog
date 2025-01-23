import { replace, toLower, includes, toUpper } from "lodash";
import moment from "moment-timezone";

const phoneRules = (countryCode) => {
  switch (countryCode) {
    // TODO: list other cases
    case "GB":
      return {
        regex: /^\(\d{3}\)\s\d{4}-\d{4}$/,
        format: "(###) ####-####",
        textFormat: /(\d{3})(\d{4})(\d{4})/,
        group: "($1) $2-$3"
      };
    default:
      return {
        regex: /^\(\d{3}\)\s\d{3}-\d{4}$/,
        format: "(###) ###-####",
        textFormat: /(\d{3})(\d{3})(\d{4})/,
        group: "($1) $2-$3"
      };
  }
};

export const stringToNumber = value => {
  let number = String(value).replace(/,/g, "")
  return Number(number) || 0
}

export function removeMaskPhone(value) {
  return replace(value, /[-()\s]/g, "");
}

const addComma = (value) => {
  return value && value !== "" ? `${value}, ` : ''
}

export const getFormattedAddress = (address) => {
  const fullAddress = `${addComma(address.street)}${addComma(address.suffix)}${addComma(address.city)}${addComma(address.state)}${address.zip}`
  return fullAddress
}

export const getExtensionFromFilename = filename => {
  try {
    return filename
      .split(".")
      .pop()
      .toLowerCase()
  } catch (e) {
    return ""
  }
}

export const formatDataValues = (key, value) => {
  const field = toLower(key)
  let formattedValue = value
  if (includes(field, 'mac')) {
    formattedValue = macAddressformat(value)
  }
  return formattedValue
}

export const formatDateTime = (datetime, ispTimeZone, withSec = true, flag_twenty_four_hour_format = false, show_date_on_year = false) => {
  const isDateValid = moment(datetime, ["MM-DD-YYYY", "YYYY-MM-DD"]).isValid()
  if (isDateValid) {
    let format = ''
    const currentYear = new Date().getFullYear()
    const clientTimezone = moment.tz.guess(new Date())
    const momentYear = moment(datetime).tz(clientTimezone).year()
    format = `MMM DD${String(momentYear) === String(currentYear) && !show_date_on_year ? ' ' : ', YYYY '}${flag_twenty_four_hour_format ? 'HH' : 'hh'}:mm${withSec ? ':ss' : ''} A`
    return moment.tz(datetime, ispTimeZone).format(format)
  }
  return null
}

export const dateFormat = (date, ispTimeZone) => {
  const isDateValid = moment(date, ["MM-DD-YYYY", "YYYY-MM-DD"]).isValid()
  if (isDateValid) {
    return moment.tz(date, ispTimeZone).format("MMM DD, YYYY")
  }
  return null
}

export function formatPhoneNumber(phone, countryCode = "US") {
  // normalize string and remove all unnecessary characters
  if (phone) {
    phone = phone.replace(/[^\d]/g, "")
    const rule = phoneRules(countryCode);
    return phone.replace(rule.textFormat, rule.group)
  }
  return ""
}

export const macAddressformat = mac => {
  mac = String(mac)
  if (mac) {
    if (mac.length < 12) {
      return ""
    }
    const formatedMac = mac.replace(/(\w{2})(\w{2})(\w{2})(\w{2})(\w{2})(\w{2})/, "$1:$2:$3:$4:$5:$6")
    return toUpper(formatedMac)
  }
  return null
}