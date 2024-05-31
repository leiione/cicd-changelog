import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { Controller } from 'react-hook-form';

const HookCheckbox = (props) => {
  const { name, label, control, disabled = false, style, value: fieldValue = undefined, onChange: customChange, ...rest } = props
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={false}
      render={({
        field: { value, onChange },
        formState: { isSubmitting }
      }) => (
        <FormControlLabel
          label={label || ''}
          control={
            <Checkbox
              {...rest}
              name={name}
              checked={fieldValue !== undefined ? fieldValue : value}
              onChange={(e) => {
                if (customChange) {
                  customChange(name, e.target.checked)
                } else {
                  onChange(e.target.checked)
                }
              }}
              value={(value ? 'true' : 'false')}
              disabled={isSubmitting || disabled}
              style={style}
            />
          }
        />
      )}
    />
  );
};

export default HookCheckbox;
