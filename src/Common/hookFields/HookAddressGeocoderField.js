import React, { useState } from "react"
import { useSelector } from 'react-redux'
import { Typography, InputLabel, FormHelperText } from "@mui/material"
import { get, isEmpty, split } from "lodash"
import { bingGeocodeAddress, bingSearchByAddress, bingSearchByCoordinates } from "common/utils/bingGeosearch";
import { geocodeAddress, parseCoordinates, searchByAddress, searchByCoordinates } from "common/utils/googleGeosearch";
import debounce from "debounce-promise";
import AsyncSelect from "react-select/async"
import { Controller } from "react-hook-form";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";
import { useApolloClient } from "@apollo/client";

const ITEM_HEIGHT = 65
const selectStyles = (error = false) => ({
  container: () => ({
    width: "100%",
    position: "relative"
  }),
  control: () => ({
    display: "flex",
    alignItems: "center",
    borderBottom: error ? "1px solid #EB5757" : "1px solid gray",
    height: 27,
    background: "transparent",
    "&:hover": {
      boxShadow: "none"
    }
  }),
  menu: () => ({
    backgroundColor: "white",
    boxShadow: "1px 2px 6px #888888", // should be changed as material-ui
    position: "absolute",
    left: 0,
    top: `calc(100% + 1px)`,
    width: "100%",
    zIndex: 2,
    maxHeight: ITEM_HEIGHT * 4.5
  }),
  menuList: () => ({
    overflowY: "auto",
    maxHeight: ITEM_HEIGHT * 4.5
  }),
  indicatorSeparator: () => ({
    visibility: "hidden"
  }),
  dropdownIndicator: () => ({
    visibility: "hidden"
  }),
  singleValue: () => ({
    marginLeft: "-5px",
    width: "100%"
  }),
  placeholder: base => ({
    ...base,
    marginLeft: "-5px",
    marginBottom: "-18px"
  }),
  input: () => ({
    marginLeft: "-5px"
  })
})

const useStyles = makeStyles(theme => ({
  bold: {
    paddingLeft: 3,
    fontWeight: "bolder"
  },
}));

let hasClickedAddress = false

const formatOptionLabel = (option, selected) => {
  if (selected === "") {
    return <Typography variant="subtitle1" style={{ color: "#808080" }}>{"Search address or coordinates..."}</Typography>
  }
  return <Typography variant="subtitle1">{option.label}</Typography>
}

const HookAddressGeocoderField = props => {
  const isp_id = useSelector(state => state.ispId)
  const location_bias = useSelector(state => get(state.settingsPreferences.applicationSettings, "equipment.isp_settings.location_bias"))
  const radius_bias = useSelector(state => get(state.settingsPreferences.applicationSettings, "equipment.isp_settings.radius_bias"))
  const bingProvider = useSelector(state => get(state, "bingProvider"))
  const googleProvider = useSelector(state => get(state, "googleProvider"))
  const addressLookUpAPI = useSelector(state => get(state.settingsPreferences.applicationSettings, "equipment.isp_settings.address_lookup_api"))
  const isBing = addressLookUpAPI === 'bing'
  const client = useApolloClient()

  const classes = useStyles();
  const [isFocused, setIsFocused] = useState(false)
  const [hasChanges, setChanges] = useState(false)
  const {
    control,
    setValue,
    name,
    label,
    populateCity,
    populateState,
    populateZip,
    endAdornment,
    fieldValue,
    regex,
    getFieldState,
    required,
    disabled
  } = props

  const { isTouched, error } = getFieldState(name)

  const searchAddresses = React.useCallback((inputValue) => {
    return new Promise((resolve) => {
      const coordinates = parseCoordinates(inputValue)
      if (coordinates.length === 2) {
        if (isBing) {
          bingSearchByCoordinates({ coordinates, isp_id, client })
            .then((results) => {
              resolve(results)
            })
        } else {
          searchByCoordinates(coordinates.join(","), googleProvider)
            .then((results) => {
              resolve(results)
            })
        }
      } else {
        if (isBing) {
          bingSearchByAddress(inputValue, location_bias, bingProvider)
            .then((results) => {
              resolve(results)
            })
        } else {
          searchByAddress(inputValue, location_bias, radius_bias)
            .then((results) => {
              resolve(results)
            })
        }
      }
    });
  }, [location_bias, radius_bias, isBing, client, isp_id, bingProvider, googleProvider])

  const handleOnBlur = React.useCallback(async () => {
    if (!hasClickedAddress && !isEmpty(fieldValue) && isTouched) {
      try {
        let address = {}
        const coordinates = parseCoordinates(fieldValue)
        if (coordinates.length === 2) {
          address.y = coordinates[0]
          address.x = coordinates[1]
        } else {
          const suggestions = await searchAddresses(fieldValue)
          if (suggestions.length > 0) {
            let suggestedAddress = suggestions[0]
            if (suggestedAddress.type === "address-geosearch") {
              if (isBing) {
                await bingGeocodeAddress(suggestedAddress, null, bingProvider)
                  .then(itemResult => {
                    address = itemResult
                  })
              } else {
                await geocodeAddress(suggestedAddress)
                  .then(itemResult => {
                    address = itemResult
                  })
              }
            }
          }
        }
      } catch (e) {
        console.log("Cannot find Address")
      }
    }
    if (hasClickedAddress) {
      hasClickedAddress = false
    }
    setIsFocused(false)
  }, [isTouched, fieldValue, searchAddresses, isBing, bingProvider])

  const handleChange = React.useCallback((value, { action }) => {
    setChanges(true)
    if (action === 'input-change') {
      if (regex) {
        if (regex.test(value) || value === "") {
          setValue(name, value, { shouldValidate: true })
        }
      } else {
        setValue(name, value, { shouldValidate: true })
      }
      return value;
    }
    return fieldValue;
  }, [setValue, name, regex, fieldValue]);

  const handleSelect = React.useCallback(async (item) => {
    setChanges(false)
    let address = {}
    hasClickedAddress = true
    if (item.type === "coordinates-geosearch") {
      address = item
      const coordinates = parseCoordinates(fieldValue)
      if (coordinates.length === 2) {
        address.y = coordinates[0]
        address.x = coordinates[1]
      }
    } else {
      if (isBing) {
        await bingGeocodeAddress(item, null, bingProvider)
          .then(itemResult => {
            address = itemResult
          })
      } else {
        await geocodeAddress(item)
          .then(itemResult => {
            address = itemResult
          })
      }
    }

    let addressInfo = {}
    const addressArray = split(address.label, ",")

    const { address_components } = address.raw
    address_components.forEach((data, index) => {
      const matchAddress = data.types[0]
      if (matchAddress === "street_number" || matchAddress === "premise") {
        addressInfo["address_1"] = data.long_name
      }
      if (matchAddress === "neighborhood" || matchAddress === "political") {
        addressInfo["address_2"] = addressInfo["address_2"] ? addressInfo["address_2"] + " " + data.long_name : data.long_name
      }
      if (matchAddress === "route") {
        let address1 = !addressInfo["address_1"] ? "" : addressInfo["address_1"]
        addressInfo["address_1"] = address1 + " " + data.long_name
      }
      if (matchAddress === "locality") {
        addressInfo["city"] = data.long_name
      }
      if (matchAddress === "administrative_area_level_1") {
        addressInfo["state"] = data.short_name
      }
      if (matchAddress === "postal_code") {
        addressInfo["zip"] = data.long_name.replace(/\W/g, '')
      }
    })

    let state = addressInfo["state"]
    await setValue(name, addressInfo.address_1 || addressArray[0], { shouldValidate: true })
    await setValue(populateCity, addressInfo.city || "", { shouldValidate: true })
    await setValue(populateState, state, { shouldValidate: true })
    await setValue(populateZip, addressInfo.zip || "", { shouldValidate: true })

  }, [name, fieldValue, populateCity, populateState, populateZip, setValue, isBing, bingProvider])

  const loadAddressOptions = debounce(searchAddresses, 200, { leading: false });

  const onKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      // setIsFocused(false)
      searchAddresses(fieldValue)
        .then((locations) => {
          if (locations.length > 0) {
            handleSelect(locations[0], '')
          }
        })
    }
  }

  let newLabel = label
  if (required) {
    newLabel = (
      <React.Fragment>
        <span className={classNames({ "text-danger": error })} >
          {label} <span className={classes.bold}>*</span>
        </span>
      </React.Fragment>
    )
  }

  const showOptions = isFocused && !isEmpty(fieldValue) && hasChanges
  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({
          field: { value },
          fieldState: { error },
          formState: { isSubmitting }
        }) => {
          return (
            <>
              <InputLabel style={{ marginBottom: "-2px" }} shrink>{newLabel}</InputLabel>
              <div style={{ display: "flex" }}>
                <AsyncSelect
                  name={name}
                  value={value}
                  inputValue={value}
                  loadOptions={inputValue => loadAddressOptions(inputValue)}
                  onChange={handleSelect}
                  onFocus={() => setIsFocused(true)}
                  onClick={() => setIsFocused(true)}
                  onBlur={handleOnBlur}
                  onKeyDown={onKeyDown}
                  onInputChange={handleChange}
                  formatOptionLabel={data => formatOptionLabel(data, value)}
                  styles={selectStyles(Boolean(error))}
                  blurInputOnSelect={false}
                  closeMenuOnSelect={false}
                  placeholder={"Search address or coordinates..."}
                  disabled={disabled || isSubmitting}
                  menuIsOpen={showOptions}
                />
                {endAdornment}
              </div>
              {Boolean(error) && <FormHelperText className="text-danger">{error.message}</FormHelperText>}
            </>
          )
        }}
      />
    </>
  )
}

export default React.memo(HookAddressGeocoderField)