import React from "react";
import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import moment from "moment-timezone";

const HookTextField = (props) => {
  const {
    name,
    label,
    control,
    required,
    onChange: customOnChange,
    disabled,
    ...rest
  } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value },
        fieldState: { error },
        formState: { isSubmitting },
      }) => (
        <TextField
          {...rest}
          variant="standard"
          helperText={error ? error.message : null}
          value={value}
          label={label}
          error={!!error}
          onChange={({ target: { value } }) => {
            if (rest.type === "date") {
              if (moment(value).isBefore("9999-12-31")) {
                onChange(value);
              } else if (!moment(value).isValid()) {
                onChange("");
              }
              if (customOnChange) {
                customOnChange(name, value);
              }
            } else {
              onChange(value);
              if (customOnChange) {
                customOnChange(name, value);
              }
            }
          }}
          fullWidth
          disabled={isSubmitting || disabled}
          required={required}
        />
      )}
    />
  );
};

export default HookTextField;
