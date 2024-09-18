import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "../../../components/HeaderMenuOptions";
import { TextField, Grid } from "@mui/material";

const CustomFields = (props) => {
  const { appuser_id } = props;
  return (
    <AccordionCard
      label="Custom Fields"
      menuOption={
        <HeaderMenuOptions
          appuser_id={appuser_id}
          category="Custom Fields Card"
        />
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <TextField
            fullWidth
            id="standard-basic"
            label="Setup Date"
            variant="standard"
            value="07/31/2013"
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            id="standard-basic"
            label="O/S"
            variant="standard"
            value="Unix"
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            id="standard-basic"
            label="Previous ISP"
            variant="standard"
            value="hellos"
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            id="standard-basic"
            label="Location ID"
            variant="standard"
            value="#568540"
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            id="standard-basic"
            label="Setup Date"
            variant="standard"
            value="07/31/2013"
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            id="standard-basic"
            label="Previous ISP"
            variant="standard"
            value="hellos"
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            id="standard-basic"
            label="Location ID"
            variant="standard"
            value="#568540"
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            fullWidth
            id="standard-basic"
            label="Setup Date"
            variant="standard"
            value="07/31/2013"
          />
        </Grid>
      </Grid>
    </AccordionCard>
  );
};
export default CustomFields;
