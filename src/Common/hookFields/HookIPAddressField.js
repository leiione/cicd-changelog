import React from "react";
import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import { get, includes, isEmpty } from "lodash";
import { ip } from "common/utils/regex";

const HookIPAddressField = (props) => {
  const {
    name,
    label,
    control,
    required,
    afterOnChange,
    hasSubnet = false,
    values,
    value: fieldValue,
    disabled,
    ...rest
  } = props

  const handleChange = (event, onChange) => {
    const { value } = event.target
    let ip_address = []
    let valueArr = value.toString().split(".")
    const { inputType } = event.nativeEvent
    if (inputType !== "deleteContentBackward") {
      if (valueArr[valueArr.length - 1]) {
        if (valueArr[valueArr.length - 1].trim().length === 3 && valueArr.length !== 4) {
          const appendDot = valueArr.join(".")
          valueArr = `${appendDot}.`
          valueArr = valueArr.toString().split(".")
        }
        if (hasSubnet && valueArr[valueArr.length - 1].trim().length === 3 && valueArr.length === 4) {
          valueArr = valueArr.join(".")
          if (!includes(valueArr, "/")) {
            valueArr = `${valueArr}/`
          }
          valueArr = valueArr.toString().split(".")
        }
      }
    }

    let isValid = true
    let countEmpty = 0
    let count = 0
    if (valueArr.length <= 4) {
      for (const value of valueArr) {
        count++
        if (!isEmpty(value)) {
          if (count === 4 && hasSubnet && includes(value, "/")) {
            const countSlash = value.match(/\//g).length
            if (countSlash > 1) {
              isValid = false
              break
            }
            const n = value.split("/")
            const subnet = n[1]
            const val = n[0]
            const valNum = Number(val)
            if (valNum >= 0 && valNum <= 255 && val.trim().length <= 3 && val.trim().length > 0) {
              isValid = true
            } else {
              isValid = false
              break
            }
            if (subnet) {
              const subnetNum = Number(subnet)
              if (subnetNum >= 0 && subnetNum <= 32 && subnet.trim().length <= 2 && subnet.trim().length > 0) {
                isValid = true
              } else {
                isValid = false
                break
              }
            }
          } else {
            const valueNumber = Number(value)
            if (valueNumber >= 0 && valueNumber <= 255 && value.trim().length <= 3 && value.trim().length > 0) {
              isValid = true
            } else {
              isValid = false
              break
            }
          }
        } else {
          countEmpty++
          if (countEmpty > 1) {
            isValid = false
            countEmpty = 0
            break
          }
        }
      }
    } else {
      isValid = false
    }
    ip_address = isValid ? valueArr.join(".") : (get(values, name) || fieldValue || '')
    if (isValid || ip.test(ip_address)) {
      onChange(ip_address)
      if (afterOnChange) {
        afterOnChange(name, ip_address)
      }
    } else if (ip_address === "") {
      onChange(ip_address)
    }
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { value, onChange },
        fieldState: { error },
        formState: { isSubmitting } }) => (
        <TextField
          {...rest}
          variant="standard"
          value={value}
          label={label}
          onChange={(event) => {
            handleChange(event, onChange)
          }}
          fullWidth
          required={required}
          error={!!error}
          helperText={error ? error.message : null}
          disabled={isSubmitting || disabled}
        />
      )}
    />
  )
}

export default HookIPAddressField