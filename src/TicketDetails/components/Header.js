import React, { useState } from "react";
import { IconButton, MenuItem, Popover, Toolbar, Tooltip, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ContentCopy, DescriptionOutlined, MoreVert } from "@mui/icons-material";
import { preventEvent } from "Common/helper";
import { includes } from "lodash";
import DialogAlert from "components/DialogAlert";
import { useMutation } from "@apollo/client";
import { DELETE_TICKET } from "TicketDetails/TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import CSAT from "Common/CSAT";

const useStyles = makeStyles((theme) => ({
  header: {
    position: "absolute",
    right: "1rem",
    height: 42,
    display: "flex",
    alignItems: "center",
    zIndex: theme.zIndex.drawer + 2
  },
}));

const Header = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch()
  const { ticket, category, setopen1, hideContentDrawer, appuser_id } = props;
  const [anchorEl, setAnchorEl] = useState(null)
  const [openDelete, toggleDelete] = useState(null);
  const [loading, setLoading] = useState(false)
  const [deleteTicket] = useMutation(DELETE_TICKET)

  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(Boolean(anchorEl) ? null : event.currentTarget)
  }

  const copyText = () => {
    navigator.clipboard.writeText(ticket.ticket_id)
  }

  const onDeleteTicket = async () => {
    try {
      setLoading(true)
      await deleteTicket({
        variables: { id: ticket.ticket_id },
      }).finally(() => {
        setLoading(false)
        toggleDelete(false)
        setAnchorEl(null)
        hideContentDrawer({ message: "Deleted the ticket successfully.", severity: "success" })
      })
    } catch (e) {
      setLoading(false)
      const message = e.message.split("GraphQL error:")
      dispatch(showSnackbar({ message, severity: "error" }))
    }
  }

  return (
    <>
      <div className={`${classes.header} docker-buttons`} style={{ right: includes(category, 'Add') || includes(category, 'config') ? 50 : 100 }}>
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
            horizontal: "left"
          }}
        >
          {ticket.ticket_id > 0 &&
            <MenuItem onClick={() => toggleDelete(true)}>
              Delete Ticket
            </MenuItem>
          }
          <MenuItem className="pl-2">
            <CSAT appuser_id={appuser_id} category={category} key={category} isSettings={false} />
          </MenuItem>
        </Popover>
      </div>
      <Toolbar className="drawer-header">
        <Typography variant="h6" className="font-weight-light">{ticket.ticket_id > 0 ? `Ticket #${ticket.ticket_id}` : 'Add Ticket'}</Typography>
        {ticket.ticket_id > 0 &&
          <>
            <IconButton className="text-light" onClick={copyText}>
              <ContentCopy className="f-18" />
            </IconButton>
            <Typography variant="h6" className="font-weight-bold">{ticket.assigned_name}</Typography>
            <Tooltip title="Work Order" placement="top">
              <IconButton className="text-light" onClick={() => setopen1("Work Order")}>
                <DescriptionOutlined className="f-18" />
              </IconButton>
            </Tooltip>
          </>
        }
      </Toolbar>
      {openDelete && <DialogAlert
        open={openDelete}
        message={<span>Are you sure you want to delete this ticket?</span>}
        buttonsList={[
          {
            label: "Yes",
            size: "medium",
            color: "primary",
            isProgress: true,
            isSubmitting: loading,
            onClick: onDeleteTicket
          },
          {
            label: "No",
            size: "medium",
            color: "default",
            disabled: loading,
            onClick: () => {
              toggleDelete(false)
              setAnchorEl(null)
            }
          }
        ]}
      />}
    </>
  );
};

export default Header;
