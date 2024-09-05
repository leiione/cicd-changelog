import React from "react";
import { FormControl, FormHelperText } from "@mui/material";
import { Typeahead } from "react-bootstrap-typeahead";
import { Controller } from "react-hook-form";
import { cloneDeep, includes, uniqBy } from "lodash";

const phoneNumberRegex = /^\d{10}$/;

const HookTypeAheadSMSField = (props) => {
  const {
    name,
    control,
    setValue,
    labelKey = "name",
    phoneInput = true,
    options = [],
    placeholder = "Type a valid phone number...",
    onChange: customOnChange,
    disabled,
    errorFieldFreeText = null,
    emptyLabel = "Type valid phone number...",
  } = props;
  const ref = React.useRef();
  const [allowNew, setAllowNew] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleSelection = (selected) => {
    const uniqPhoneNumbers = uniqBy(selected, labelKey);
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
            className={phoneInput ? "phoneInput typeahead_field" : "typeahead_field"}
            multiple
            options={options}
            newSelectionPrefix="Add phone number: "
            placeholder={placeholder}
            selected={value}
            allowNew={allowNew}
            onChange={handleSelection}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled || isSubmitting}
            onInputChange={(text, event) => {
              text = text.replace(/[^\d]/g, ''); // Allow only numbers
              if (text.length > 10) {
                text = text.slice(0, 10); // Limit to 10 digits
              }
              setAllowNew(phoneNumberRegex.test(text)); // Validate length
              if (errorFieldFreeText) {
                setValue(errorFieldFreeText, text, true);
              }
              ref.current.setState({ text }); // Update the input value
            }}
            onKeyDown={(e) => {
              const selected = cloneDeep(value);
              const text = ref.current.state.text.replace(/[^\d]/g, ''); // Allow only numbers
              const keyCodes = [9, 13, 188];
              if (phoneNumberRegex.test(text) && includes(keyCodes, e.keyCode)) {
                selected.push({ customOption: true, [labelKey]: text });
                handleSelection(selected);
                ref.current.setState({ text: "" });
              }
              if (phoneNumberRegex.test(text) && (e.which === 9 || e.which === 188)) e.preventDefault();
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