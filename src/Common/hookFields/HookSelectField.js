import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Select } from '@mui/material';
import withStyles from '@mui/styles/withStyles';


const arrowGenerator = color => {
    return {
      '&[x-placement*="bottom"] $arrow': {
        top: 0,
        left: 0,
        marginTop: "-0.95em",
        width: "3em",
        height: "1em",
        "&::before": {
          borderWidth: "0 1em 1em 1em",
          borderColor: `transparent transparent ${color} transparent`
        }
      },
      '&[x-placement*="top"] $arrow': {
        bottom: 0,
        left: 0,
        marginBottom: "-0.95em",
        width: "3em",
        height: "1em",
        "&::before": {
          borderWidth: "1em 1em 0 1em",
          borderColor: `${color} transparent transparent transparent`
        }
      },
      '&[x-placement*="right"] $arrow': {
        left: 0,
        marginLeft: "-0.95em",
        height: "3em",
        width: "1em",
        "&::before": {
          borderWidth: "1em 1em 1em 0",
          borderColor: `transparent ${color} transparent transparent`
        }
      },
      '&[x-placement*="left"] $arrow': {
        right: 0,
        marginRight: "-0.95em",
        height: "3em",
        width: "1em",
        "&::before": {
          borderWidth: "1em 0 1em 1em",
          borderColor: `transparent transparent transparent ${color}`
        }
      }
    }
  }

  const styles = theme => ({
    tooltip: {
      backgroundColor: "#d32f2f",
      color: "#fff"
    },
    // Despite the name, this is for FormHelperText. A different key gives a
    // warning for some reason I assume is a bug.
    arrowPopper: arrowGenerator(theme.palette.grey[700]),
    arrow: {
      position: "absolute",
      fontSize: 6,
      width: "3em",
      height: "3em",
      "&::before": {
        content: '""',
        margin: "auto",
        display: "block",
        width: 0,
        height: 0,
        borderStyle: "solid"
      }
    }
  })

const HookSelectField = (props) => {
  const {
    name,
    isSubmitting,
    disabled,
    children,
    hidden,
    displayEmpty,
    required,
    label
  } = props;

  const { control} = useForm();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field: { onChange, value } }) => (
        <Select
          value={value} 
          disabled={isSubmitting || disabled}
          hidden={hidden}
          onChange={onChange}
          label={label}
          displayEmpty={displayEmpty}
          required={required}
          fullWidth
          variant="standard"
        >
          {children}
        </Select>
      )}
    />
  );
};

export default withStyles(styles)(HookSelectField)
