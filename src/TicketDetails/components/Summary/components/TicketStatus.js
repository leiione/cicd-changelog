import React, { useMemo, useState } from "react";
import { Button, Menu, MenuItem, Tooltip, TextField } from "@mui/material";
import { preventEvent } from "../../../../Common/helper";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { getUserAction } from "utils/getUserAction";
import { find } from "lodash";

const useStyles = makeStyles((theme) => ({
  paperHeight: {
    maxHeight: 300,
  },
}));

const TicketStatus = (props) => {
  const classes = useStyles();
  const { ticket, ticketStatuses, handleUpdate, defaultAttacmentCount } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [status, setStatus] = React.useState();
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    if (ticket && ticket.priority) {
      setStatus(ticket.status ? ticket.status : "Task");
    }
  }, [ticket]);

  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event, status) => {
    if (status !== "backdropClick") {
      setStatus(status);
      handleUpdate({
        ticket_id: ticket.ticket_id,
        status: status,
      });
    }
    preventEvent(event);
    setSearchQuery("");
    setAnchorEl(null);
  };

  const tooltipMsgs = useMemo(() => {
    let resolvingTooltipMsgs = [];
    let closingTooltipMsgs = [];
    const hasUncompletedTask = find(ticket.tasks, (task) => !task.is_completed && task.is_default);
    const hasUncompletedAttachments = defaultAttacmentCount > 0;
    if (ticket.update_requirements && ticket.update_requirements.length > 0) {
      ticket.update_requirements.forEach((req) => {
        if (req.flag_enabled === "Y") {
          const restrictedUserActions = getUserAction(req.restricted_user_action);
          const isResolvingTicketRestricted = find(restrictedUserActions, (restriction) => restriction.label === "resolving");
          const isClosingTicketRestricted = find(restrictedUserActions, (restriction) => restriction.label === "closing");

          switch (req.requirement_option) {
            case "TASKS":
              if (hasUncompletedTask) {
                if (isResolvingTicketRestricted && !resolvingTooltipMsgs.includes("- all tasks to be checked")) {
                  resolvingTooltipMsgs.push("- all tasks to be checked");
                }

                if (isClosingTicketRestricted && !closingTooltipMsgs.includes("- all tasks to be checked")) {
                  closingTooltipMsgs.push("- all tasks to be checked");
                }
              }
              break;
            case "CUSTOM_FIELDS":
              // TODO
              break;
            case "ATTACHMENTS":
              if (hasUncompletedAttachments) {
                if (isResolvingTicketRestricted && !resolvingTooltipMsgs.includes("- all attachments")) {
                  resolvingTooltipMsgs.push("- all attachments");
                }

                if (isClosingTicketRestricted && !closingTooltipMsgs.includes("- all attachments")) {
                  closingTooltipMsgs.push("- all attachments");
                }
              }
              break;
            case "SIGNATURE":
              // TODO
              break;
            case "FOLLOWERS":
              // TODO
              break;
            default:
              break;
          }
        }
      });
    }
    return { resolvingTooltipMsgs, closingTooltipMsgs };
  }, [ticket.tasks, ticket.update_requirements, defaultAttacmentCount]);

  const resolvingClosingMessage = (action) => {
    if (["Resolved", "Close"].includes(action)) {
      const msgs = action === "Resolved" ? tooltipMsgs.resolvingTooltipMsgs : tooltipMsgs.closingTooltipMsgs;
      const actionTitle = action === "Resolved" ? "Resolving" : "Closing";
      if (msgs.length > 0) {
        return (
          <>
            <p>{actionTitle} this ticket requires:</p>
            {msgs.map((msg) => {
              return <p key={msg}>{msg}</p>;
            })}
            <p>To disable {msgs.length > 1 ? "these restrictions" : "this restriction"}, please review the Ticket Type settings.</p>
          </>
        );
      }
    }
    return null;
  };

  const filteredStatuses = ticketStatuses.filter((status) =>
    status.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    event.stopPropagation();
  };


  return (
    <>
      <Button
        color="default"
        onClick={handleClick}
        endIcon={openMenu ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
      >
        <span className="text-dark font-weight-normal">{status}</span>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handlePopoverClose}
        classes={{ paper: classes.paperHeight }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
       <TextField
          placeholder="Search..."
          className="p-3"
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
          autoFocus
          autoComplete="off"
          variant="standard"
          onClick={(event) => preventEvent(event)}
        />
        {filteredStatuses &&
          filteredStatuses.map((taskStatus) => {
            const isResolvedDisabled =
              taskStatus.name === "Resolved" &&
              ticket.tasks &&
              ticket.tasks[0] &&
              !ticket.tasks[0].is_completed;

            return (
              <Tooltip title={resolvingClosingMessage(taskStatus.name)} key={taskStatus.id}>
                <span
                  onClick={(event) => {
                    if (isResolvedDisabled || Boolean(resolvingClosingMessage(taskStatus.name))) {
                      preventEvent(event); // Stop propagation explicitly for disabled items
                    }
                  }}
                >
                  <MenuItem
                    onClick={(event) => {
                      if (isResolvedDisabled || Boolean(resolvingClosingMessage(taskStatus.name))) {
                        preventEvent(event); // Prevent action on disabled items
                      } else {
                        handlePopoverClose(event, taskStatus.name);
                      }
                    }}
                    color="default"
                    disabled={isResolvedDisabled || Boolean(resolvingClosingMessage(taskStatus.name))}
                  >
                    {taskStatus.name}
                  </MenuItem>
                </span>
              </Tooltip>
            );
          })
        }
      </Menu>
    </>
  );
};

export default TicketStatus;