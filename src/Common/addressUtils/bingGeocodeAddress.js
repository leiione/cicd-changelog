import {  get, forOwn, omit, isEmpty, cloneDeep } from "lodash";
import { BingProvider } from 'leaflet-geosearch';
import store from "config/store";
import states from 'us-state-converter';



export const parseAddressComponents = (address) => {
    const state = get(address, 'adminDistrict', '');
    const isStateAbrv = state.length === 2;
  
    // components with different value for long_name and short_name
    const addressComponents = [
      {
        long_name: isStateAbrv ? states.fullName(state) : state,
        short_name: isStateAbrv ? state : states.abbr(state),
        types: ['administrative_area_level_1'],
      },
      {
        long_name: get(address, 'countryRegion', ''),
        short_name: get(address, 'countryRegionIso2', ''),
        types: ['country'],
      },
    ];
  
    // components with similar value for long_name and short_name
    forOwn(omit(address, ['formattedAddress', 'adminDistrict', 'countryRegion', 'countryRegionIso2']), (value, key) => {
      const obj = { long_name: value, short_name: value };
      switch (key) {
        case 'locality': // city
          addressComponents.push({ ...obj, types: ['locality'] });
          break;
        case 'postalCode': // zip
          addressComponents.push({ ...obj, types: ['postal_code'] });
          break;
        case 'addressLine': // street
          addressComponents.push({ ...obj, types: ['premise'] });
          break;
        default:
          break;
      }
    });
  
    return addressComponents
  }
  


export const bingGeocodeAddress = (addressItem, customVar) => {
    return new Promise(async (resolve) => {
      let clonedAddressItem = cloneDeep(addressItem)
      const x = get(addressItem, 'x', '')
      const y = get(addressItem, 'y', '')
  
      if (isEmpty(x) || isEmpty(y)) {
        const commonVars = ['label', 'address']
        let accessedProp = customVar
  
        if (!accessedProp) {
          commonVars.forEach(propName => {
            const val = get(addressItem, propName, null)
            if (val) {
              accessedProp = propName
            }
          })
        }
  
        const state = store.getState()
        const bingAPIKey = get(state.settingsPreferences.applicationSettings, "equipment.isp_settings.bing_api_key")
  
        const bingProvider = new BingProvider({
          params: {
            key: !isEmpty(bingAPIKey) ? bingAPIKey : "AhUJA21E8fj3WqxLnIigxGXTr3KQlBMiHPk6hfpIVRegP73ytlUs0FcYIThubL-3",
            include: 'ciso2', // include 2 letter country code
          },
        });
  
        const result = await bingProvider.search({ query: get(addressItem, accessedProp, '') });
        if (result) {
          clonedAddressItem = {
            id: 0,
            value: get(result[0], 'raw.address.formattedAddress', ''),
            label: get(result[0], 'raw.address.formattedAddress', ''),
            type: 'address-geosearch',
            ...result[0] // x and y coordinates added automatically by bing provider
          }
        }
      }
  
      const address = get(clonedAddressItem, 'raw.address', null)
      const formattedAddress = get(clonedAddressItem, 'raw.address.formattedAddress', '')
      clonedAddressItem.raw.formatted_address = formattedAddress
      clonedAddressItem.raw.place_id = 0 // accessed somewhere using google api
      
      if (address) {
        clonedAddressItem.raw.address_components = parseAddressComponents(address);
      }
  
      resolve({ ...clonedAddressItem })
    })
  }
  