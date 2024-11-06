import React, { useCallback, useState } from "react";
import {
  FormControlLabel,
  IconButton,
  MenuItem,
  Popover,
  Switch,
  Toolbar,
  Tooltip,
  Typography,
  Grid,
  MenuList,
  Box
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { MoreVert, ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { preventEvent } from "Common/helper";
import { includes } from "lodash";
import DialogAlert from "components/DialogAlert";
import { useMutation } from "@apollo/client";
import { DELETE_TICKET } from "TicketDetails/TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import CSAT from "Common/CSAT";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faFileLines } from "@fortawesome/pro-regular-svg-icons";

const useStyles = makeStyles((theme) => ({
  header: {
    position: "absolute",
    right: "1rem",
    height: 42,
    display: "flex",
    alignItems: "center",
    zIndex: theme.zIndex.drawer + 2,
  },
}));

const style = {
  width: 355
};

const Header = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    ticket,
    category,
    setopen1,
    hideContentDrawer,
    appuser_id,
    toggleOffCRMDrawer,
  } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [assignmentTypeAnchorEl, setAssignmentTypeAnchorEl] = useState(null);
  const [openDelete, toggleDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copyTicket, setCopyTicket] = useState(false);
  const [assignedNamePopover, setAssignedNamePopover] = useState(null); // State for assigned_name popover

  const [deleteTicket] = useMutation(DELETE_TICKET);

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(Boolean(anchorEl) ? null : event.currentTarget);
  };

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(ticket.ticket_id);
    setCopyTicket(!copyTicket);
  }, [copyTicket, ticket.ticket_id]);

  const onDeleteTicket = async () => {
    try {
      setLoading(true);
      await deleteTicket({
        variables: { id: ticket.ticket_id },
      }).finally(() => {
        setLoading(false);
        toggleDelete(false);
        setAnchorEl(null);
        hideContentDrawer({
          message: "Deleted the ticket successfully.",
          severity: "success",
        });
      });
    } catch (e) {
      setLoading(false);
      const message = e.message.split("GraphQL error:");
      dispatch(showSnackbar({ message, severity: "error" }));
    }
  };

  const onToggleDrawer = () => {
    toggleOffCRMDrawer();
    setAnchorEl(null);
  };

  const handleAssignedNameClick = (event) => {
    setAssignedNamePopover(event.currentTarget); // Set anchor element
  };

  const handleAssignedNamePopoverClose = () => {
    setAssignedNamePopover(null); // Close popover
  };

  setTimeout(() => {
    setCopyTicket(false);
  }, 4000);

  const typeOptions = ["Subscriber", "Infrastructure", "Equipment"];

  return (
    <>
      <div
        className={`${classes.header} docker-buttons`}
        style={{
          right:
            includes(category, "Add") || includes(category, "config") ? 50 : 97,
        }}
      >
        <IconButton onClick={handleClick} size="large" className="text-light">
          <MoreVert className="f-20" />
        </IconButton>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClick}
          classes={{ paper: "overflow-hidden" }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem>
            <FormControlLabel
              control={
                <Switch
                  checked={true}
                  name="newCardView"
                  onChange={onToggleDrawer}
                  size="small"
                />
              }
              label="New (beta)"
            />
          </MenuItem>
          {ticket.ticket_id > 0 && (
            <MenuItem onClick={() => toggleDelete(true)}>
              Delete Ticket
            </MenuItem>
          )}
          <MenuItem className="pl-2">
            <CSAT
              appuser_id={appuser_id}
              category={"Ticket Drawer (Beta)"}
              key={category}
              isSettings={false}
              handlePopoverClose={() => setAnchorEl(null)}
            />
          </MenuItem>
        </Popover>
      </div>
      <Toolbar className="drawer-header">
        <Typography variant="h6" className="font-weight-light">
          {ticket.ticket_id > 0 ? `Ticket #${ticket.ticket_id}` : "Add Ticket"}
        </Typography>
        {ticket.ticket_id > 0 && (
          <>
            <Tooltip
              title={!copyTicket ? "Copy Ticket ID" : "Copied!"}
              placement="top"
            >
              <IconButton
                className="text-light has-hover-light"
                onClick={copyText}
              >
                <FontAwesomeIcon icon={faCopy} />
              </IconButton>
            </Tooltip>
            <Typography
              variant="h6"
              onClick={handleAssignedNameClick} // Add click handler here
              style={{ cursor: "pointer" }}
            >
              {ticket.assigned_name}
            </Typography>
            <Popover
              open={Boolean(assignedNamePopover)}
              anchorEl={assignedNamePopover}
              onClose={handleAssignedNamePopoverClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Box sx={style}>
                <Grid container spacing={2} style={{ padding: "20px 15px" }}>
                  <Grid item xs={5}>
                    <Typography variant="subtitle1" className="text-dark">
                      Assignment Type:
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="subtitle1" className="text-muted">
                      Select Assignment Type
                      <IconButton
                        style={{ padding: 0 }}
                        onClick={(e) => setAssignmentTypeAnchorEl(e.currentTarget)}
                      >
                        {assignmentTypeAnchorEl ? (
                          <ArrowDropUp className="f-20" />
                        ) : (
                          <ArrowDropDown className="f-20" />
                        )}
                      </IconButton>
                      {assignmentTypeAnchorEl && (
                        <Popover
                          open={Boolean(assignmentTypeAnchorEl)}
                          anchorEl={assignmentTypeAnchorEl}
                          onClose={() => setAssignmentTypeAnchorEl(null)}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "center",
                          }}
                        >
                          <MenuList>
                            {typeOptions.map((type, index) => (
                              <MenuItem
                                key={index}
                                onClick={() => {
                                  // Implement selection logic if needed
                                  setAssignmentTypeAnchorEl(null); // Close the popover
                                }}
                              >
                                {type}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Popover>
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Popover>
            <Tooltip title="Work Order" placement="top">
              <IconButton
                className="text-light has-hover-light mr-2"
                onClick={() => setopen1("Work Order")}
              >
                <FontAwesomeIcon icon={faFileLines} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Toolbar>
      {openDelete && (
        <DialogAlert
          open={openDelete}
          message={<span>Are you sure you want to delete this ticket?</span>}
          buttonsList={[
            {
              label: "Yes",
              size: "medium",
              color: "primary",
              isProgress: true,
              isSubmitting: loading,
              onClick: onDeleteTicket,
            },
            {
              label: "No",
              size: "medium",
              color: "default",
              disabled: loading,
              onClick: () => {
                toggleDelete(false);
                setAnchorEl(null);
              },
            },
          ]}
        />
      )}
    </>
  );
};

export default Header;
