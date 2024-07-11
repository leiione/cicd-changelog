import React, { useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, Grid, IconButton, Typography } from "@mui/material";
import DueDate from "./components/DueDate";
import PreferredArrival from "./components/PreferredArrival";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  dueDate: {
    "&:hover": {
      color: "#0053F4"
    }
  },
  tooltip: {
    backgroundColor: "#d32f2f",
    color: "#fff"
  }
}))

const Schedule = (props) => {
  const classes = useStyles();
  const { ticket, updateTicket } = props;
  const [expandCollapse, setExpandCollapse] = useState("");

  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <IconButton onClick={handleCollapse} className="p-2 text-muted">
          {expandCollapse ? (
            <ExpandMore className="mr-1" />
          ) : (
            <ExpandLess className="mr-1" />
          )}
          <Typography variant="subtitle1" className="text-muted">
            Schedule
          </Typography>
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={expandCollapse} style={{ paddingLeft: "25px", position: "relative" }}>
          <Grid container spacing={1}>
            <Grid item xs={12} >
              <DueDate classes={classes} ticket={ticket} updateTicket={updateTicket} />
            </Grid>
            <Grid item xs={12} >
              <PreferredArrival classes={classes} ticket={ticket} updateTicket={updateTicket} />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Grid >
  );
};
export default React.memo(Schedule);
