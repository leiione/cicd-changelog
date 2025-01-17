import React from "react";
import { Drawer, Toolbar, Typography, IconButton, Grid } from "@mui/material"
import { FmdGoodOutlined } from "@mui/icons-material";
import { Close } from "@mui/icons-material"
import makeStyles from "@mui/styles/makeStyles"
import SearchRadius from "./components/SearchRadius"
import TicketQueueTable from "./components/TicketQueueTable";
import { getFormattedAddress, getFormattedPGAddress } from "utils/formatter";

const useStyles = makeStyles(theme => ({
  drawerStyle: {
    width: "40vw",
    overflow: "hidden"
  },
  form: {
    padding: 15
  }
}))

const QueueJobs = props => {
  const { openQueueJobs, setOpenQueueJobs, selectedAddress, ticket } = props
  let baseAddress = selectedAddress
  const isSubscriber = ticket.category_type === "SUBSCRIBER";
  if (isSubscriber && ticket.subscriber) {
    baseAddress = getFormattedAddress(ticket.subscriber.customer_details, 'main')
  } else if (ticket.infrastructure) {
    baseAddress = getFormattedPGAddress(ticket.infrastructure.address)
  }
  const classes = useStyles()
  const [radius, setRadius] = React.useState(3)
  
  const handleClose = () => {
    setOpenQueueJobs(false)    
  }

  return (
    <>
      <Drawer
        classes={{
          paper: classes.drawerStyle
        }}
        variant="persistent"
        anchor={"right"}
        open={openQueueJobs}

     >
        <Toolbar className="drawer-header">
            <Typography variant="h6">Queue Jobs</Typography>
            <IconButton
                onClick={handleClose}
                className="close-drawer text-light"
                size="large"
            >
                <Close />
            </IconButton>
        </Toolbar>
        <div className="drawer-wrapper-full p-3">
            <div className="border py-3 pb-3 px-4 my-3">
                <Grid container spacing={3}>
                    <Grid item xs={8}>                    
                        <Typography variant="h6">
                            Queued jobs based on this location
                        </Typography>
                        &nbsp;
                        <Typography variant="subtitle1">
                            <FmdGoodOutlined className="text-muted f-20" style={{ marginRight: 5 }}/>
                            {baseAddress}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6">
                        Search Radius
                        </Typography>
                        &nbsp;
                        <SearchRadius radius={radius} setRadius={setRadius} />
                    </Grid>
                </Grid>
            </div>
            <TicketQueueTable ticket={ticket} radius={radius} />
        </div>
    </Drawer>
    </>
  )
}

export default QueueJobs