import React from "react"
import {
  IconButton,
  InputAdornment,
  TextField
} from "@mui/material"
import { debounce } from "lodash"
import { Close } from "@mui/icons-material"

const SearchField = props => {
  const {
    searchVal,
    setSearchVal,
    setShowSearch
  } = props

  const onSearch = e => {
    const { value } = e.target
    setSearchVal({
      searchText: value,
      searchValue: value,
    })
  }

  const closeSearch = () => {
    setShowSearch(false);
    setSearchVal({
      searchText: "",
      searchValue: "",
    })
  }

  const keyPress = debounce(event => {
    onSearch(event)
  }, 500)

  const onSearchChange = e => {
    const { value } = e.target
    setSearchVal({
      ...searchVal,
      searchText: value,
    })
    keyPress(e)
  }

  return (
    <TextField
      InputLabelProps={{ shrink: false }}
      label=""
      value={searchVal.searchText}
      onChange={onSearchChange}
      onKeyDown={keyPress}
      variant="outlined"
      placeholder="Search"
      onMouseDown={e => e.stopPropagation()}
      autoFocus
      InputProps={{
        endAdornment: (
          <InputAdornment style={{ marginRight: "-20px" }} position="end">
            <IconButton onClick={closeSearch} size="large">
              <Close style={{ fontSize: "13px" }} />
            </IconButton>
          </InputAdornment>
        ),
        inputProps: { style: { padding: 5 } }
      }}
    />
  )
}

export default SearchField