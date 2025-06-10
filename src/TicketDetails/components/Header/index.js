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
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { MoreVert } from "@mui/icons-material";
import { preventEvent } from "Common/helper";
import { get, includes, startCase, toLower } from "lodash";
import DialogAlert from "components/DialogAlert";
import { useMutation } from "@apollo/client";
import { DELETE_TICKET } from "TicketDetails/TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import CSAT from "Common/CSAT";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faFileLines } from "@fortawesome/pro-regular-svg-icons";
import ChangeTicketAssignment from "./components/ChangeTicketAssignment";
import HeaderActions from "./components/HeaderActions";
import { useSelector } from "react-redux";

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

const Header = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const {
    ticket,
    setTicketCached,
    category,
    setopen1,
    hideContentDrawer,
    appuser_id,
    toggleOffCRMDrawer,
    handleOpenTicketAssignment,
    ticketData,
    fromDashboard,
    addRecentActionsDrawer
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDelete, toggleDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copyTicket, setCopyTicket] = useState(false);

  const [editAssignment, setEditAssignment] = useState(null);

  const [deleteTicket] = useMutation(DELETE_TICKET);
  const dockedItems = useSelector(state => get(state, "dockedItems"))
  const moveToolBar = dockedItems && dockedItems.length > 0

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

  const onOpenDeleteTicket = () => {
    toggleDelete(true)
  };

  const handleAssignmentChange = () => {
    setEditAssignment(true);
    setAnchorEl(null);
  };

  const handleAssignedNameClick = (event) => {
    handleOpenTicketAssignment(ticket)
  };

  setTimeout(() => {
    setCopyTicket(false);
  }, 4000);

  const assigned_name = ticket.subscriber && (ticket.subscriber_name || ticket.subscriber.first_name) ? `${ticket.subscriber_name || `${ticket.subscriber.first_name} ${ticket.subscriber.last_name}`} (${ticket.customer_id || ticket.subscriber.customer_id})` : ticket.assigned_name
  const assignmnetId = (ticket.subscriber && ticket.subscriber.customer_id) || (ticket.location_id) || (ticket.equipment_id)
  const rightStyle = fromDashboard ? (moveToolBar ? 25 : 13) : (includes(category, "Add") || includes(category, "config") ? 50 : (97 + (moveToolBar ? 23 : 0)));
  
  return (
    <>
      <div
        className={`${classes.header} docker-buttons`}
        style={{ right: rightStyle }}
      >
        <IconButton onClick={handleClick} size="large" className="text-light">
          <MoreVert className="f-20" />
        </IconButton>
        {fromDashboard && 
          <HeaderActions
            ticket={ticket}
            category={category}
            addRecentActionsDrawer={addRecentActionsDrawer}
            dockedItems={dockedItems}
          />
        }
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
          {(ticketData && !ticketData.disableCRMDrawertoggleButton) &&
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


          }

          {ticket.ticket_id > 0 && (
            <>
              <MenuItem onClick={handleAssignmentChange}>
                Change Ticket Assignment
              </MenuItem>
              <MenuItem onClick={onOpenDeleteTicket}>
                Delete Ticket
              </MenuItem>
            </>
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
            <Tooltip title={assignmnetId ? `Open ${startCase(toLower(ticket.category_type))} Drawer` : ""} placement="top">
              <Typography
                variant="h6"
                onClick={handleAssignedNameClick}
                style={{ cursor: ["Resolved", "Closed"].includes(ticket.status) ? "default" : "pointer" }}
                disabled={!assignmnetId}
              >
                {assigned_name}
              </Typography>
            </Tooltip>
            {editAssignment && (
              <ChangeTicketAssignment
                ticket={ticket}
                setTicketCached={setTicketCached}
                editAssignment={editAssignment}
                setEditAssignment={setEditAssignment}
              />
            )}
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
