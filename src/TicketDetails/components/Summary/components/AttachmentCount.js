import { Chip, Grid, Typography } from "@mui/material";
import { setCardPreferences } from "config/store";
import React from "react";
import { useDispatch } from "react-redux";

const AttachmentCount = ({ ticket, attachmentRef }) => {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(setCardPreferences({ card: 'attachmentsCard', preferences: { expanded: true } })) 
    setTimeout(() => {
      attachmentRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };
  
  return (
    <>
      <Grid container spacing={1} className="mb-2">
        <Grid item xs={3.5}>
          <Typography variant="subtitle1">Attachment: </Typography>
        </Grid>
        <Grid item xs="auto">
          <Chip
            onClick={handleClick}
            label={ticket.attachments_count || 0}
            sx={{ height: 18, width: 18 }}
            classes={{ label: "p-0 mt-1" }}
            className="bg-primary text-white pointer"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default AttachmentCount;
