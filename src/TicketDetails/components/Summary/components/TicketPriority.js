import React from "react";
import { IconButton, MenuItem, Popover } from "@mui/material";
import { preventEvent } from "../../../../Common/helper";
import { getPriorityIcon } from "utils/getPriorityIcon";

const TicketPriority = (props) => {
  const { customer, handleUpdate } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [priority, setPriority] = React.useState();
  // 2. Use the useMutation hook with the defined mutation

  React.useEffect(() => {
    if (customer && customer.priority) {
      setPriority(customer.priority);
    }
  }, [customer]);

  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event, selectedPriority) => {
    if (selectedPriority !== "backdropClick") {
      handleUpdate({
        ticket_id: customer.ticket_id,
        priority: selectedPriority,
      });
      setPriority(selectedPriority);
    }

    preventEvent(event);
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton color="default" size="small" onClick={handleClick}>
        {getPriorityIcon(priority)}
      </IconButton>

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
        <MenuItem
          onClick={(event) => handlePopoverClose(event, "Low")}
          color="default"
        >
          {getPriorityIcon("Low")}
          Priority: Low
        </MenuItem>
        <MenuItem
          onClick={(event) => handlePopoverClose(event, "Normal")}
          color="default"
        >
          {getPriorityIcon("Normal")}
          Priority: Normal
        </MenuItem>
        <MenuItem
          onClick={(event) => handlePopoverClose(event, "High")}
          color="default"
        >
          {getPriorityIcon("High")} Priority: High
        </MenuItem>
      </Popover>
    </>
  );
};
export default TicketPriority;
