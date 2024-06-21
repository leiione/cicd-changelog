import React from "react";
import { Grid, Typography } from "@mui/material";

const Followers = (props) => {
  const { customer } = props;

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs="auto">
          <Typography variant="subtitle1">Followers: </Typography>
        </Grid>
        <Grid item xs="auto">
          {customer.followers.length > 0
            ? customer.followers.map((follower) => (
                <Typography variant="subtitle1" key={follower}>
                  {follower}
                </Typography>
              ))
            : 
            
          <Typography variant="subtitle1">Undefined</Typography>}
        </Grid>
      </Grid>
    </>
  );
};
export default Followers;
