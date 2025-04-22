import React from "react";
import { Controller } from "react-hook-form";
import { Autocomplete, Chip, TextField } from "@mui/material";

const HookMultiAutoComplete = ({ control, name, options, label }) => {
  return (
     <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value },
        formState: { isSubmitting }
      }) => (
        <Autocomplete
          multiple
          options={options}
          getOptionLabel={(option) => option.label}
          value={value || []}
          onChange={(_, newValue) => {
            // Allow removal of any option, including the last one
            onChange(newValue);
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option.appuser_id} label={option.realname || option.label} {...getTagProps({ index })} />
            ))
          }
          renderOption={(props, option) => (
            <li {...props} style={{
              backgroundColor: (value || []).some(item => item.value === option.value) ? '#e3f2fd' : 'inherit'
            }}>
              {option.label}
            </li>
          )}
          renderInput={(params) => <TextField {...params} label={label} variant="standard" disabled={isSubmitting} />}
        />
      )}
    />
  )
}

export default HookMultiAutoComplete