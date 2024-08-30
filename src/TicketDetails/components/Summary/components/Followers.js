import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  Popover,
  Button,
  Tooltip,
  IconButton,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_FOLLOWERS } from "TicketDetails/TicketGraphQL";
import { preventEvent } from "Common/helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/pro-light-svg-icons";
import AvatarText from "Common/AvatarText";

const fetchFollowerName = (followerEmail, data) => {
  if (data && data.followers) {
    const follower = data.followers.find(
      (follower) => follower.email === followerEmail
    );
    return follower ? follower.realname : "Undefined";
  }
  return ""; // Return blank instead of the email
};

const Followers = (props) => {
  const { ticket, updateTicket } = props;
  const [selectedFollowers, setFollowers] = useState([]);
  const [tempFollowers, setTempFollowers] = useState([]); // Temporary state for editing
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
      const initialFollowers = ticket.followers
        .split(",")
        .map((followerEmail) => {
          const follower = data.followers.find(
            (f) => f.email === followerEmail
          );
          return follower
            ? follower
            : {
                email: followerEmail,
                realname: fetchFollowerNameCallback(followerEmail),
              };
        });
      setFollowers(initialFollowers);
      setTempFollowers(initialFollowers); // Initialize tempFollowers
    }
  }, [ticket, data, fetchFollowerNameCallback]);

  const handlePopoverClose = (event) => {
    preventEvent(event);
    setTempFollowers(selectedFollowers); // Reset changes if not saved
    setAnchorEl(null);
  };

  const handleSave = async () => {
    const followerEmails = tempFollowers.map((follower) => follower.email);
    await updateTicket({
      ticket_id: ticket.ticket_id,
      followers: followerEmails,
    });
    setFollowers(tempFollowers); // Persist changes
    setAnchorEl(null);
  };

  const handleSelectFollower = (follower) => {
    const isSelected = tempFollowers.some((a) => a.email === follower.email);
    if (isSelected) {
      setTempFollowers(tempFollowers.filter((a) => a.email !== follower.email));
    } else {
      setTempFollowers([...tempFollowers, follower]);
    }
  };

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Grid container spacing={1} className="mb-2">
        <Grid item xs="auto">
          <Typography variant="subtitle1">Followers: </Typography>
        </Grid>
        <Grid item xs="auto" onClick={handleClick}>
          {ticket && ticket.followers && ticket.followers.length > 0 ? (
            ticket.followers.split(",").map((follower) => {
              const followerName = fetchFollowerNameCallback(follower);
              return (
                <Typography
                  variant="subtitle1"
                  className="d-flex align-items-center mb-1"
                  key={follower}
                >
                  {followerName && (
                    <AvatarText
                      title={followerName}
                      charCount={1}
                      sx={{
                        width: 20,
                        height: 20,
                      }}
                      className="mr-2"
                    />
                  )}
                  {followerName || ""}
                </Typography>
              );
            })
          ) : (
            <IconButton color="primary" onClick={handleClick} size="small">
              <FontAwesomeIcon icon={faPlusCircle} />
            </IconButton>
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
            <List className="paper-height-300 overflow-y-auto">
              {data &&
                data.followers &&
                data.followers.map((follower) => {
                  const isDisabled = !follower.email;
                  return (
                    <Tooltip
                      key={follower.appuser_id}
                      title={
                        isDisabled
                          ? "This appuser does not have an associated email account."
                          : follower.email
                      }
                      placement="top"
                    >
                      <ListItemButton
                        disablePadding
                        disabled={isDisabled}
                        selected={tempFollowers.some(
                          (a) => a.email === follower.email
                        )}
                        onClick={() => handleSelectFollower(follower)}
                      >
                        <ListItemAvatar>
                          <AvatarText
                            title={follower.realname}
                            charCount={1}
                            className="mx-auto"
                            sx={{
                              width: 20,
                              height: 20,
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText primary={follower.realname} />
                      </ListItemButton>
                    </Tooltip>
                  );
                })}
            </List>
            <div className="drawer-footer">
              <Button color="primary" variant="outlined" onClick={handleSave}>
                Save
              </Button>
              <Button
                color="default"
                variant="outlined"
                onClick={handlePopoverClose}
              >
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
