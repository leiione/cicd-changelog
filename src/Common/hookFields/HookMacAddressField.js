import React from "react"
import { TextField } from "@mui/material"
import { Controller } from "react-hook-form";
import InputMask from "react-input-mask"
import { toUpper } from "lodash";

const HookMacAddressField = props => {
  const {
    label,
    name,
    control,
    required,
    onChange: customChange,
    fieldFocusProps
  } = props

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({
        field: { onChange, ref, ...field },
        fieldState: { error },
        formState: { isSubmitting }
      }) => (
        <InputMask
          {...field}
          onFocus={() => { }}
          formatChars={{ "*": "[A-Fa-f0-9•]" }}
          mask="**:**:**:**:**:**"
          maskChar=""
          onChange={(event) => {
            onChange(toUpper(event.target.value))
            if (customChange) {
              customChange(name, toUpper(event.target.value))
            }
          }}
          disabled={isSubmitting}
          {...fieldFocusProps}
        >
          {
            inputProps => (
              <TextField
                ref={ref}
                label={label}
                variant="standard"
                type="text"
                fullWidth
                error={!!error}
                helperText={error ? error.message : null}
                required={required}
                disabled={isSubmitting}
                {...inputProps}
              />
            )
          }
        </InputMask>
      )}
    />
  )
}

export default HookMacAddressField