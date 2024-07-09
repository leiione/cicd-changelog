import React, { useState } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, Grid, IconButton, Typography } from "@mui/material";
import DueDate from "./DueDate";
import PreferredArrival from "./PreferredArrival";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  dueDate: {
    "&:hover": {
      color: "#0053F4"
    }
  }
}))
const Schedule = (props) => {
  const classes = useStyles();
  const { ticket } = props;
  const [expandCollapse, setExpandCollapse] = useState("");
  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs={12} style={{ marginBottom: "-10px" }}>
        <IconButton onClick={handleCollapse} className="mx-0 px-1 text-muted">
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
              <DueDate classes={classes} ticket={ticket} />
            </Grid>
            <Grid item xs={12} >
              <PreferredArrival classes={classes} ticket={ticket} />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Grid >
  );
};
export default Schedule;
