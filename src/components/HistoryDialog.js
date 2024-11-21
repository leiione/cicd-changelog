import React from "react"
import { Dialog, DialogContent, DialogTitle, Typography, Grid, IconButton } from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"
import { isEmpty, split } from "lodash"
import moment from "moment-timezone"
import { useSelector } from "react-redux"

const HistoryDialog = props => {
  const ispTimezone = useSelector(state => state.timeZone)
  const { children, timestamp, open, handleClose, maxWidth = "sm", contentComparison, ...rest } = props

  const splitText = split(children, `\n`)
  const newText = []
  splitText.forEach((text, i) => {
    newText.push(
      <React.Fragment key={`${text}${i}`}>
        <Typography key={`${text}${i}`} variant="subtitle1" style={{ color: "#525252" }}>
          <div dangerouslySetInnerHTML={{ __html: text }} />
        </Typography>
        {splitText.length - 1 !== i && isEmpty(text) ? <br /> : ""}
      </React.Fragment>
    )
  })
  return (
    <Dialog aria-describedby="alert-dialog-description" fullWidth maxWidth={maxWidth} open={open} {...rest}>
      <DialogTitle id="alert-dialog-title">
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item xs="auto">
            <Typography variant={"h6"}>History - {moment.tz(timestamp, ispTimezone).format("MMM DD, YYYY hh:mm A")}</Typography>
          </Grid>
          <Grid item xs="auto">
            <IconButton onClick={handleClose} size="large">
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent style={{ whiteSpace: "pre-line" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {newText}
          </Grid>
        </Grid>
        {contentComparison ? contentComparison : ""}
      </DialogContent>
    </Dialog>
  );
}

export default HistoryDialog
