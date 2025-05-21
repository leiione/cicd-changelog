import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Typography,
  Popover,
  Tooltip,
  IconButton,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  TextField,
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
  const [tempFollowers, setTempFollowers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
      const initialFollowers = (typeof ticket.followers === 'string' ? ticket.followers.split(",") : Array.isArray(ticket.followers) ? ticket.followers : [])
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
      setTempFollowers(initialFollowers);
    }
  }, [ticket, data, fetchFollowerNameCallback]);

  const handlePopoverClose = async (event) => {
    preventEvent(event);
    setAnchorEl(null);

    const followerEmails = tempFollowers.map((follower) => follower.email);

    try {
      await updateTicket({
        ticket_id: ticket.ticket_id,
        followers: followerEmails.join(","),
      });
      setFollowers(tempFollowers); // Sync saved state
    } catch (error) {
      console.error("Error updating ticket:", error);
    }

    setSearchTerm("");
  };

  const handleSelectFollower = (follower) => {
    const isSelected = tempFollowers.some((a) => a.email === follower.email);

    let updatedTempFollowers;
    if (isSelected) {
      updatedTempFollowers = tempFollowers.filter(
        (a) => a.email !== follower.email
      );
    } else {
      updatedTempFollowers = [...tempFollowers, follower];
    }

    setTempFollowers(updatedTempFollowers);
    setFollowers(updatedTempFollowers); // Reflect changes immediately in the UI
  };

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredFollowers = data?.followers
    ?.filter((follower) =>
      follower.realname.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aDisabled = !a.email;
      const bDisabled = !b.email;
      return aDisabled - bDisabled;
    });

  return (
    <>
      <Grid container spacing={1} className="mb-2">
        <Grid item xs={3.5}>
          <Typography variant="subtitle1">Followers: </Typography>
        </Grid>
        <Grid item xs="auto" onClick={handleClick}>
          {selectedFollowers.length > 0 ? (
            selectedFollowers.map((follower, index) => (
              <Typography
                variant="subtitle1"
                className="d-flex align-items-center mb-1"
                key={follower.email ? follower.email : `empty-email-${index}`}
              >
                {follower.realname && (
                  <AvatarText
                    title={follower.realname}
                    charCount={1}
                    sx={{
                      width: 20,
                      height: 20,
                    }}
                    className="mr-2"
                  />
                )}
                {follower.realname || ""}
              </Typography>
            ))
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
            <TextField
              placeholder="Search followers"
              className="p-3"
              variant="standard"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              autoFocus
              autoComplete="off"
              margin="dense"
            />
            <List className="paper-height-300 overflow-y-auto">
              {filteredFollowers &&
                filteredFollowers.map((follower, index) => {
                  const isDisabled = !follower.email;
                  return (
                    <Tooltip
                      key={follower.email ? follower.email : `empty-email-list-${index}`}
                      title={
                        isDisabled
                          ? "This appuser does not have an associated email account."
                          : follower.email
                      }
                      placement="top"
                    >
                      <ListItemButton
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
          </Popover>
        </Grid>
      </Grid>
    </>
  );
};

export default Followers;
