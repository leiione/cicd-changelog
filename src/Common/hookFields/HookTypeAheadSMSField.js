import React from "react";
import { FormControl, FormHelperText } from "@mui/material";
import { Typeahead } from "react-bootstrap-typeahead";
import { Controller } from "react-hook-form";
import { cloneDeep, includes, trim, uniqBy } from "lodash";

// Update the regex to validate phone numbers
const phoneNumberRegex = /^\+?(\d{1,3})?[-. (]?(\d{1,4})[-. )]?(\d{1,4})[-. ]?(\d{1,9})$/;

const HookTypeAheadSMSField = (props) => {
  const {
    name,
    control,
    setValue,
    labelKey = "name",
    phoneInput = true, // Updated for SMS input
    options = [],
    placeholder = "Type a valid phone number...", // Updated placeholder
    onChange: customOnChange,
    disabled,
    errorFieldFreeText = null,
    emptyLabel = "Type valid phone number...", // Updated empty label
  } = props;
  const ref = React.useRef();
  const [allowNew, setAllowNew] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false)

  const handleSelection = (selected) => {
    const uniqPhoneNumbers = uniqBy(selected, labelKey); // Updated variable name
    setValue(name, uniqPhoneNumbers, { shouldValidate: true });
    if (errorFieldFreeText) setValue(errorFieldFreeText, "", true);
    if (customOnChange) {
      customOnChange(name, uniqPhoneNumbers);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value },
        fieldState: { error },
        formState: { isSubmitting },
      }) => (
        <FormControl fullWidth style={{ marginBottom: "2px" }}>
          <Typeahead
            ref={ref}
            id="formik_typeahead"
            open={isFocused}
            labelKey={labelKey}
            className={phoneInput ? "phoneInput typeahead_field" : "typeahead_field"} // Updated class name
            multiple
            options={options}
            newSelectionPrefix="Add phone number: " // Updated prefix
            placeholder={placeholder}
            selected={value}
            allowNew={allowNew}
            onChange={handleSelection}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled || isSubmitting}
            onInputChange={(text, event) => {
              text = trim(text);
              setAllowNew(phoneNumberRegex.test(text)); // Updated validation logic
              if (errorFieldFreeText) {
                setValue(errorFieldFreeText, text, true);
              }
            }}
            onKeyDown={(e) => {
              const selected = cloneDeep(value);
              const text = trim(ref.current.state.text);
              const keyCodes = [9, 13, 188];
              if (phoneNumberRegex.test(text) && includes(keyCodes, e.keyCode)) { // Updated validation logic
                selected.push({ customOption: true, [labelKey]: text });
                handleSelection(selected);
                ref.current.state.text = "";
              }
              if (phoneNumberRegex.test(text) && (e.which === 9 || e.which === 188)) e.preventDefault(); // Updated validation logic
            }}
            {...(emptyLabel && { emptyLabel })}
          />
          {error ? <FormHelperText style={{ color: "red" }}>{error.message}</FormHelperText> : null}
        </FormControl>
      )}
    />
  );
};

export default React.memo(HookTypeAheadSMSField);
