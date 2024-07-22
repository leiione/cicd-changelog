import React, { useState } from "react";
import {
  Grid,
  Typography,
  MenuItem,
  Popover,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useQuery } from "@apollo/client";

import { GET_FOLLOWERS } from "TicketDetails/TicketGraphQL";
import { preventEvent } from "Common/helper";

const Followers = (props) => {
  const { ticket,updateTicket } = props;
  const [selectedFollowers, setFollowers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const { data } = useQuery(GET_FOLLOWERS, {
    fetchPolicy: "network-only",
  });
  const fetchFollowerName = (followerEmail) => {
    if (data && data.followers) {
      const follower = data.followers.find(
        (follower) => follower.email === followerEmail
      );
      return follower ? follower.realname : "Undefined";
    }
    return followerEmail;
  };

  const handlePopoverClose = async(event) => {
   
    const followerEmails = selectedFollowers.map(follower => follower.email); // Extract emails from selectedFollowers

    await updateTicket({ticket_id: ticket.ticket_id,
      followers:followerEmails
    })
    preventEvent(event);
    setAnchorEl(null);
  };

  const handleSelectFollower = (follower) => {
    const isSelected = selectedFollowers.some(
      (a) => a.appuser_id === follower.appuser_id
    );
    if (isSelected) {
      setFollowers(
        selectedFollowers.filter((a) => a.appuser_id !== follower.appuser_id)
      );
    } else {
      setFollowers([...selectedFollowers, follower]);
    }
  };

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs="auto">
          <Typography variant="subtitle1">Followers: </Typography>
        </Grid>
        <Grid item xs="auto" onClick={handleClick}>
          {ticket && ticket.followers && ticket.followers.length > 0 ? (
            ticket.followers.split(",").map((follower) => (
              <Typography variant="subtitle1" key={follower}>
                {fetchFollowerName(follower)}
              </Typography>
            ))
          ) : (
            <Typography variant="subtitle1"></Typography>
          )}

          <Popover
            open={openMenu}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            classes={{ paper: "overflow-hidden" }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            {data &&
              data.followers &&
              data.followers.map((follower) => (
                <MenuItem
                  key={follower.appuser_id}
                  onClick={() => handleSelectFollower(follower)}
                  style={{
                    backgroundColor: selectedFollowers.some(
                      (a) => a.appuser_id === follower.appuser_id
                    )
                      ? "#f0f0f0"
                      : "transparent", // Change background color to indicate selection
                    pointerEvents: !follower.email ? "none" : "auto", // Disable interaction if follower has an email
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        style={{ display: "none" }} // Hide the checkbox visually
                        checked={selectedFollowers.some(
                          (a) => a.appuser_id === follower.appuser_id
                        )}
                        name={follower.realname}
                        disabled={!follower.email}
                      />
                    }
                    label={`${follower.realname}`}
                  />
                </MenuItem>
              ))}
          </Popover>
        </Grid>
      </Grid>
    </>
  );
};
export default Followers;
