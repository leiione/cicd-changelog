import React from "react"
import { Typography } from "@mui/material"
import Highlighter from "react-highlight-words"
import PropTypes from "prop-types"
import { isEmpty } from "lodash"

const propTypes = {
  value: PropTypes.any,
  filters: PropTypes.object.isRequired
}

const HighlightText = ({ value, filters, cellStyles }) => {
  const searchWords = []
  let text = ""
  if (typeof value !== "undefined" && value !== null) {
    text = value.toString()
  }
  if (filters && !isEmpty(filters.searchValue)) {
    searchWords.push(filters.searchValue)
    text = <Highlighter style={cellStyles} highlightClassName="highlight-text" searchWords={searchWords} textToHighlight={String(text)} autoEscape />
  }

  return <Typography className={`w-100 text-truncate`} style={cellStyles}>{text}</Typography>
}
HighlightText.propTypes = propTypes

export default HighlightText
