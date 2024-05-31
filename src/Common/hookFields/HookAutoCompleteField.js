import React, { Fragment } from "react"
import { Autocomplete, ListItemButton, ListItemText, TextField, createFilterOptions } from "@mui/material"
import { find, includes, isEqual, isNil, toLower } from "lodash"
import { Controller } from "react-hook-form"

const HookAutoCompleteField = props => {
  const {
    name,
    label,
    control,
    options,
    onChange: customOnChange,
    disableClearable,
    required,
    disabled,
    optionLimit = 0,
    overrideOnChange,
    variant = "standard",
    customError,
  } = props

  const getOptionLabel = React.useCallback(option => {
    let findOption = find(options, { value: option })
    if (!findOption) {
      findOption = find(options, { value: option.value })
    }
    if (findOption) {
      return findOption.label;
    }
    return ""
  }, [options])

  const renderOption = React.useCallback((props, option) => {
    let empty = option.label === '' ? { height: 30 } : {}

    return (
      <Fragment key={option.value}>
        <ListItemButton value={option.value} key={option.value} {...option} {...props} style={{ padding: "4px 8px", ...option.style, ...empty }}>
          <ListItemText primary={<span style={option.labelStyle}>{option.label}</span>} />
        </ListItemButton>
      </Fragment>
    )
  }, [])

  const handleIsOptionEqualToValue = React.useCallback((option, value) => {
    if (typeof option === "string") {
      return option === value
    } else if (option && typeof option === "object") {
      if (typeof value === "object") {
        return isEqual(option, value)
      } else if (!isNil(option.value)) {
        return option.value === value
      } else if (option.label) {
        return option.label === value || value === 0
      }
    }
    return true;
  }, [])

  let otherProps = {}
  if (optionLimit > 0) {
    otherProps = {
      ...otherProps,
      filterOptions: createFilterOptions({
        limit: optionLimit
      })
    }
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
        <Autocomplete
          size="small"
          value={value}
          options={options}
          getOptionLabel={getOptionLabel}
          renderOption={renderOption}
          isOptionEqualToValue={handleIsOptionEqualToValue}
          onChange={(e, option) => {
            const newValue = option ? option.value : (includes(toLower(name), 'state') ? '' : 0)
            if (!overrideOnChange) {
              onChange(newValue);
              if (customOnChange) {
                customOnChange(name, newValue);
              }
            } else if (customOnChange) {
              customOnChange(name, newValue, onChange);
            }
          }}
          disableClearable={disableClearable || !value}
          sx={{
            "& .MuiInputBase-root": { paddingTop: "0px !important", paddingBottom: "0px !important" },
            "& .MuiInputBase-input": { height: "17px !important" },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant={variant}
              label={label}
              error={!!error || customError}
              helperText={error ? error.message : null}
              required={required}
              fullWidth
            />
          )}
          disabled={isSubmitting || disabled}
          {...otherProps}
        />
      )}
    />
  )
}

export default React.memo(HookAutoCompleteField)