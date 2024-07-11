import { get } from "lodash";

export const getFormattedAddress = (address, prefix = null) => {
  const addComma = (value) => {
    return value && value !== "" ? `${value}, ` : ''
  }

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
