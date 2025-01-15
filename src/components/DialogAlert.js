import React from "react"
import {
  Dialog,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography
} from "@mui/material"
import Loader from "./Loader";
import LoadingButton from '@mui/lab/LoadingButton';

const DialogAlert = props => {
  const { open, title, message, messageList, buttonsList, loading, maxWidth="md" } = props
  const voidFunction = () => {}
  let content = <Typography variant="subtitle1">{message}</Typography>;
  if (messageList && messageList.length > 0) {
    content = messageList.map((msg, index) => <Typography key={"contentAlert" + index} variant="subtitle1">{msg}</Typography>);
  }
  return (
    <Dialog open={open} maxWidth={maxWidth} disableEnforceFocus>
      {loading ?
          <div style={{ width: "40vw", height: "10vw" }}>
            <Loader />
          </div>
      : <>
          {title && <DialogTitle id="alert-dialog-title">{title}</DialogTitle>}
          <DialogContent>
            {content}
          </DialogContent>
          <DialogActions>
            {buttonsList.map((button, index) => {
              if (button.isProgress) {
                return (
                  <LoadingButton
                    loading={button.isSubmitting}
                    variant="outlined"
                    size={button.size || "medium"}
                    color={button.color}
                    onClick={button.onClick || voidFunction}
                    disabled={button.disabled || false}
                    className={button.classes || ''}
                    key={"buttonAlert" + index}
                  >
                    {button.label}
                  </LoadingButton>
                )
              }
              return (
                <Button
                  variant="outlined"
                  size={button.size || "medium"}
                  color={button.color || 'default'}
                  onClick={button.onClick || voidFunction}
                  disabled={button.disabled || false}
                  className={button.classes || ''}
                  key={"buttonAlert" + index}
                >
                  {button.label}
                </Button>
              )
            })}
          </DialogActions>
        </>
      }
    </Dialog>
  )
}

export default DialogAlert