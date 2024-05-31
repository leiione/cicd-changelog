import React from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { Controller } from 'react-hook-form';

const HookSwitch = (props) => {
  const { name, label, control, disabled = false, style, onChange: customChange, className = '', ...rest } = props
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
          className={className}
          label={label || ''}
          control={
            <Switch
              name={name}
              checked={value}
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
              {...rest}
            />
          }
        />
      )}
    />
  );
};

export default HookSwitch;
