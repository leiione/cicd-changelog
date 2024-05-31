import React from "react"
import PropTypes from "prop-types"
import CircularProgress from "@mui/material/CircularProgress"
import Button from "@mui/material/Button"
import makeStyles from '@mui/styles/makeStyles';
import { green } from '@mui/material/colors';

const useStyles = makeStyles(() => ({
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "calc(50% - 7px)",
    left: "calc(50% - 7px)"
  }
}))

const propTypes = {
  isSubmitting: PropTypes.bool
}

const ProgressButton = ({ isSubmitting, disabled, ...rest }) => {
  const classes = useStyles()
  return (
    <span className="position-relative">
      <Button {...rest} disabled={disabled || isSubmitting} />

      {isSubmitting && <CircularProgress size={14} className={classes.buttonProgress} />}
    </span>
  )
}
ProgressButton.propTypes = propTypes

export default ProgressButton
