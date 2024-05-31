import React from 'react';
import { Controller } from 'react-hook-form';
import { FormControl, FormLabel, RadioGroup } from '@mui/material';

const HookRadioGroup = (props) => {
  const {
    control,
    label,
    name,
    children,
    ...rest
  } = props

  return (
    <FormControl component="fieldset" >
      <FormLabel component="legend">{label}</FormLabel>
      <Controller
        rules={{ required: true }}
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup {...field} {...rest}>
            {children}
          </RadioGroup>
        )}
      />
    </FormControl >
  )
};

export default HookRadioGroup;
