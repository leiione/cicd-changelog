import React, { useState } from "react"
import { deburr, findIndex } from "lodash"
import Autosuggest from "react-autosuggest"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import TextField from "@mui/material/TextField"
import Paper from "@mui/material/Paper"
import MenuItem from "@mui/material/MenuItem"
import InputMask from "react-input-mask"
import { makeStyles } from "@mui/styles"
import { Controller } from "react-hook-form"
import { useSelector } from "react-redux"
import { zipField } from "common/utils/regex"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  container: {
    position: "relative"
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 1,
    left: 0,
    right: 0
  },
  suggestion: {
    display: "block"
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  },
  divider: {
    height: theme.spacing(2)
  },
  bold: {
    paddingLeft: 3,
    color: "red",
    fontWeight: "bolder"
  }
}))

const renderInputComponent = (inputProps) => {
  const {
    inputRef = () => { },
    ref,
    props,
    beforemaskedvaluechange,
    ...other
  } = inputProps
  const {
    name,
    label,
    value,
    isSubmitting,
    error,
    mask,
    required,
  } = props

  return (
    <InputMask
      name={name}
      label={label}
      value={value}
      mask={mask}
      maskChar={null}
      style={{ width: "100%" }}
      beforeMaskedValueChange={beforemaskedvaluechange}
      error={Boolean(error)}
      helperText={error ? error.message : null}
      fullWidth
      variant={"standard"}
      required={required}
      InputProps={{
        inputRef: node => {
          ref(node)
          inputRef(node)
        },
        disabled: isSubmitting
      }}
      {...other}
    >
      {props => {
        return <TextField {...props} />
      }}
    </InputMask>
  )
}

const renderSuggestion = (suggestion, { query, isHighlighted }) => {
  const matches = match(suggestion.label, query)
  const parts = parse(suggestion.label, matches)

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) =>
          part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          )
        )}
      </div>
    </MenuItem>
  )
}

const HookAutoCompleteZipField = props => {
  const zipPostalLength = useSelector(state => state.settingsPreferences.portalsSettings.ispCountrySettings.zip_postal_length)
  const countryCode = useSelector(state => state.settingsPreferences.portalsSettings.ispCountrySettings.country_code)
  const classes = useStyles()
  const [suggestions, setSuggestions] = useState([])
  const {
    control,
    name,
    value: fieldValue,
    options,
    setValue,
    regex
  } = props

  const beforeMaskedValueChange = (newState, oldState, userInput) => {
    let { value } = newState
    let selection = newState.selection
    let cursorPosition = selection ? selection.start : null

    // keep minus if entered by user
    if (
      value.endsWith("-") &&
      userInput !== "-" &&
      !fieldValue.endsWith("-")
    ) {
      if (cursorPosition === value.length) {
        cursorPosition--
        selection = { start: cursorPosition, end: cursorPosition }
      }
      value = value.slice(0, -1)
    }

    return {
      value,
      selection
    }
  }

  const getSuggestions = (value) => {
    const inputValue = deburr(value.trim()).toLowerCase()
    const inputLength = inputValue.length
    let count = 0
    let suggestionList = options ? options : []

    return inputLength === 0
      ? []
      : suggestionList.filter(suggestion => {
        const keep =
          count < 100 &&
          suggestion.label.slice(0, inputLength).toLowerCase() === inputValue

        if (keep) {
          count += 1
        }

        return keep
      })
  }

  const handleSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value))
  }

  const handleSuggestionsClearRequested = () => {
    setSuggestions([])
  }

  const handleChange = newValue => {
    if (regex) {
      if (regex.test(newValue)) {
        setValue(name, newValue)
      }
    } else {
      setValue(name, newValue)
    }
  }

  const index = findIndex(zipField, function (o) {
    return o.country_code === countryCode
  })
  let mask = "*".repeat(zipPostalLength)
  if (index !== -1) {
    mask = zipField[index].mask
  }

  const autosuggestProps = {
    renderInputComponent,
    suggestions: suggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    getSuggestionValue: (x) => x.label,
    renderSuggestion
  }
  return (
    <div className={classes.root}>
      <Controller
        name={name}
        control={control}
        render={({
          field,
          fieldState,
          formState: { isSubmitting }
        }) => (
          <Autosuggest
            {...autosuggestProps}
            inputProps={{
              props: { mask, isSubmitting, ...props, ...field, ...fieldState },
              value: fieldValue,
              onChange: (event, { newValue }) => {
                field.onChange(newValue)
                handleChange(newValue)
              },
              beforemaskedvaluechange: beforeMaskedValueChange
            }}
            theme={{
              container: classes.container,
              suggestionsContainerOpen: classes.suggestionsContainerOpen,
              suggestionsList: classes.suggestionsList,
              suggestion: classes.suggestion
            }}
            renderSuggestionsContainer={options => (
              <Paper
                {...options.containerProps}
                square
                style={{ overflow: "auto", maxHeight: "100px" }}
              >
                {options.children}
              </Paper>
            )}
          />
        )}
      />
    </div>
  )
}

export default React.memo(HookAutoCompleteZipField)
