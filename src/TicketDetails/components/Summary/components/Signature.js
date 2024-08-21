import React, { useState } from "react";
import {
  Dialog,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
  IconButton,
  Grid,
  Typography,
  Link,
} from "@mui/material"
import { makeStyles } from "@mui/styles";
import SignatureCanvas from "react-signature-canvas";
import { Close } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import { useMutation } from "@apollo/client";
import { ADD_TICKET_SIGNATURE, GET_TICKET } from "TicketDetails/TicketGraphQL";
import moment from "moment-timezone";
import ProgressButton from "Common/ProgressButton";

const useStyles = makeStyles(() => ({
  canvasBox: {
    position: "relative",
    background: "#fff",
    display: "flex",
    overflow: "hidden",
    justifyContent: "center",
    maxWidth: 500,
    margin: "auto",
    borderRadius: 5,
    border: "2px solid #e4e4e4"
  }
}));

const Signature = props => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [addTicketSignature] = useMutation(ADD_TICKET_SIGNATURE)

  const { ticket } = props

  const [openSignature, toggleSignature] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidSign, setIsValidSign] = useState(false)

  let signPad = null
  let intervalVal = 0

  const handleCloseSignature = () => {
    toggleSignature(false)
    setIsValidSign(false)
  }

  const onClearSignature = () => {
    signPad.clear()
    setIsValidSign(false)
  }

  const handleSaveSignature = async () => {
    if (!signPad) {
      dispatch(showSnackbar({ message: "Please sign before saving", severity: "error" }))
    } else {
      try {
        setLoading(true)
        const imgData = signPad.getTrimmedCanvas().toDataURL("image/png")
        const data = imgData.split(",")[1]
        await addTicketSignature({
          variables: {
            ticket_id: ticket.ticket_id,
            signature: data,
            signature_date: moment()
              .format("YYYY-MM-DD hh:mm:ss")
              .toString()
          },
          refetchQueries: [{ query: GET_TICKET, variables: { id: ticket.ticket_id } }]
        }).finally(() => {
          setLoading(false)
          setIsValidSign(false)
          toggleSignature(false)
        })
      } catch (e) {
        setLoading(false)
        const message = e.message.split("GraphQL error:")
        dispatch(showSnackbar({ message, severity: "error" }))
      }
    }
  }

  const checkSignPad = () => {
    if (signPad) {
      if (!signPad.isEmpty()) {
        setIsValidSign(true)
      }
    }
  }

  clearInterval(intervalVal)
  intervalVal = setInterval(checkSignPad, 1000)

  return (
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs="auto">
          <Typography variant="subtitle1">Signature: </Typography>
        </Grid>
        <Grid item xs="auto">
          {ticket && ticket.signature_url ?
            <img src={ticket.signature_url} alt="signature" style={{ width: "100px", height: "50px" }} />
            : <Link component={"button"} onClick={() => toggleSignature(true)} disable>Add</Link>
          }
        </Grid>
      </Grid>
      <Dialog
        open={openSignature}
        onClose={handleCloseSignature}
      >
        <DialogTitle className="bg-white text-dark">Signature</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseSignature}
          sx={{
            position: 'absolute',
            right: 5,
            top: 5,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
        <DialogContent>
          <Box className={classes.canvasBox}>
            <SignatureCanvas
              penColor="black"
              ref={ref => {
                signPad = ref
              }}
              canvasProps={{ width: 350, height: 130 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <div style={{ left: "10px", position: "absolute" }}>
            <Button variant="outlined" className="text-muted" disabled={!isValidSign || loading} onClick={onClearSignature}>Clear</Button>
          </div>
          <ProgressButton
            variant="outlined"
            color="primary"
            onClick={handleSaveSignature}
            isSubmitting={loading}
            disabled={!isValidSign || loading}
          >
            Accept and Sign
          </ProgressButton>
          <Button variant="outlined" className="text-muted" onClick={handleCloseSignature}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Signature;
