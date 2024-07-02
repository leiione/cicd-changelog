import React from "react"
import { Grid, Paper, Typography } from "@mui/material"
import { Error } from "@mui/icons-material"
import { makeStyles } from "@mui/styles"

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    margin: "20px",
    boxShadow: "none",
  }
}))

export const ErrorPage = props => {
  const classes = useStyles()
  const { error } = props

  let errorMessage = "We're sorry, but something went wrong.";
  if (process.env.REACT_APP_HOST_ENV === 'development' && error) {
    errorMessage = error;
  }

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6">
              <Error className="text-danger mr-2" />
              {errorMessage}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default ErrorPage
