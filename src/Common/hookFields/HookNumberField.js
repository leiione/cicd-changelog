import React from "react";
import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import { NumericFormat, PatternFormat } from "react-number-format";
import { stringToNumber } from "common/utils/formatters";
import { isEmpty } from "lodash";

const HookNumberField = (props) => {
  const { name, label, control, required, disabled, customError, ...rest } = props;

  const otherProps = {}
  let NumberFormatComponent = NumericFormat

  if (props.format) {
    NumberFormatComponent = PatternFormat
    otherProps.patternChar = '#'
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value },
        fieldState: { error },
        formState: { isSubmitting }
      }) => (
        <NumberFormatComponent
          variant="standard"
          {...rest}
          label={label}
          value={value}
          customInput={TextField}
          helperText={error ? error.message : null}
          error={!!error || customError}
          onChange={(event) => {
            let newValue = event.target.value
            if (!props.format) {
              newValue = isEmpty(newValue) ? newValue : stringToNumber(newValue)
            }
            onChange(newValue);
          }}
          required={required}
          fullWidth
          disabled={isSubmitting || disabled}
          {...otherProps}
        />
      )}
    />
  )
}

export default HookNumberField