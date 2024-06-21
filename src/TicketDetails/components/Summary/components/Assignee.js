import React from "react";
import { Grid, Typography } from "@mui/material";

const Assignee = (props) => {
  const { customer } = props;

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs="auto">
          <Typography variant="subtitle1">Assignee: </Typography>
        </Grid>
        <Grid item xs="auto">
          <Typography variant="subtitle1">
            {customer.assigned_name ? customer.assigned_name : "Undefined"}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};
export default Assignee;
