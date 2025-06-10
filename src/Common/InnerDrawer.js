import React from "react"
import { Close } from "@mui/icons-material"
import { Drawer, Grid, IconButton, Toolbar, Typography } from "@mui/material"
import { makeStyles } from "@mui/styles"

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: "35vw",
    [theme.breakpoints.down('lg')]: {
      width: "35vw"
    },
    [theme.breakpoints.down('md')]: {
      width: "100%"
    },
    zIndex: theme.zIndex.drawer + 2
  },
}))

const InnerDrawer = props => {
  const classes = useStyles()
  const { header, open, onCloseDrawer, children, customDrawerPaper } = props

  return (
    <Drawer classes={{ paper: customDrawerPaper || classes.drawerPaper }} variant="persistent" anchor={"right"} open={open} >
      <Toolbar className="drawer-header">
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item xs={9}>
            <Typography variant="h6">{header}</Typography>
          </Grid>
          <Grid item xs="auto">
            <IconButton aria-label="Close" onClick={onCloseDrawer} size="large">
              <Close className="text-light" />
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
      {children}
    </Drawer>
  )
}

export default InnerDrawer