import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  MenuItem,
  Popover,
  Avatar,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_FOLLOWERS } from "TicketDetails/TicketGraphQL";
import { preventEvent } from "Common/helper";

const fetchFollowerName = (followerEmail, data) => {
  if (data && data.followers) {
    const follower = data.followers.find(
        (follower) => follower.email === followerEmail
    );
    return follower ? follower.realname : "Undefined";
  }
  return followerEmail;
};

const Followers = (props) => {
  const { ticket, updateTicket } = props;
  const [selectedFollowers, setFollowers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const { data } = useQuery(GET_FOLLOWERS, {
    fetchPolicy: "network-only",
  });

  const fetchFollowerNameCallback = useCallback(
      (followerEmail) => fetchFollowerName(followerEmail, data),
      [data]
  );

  useEffect(() => {
    if (ticket && ticket.followers && data && data.followers) {
      const initialFollowers = ticket.followers.split(",").map((followerEmail) => {
        const follower = data.followers.find(f => f.email === followerEmail);
        return follower ? follower : { email: followerEmail, realname: fetchFollowerNameCallback(followerEmail) };
      });
      setFollowers(initialFollowers);
    }
  }, [ticket, data, fetchFollowerNameCallback]);

  const handlePopoverClose = (event) => {
    preventEvent(event);
    setAnchorEl(null);
  };

  const handleSave = async () => {
    const followerEmails = selectedFollowers.map((follower) => follower.email);
    await updateTicket({
      ticket_id: ticket.ticket_id,
      followers: followerEmails,
    });
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

  function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  function stringAvatar(name) {
    if (!name || typeof name !== "string") {
      return {
        sx: {
          bgcolor: stringToColor("Anonymous"),
        },
        children: "A",
      };
    }

    const nameParts = name.split(" ");
    const initials =
        nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`
            : `${nameParts[0][0]}`;

    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: initials,
    };
  }

  return (
      <>
        <Grid container spacing={1}>
          <Grid item xs="auto">
            <Typography variant="subtitle1">Followers: </Typography>
          </Grid>
          <Grid item xs="auto" onClick={handleClick}>
            {ticket && ticket.followers && ticket.followers.length > 0 ? (
                ticket.followers.split(",").map((follower) => (
                    <Typography variant="subtitle1" className="d-flex align-items-center" key={follower}>
                      <Avatar
                          {...stringAvatar(fetchFollowerNameCallback(follower))}
                          sx={{ width: 24, height: 24 }}
                          className="ml-1 mr-2"
                      />
                      {fetchFollowerNameCallback(follower)}
                    </Typography>
                ))
            ) : (
                <Typography variant="body2" color="primary" onClick={handleClick}>
                  Add Followers
                </Typography>
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
              {data && data.followers && data.followers.map((follower) => (
                  <MenuItem
                      key={follower.appuser_id}
                      onClick={() => handleSelectFollower(follower)}
                      style={{
                        backgroundColor: selectedFollowers.some(
                            (a) => a.appuser_id === follower.appuser_id
                        )
                            ? "#f0f0f0"
                            : "transparent",
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
              <div className="drawer-footer">
                <Button color="primary" variant="outlined" onClick={handleSave}>
                  Save
                </Button>
                <Button color="default" variant="outlined" onClick={handlePopoverClose}>
                  Cancel
                </Button>
              </div>
            </Popover>
          </Grid>
        </Grid>
      </>
  );
};

export default Followers;
