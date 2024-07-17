import { get } from "lodash";

const addComma = (value) => {
  return value && value !== "" ? `${value}, ` : ''
}


export const phoneRules = (countryCode) => {
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

export const getFormattedAddress = (address, prefix = null) => {
  let fullAddress = '';
  if (prefix) {
    const address1 = (get(address, `${prefix}_address1`, '') || '').trim();
    const address2 = (get(address, `${prefix}_address2`, '') || '').trim();
    const city = (get(address, `${prefix}_city`, '') || '').trim();
    const state = (get(address, `${prefix}_state`, '') || '').trim();
    const zip = (get(address, `${prefix}_zip`, '') || '').trim();
    fullAddress = `${addComma(address1)}${addComma(address2)}${addComma(city)}${addComma(state)}${zip}`
  } else {
    fullAddress = `${addComma(address.address1)}${addComma(address.address2)}${addComma(address.city)}${addComma(address.state)}${address.zip}`
  }
  return fullAddress
}

export const getFormattedPGAddress = (address) => {
  const fullAddress = `${addComma(address.street)}${addComma(address.suffix)}${addComma(address.city)}${addComma(address.state)}${address.zip}`
  return fullAddress
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