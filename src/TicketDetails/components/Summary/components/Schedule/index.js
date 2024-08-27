import React from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, Grid, IconButton, Typography } from "@mui/material";
import DueDate from "./components/DueDate";
import PreferredArrival from "./components/PreferredArrival";
import { makeStyles } from "@mui/styles";
import { useDispatch, useSelector } from "react-redux";
import { setCardPreferences } from "config/store";

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
  const dispatch = useDispatch();
  const classes = useStyles();
  const { ticket, updateTicket, isSubmitting } = props;
  const summaryCard = useSelector(state => state.summaryCard);
  const preferences = summaryCard ? summaryCard.subComponent : {}

  const handleCollapse = () => {
    dispatch(setCardPreferences({
      card: "summaryCard",
      preferences: {
        ...summaryCard,
        subComponent: {
          ...preferences,
          schedule: !preferences.schedule
        }
      }
    }))
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <IconButton onClick={handleCollapse} className="p-2 text-muted">
          {preferences.schedule ? (
            <ExpandMore className="mr-1" />
          ) : (
            <ExpandLess className="mr-1" />
          )}
          <Typography variant="body1">
            Schedule
          </Typography>
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={preferences.schedule} style={{ paddingLeft: "25px", position: "relative" }}>
          <Grid container spacing={1}>
            <Grid item xs={12} >
              <DueDate classes={classes} ticket={ticket} updateTicket={updateTicket} />
            </Grid>
            <Grid item xs={12} >
              <PreferredArrival isSubmitting={isSubmitting} classes={classes} ticket={ticket} updateTicket={updateTicket} />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Grid >
  );
};
export default React.memo(Schedule);
