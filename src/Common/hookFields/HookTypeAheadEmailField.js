import React from "react"
import { FormControl, FormHelperText } from "@mui/material"
import { Typeahead } from "react-bootstrap-typeahead"
import { Controller } from "react-hook-form"
import { cloneDeep, includes, trim, uniqBy } from "lodash"

const emailRegex = /^[^\s@]+@(?!.*[-_.]{2})\w+([.-]?\w+)*(\.\w{1,})+$/

const HookTypeAheadEmailField = props => {
  const {
    name,
    control,
    setValue,
    labelKey = "name",
    emailInput = true,
    options = [],
    placeholder = "",
    onChange: customOnChange,
    disabled,
    errorFieldFreeText = null,
    emptyLabel = "Type valid email address..."
  } = props
  const ref = React.useRef()
  const [allowNew, setAllowNew] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  const handleSelection = selected => {
    const uniqEmail = uniqBy(selected, labelKey)
    setValue(name, uniqEmail, { shouldValidate: true })
    if (errorFieldFreeText) setValue(errorFieldFreeText, "", true)
    if (customOnChange) {
      customOnChange(name, uniqEmail)
    }
  }

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
            className={emailInput ? "emailInput typeahead_field" : "typeahead_field"}
            multiple
            options={options}
            newSelectionPrefix="Add email address: "
            placeholder={placeholder}
            selected={value}
            allowNew={allowNew}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleSelection}
            disabled={disabled || isSubmitting}
            onInputChange={(text, event) => {
              text = trim(text)
              setAllowNew(emailRegex.test(text))
              if (errorFieldFreeText) {
                setValue(errorFieldFreeText, text, true)
              }
            }}
            onKeyDown={e => {
              const selected = cloneDeep(value)
              const text = trim(ref.current.state.text)
              const keyCodes = [9, 13, 188]
              if (emailRegex.test(text) && includes(keyCodes, e.keyCode)) {
                selected.push({ customOption: true, [labelKey]: text })
                handleSelection(selected)
                ref.current.state.text = ""
              }
              if (emailRegex.test(text) && (e.which === 9 || e.which === 188)) e.preventDefault()
            }}
            {...(emptyLabel && { emptyLabel })}
          />
          {error ? <FormHelperText style={{ color: "red" }}>{error.message}</FormHelperText> : null}
        </FormControl>
      )}
    />
  )
}

export default React.memo(HookTypeAheadEmailField)