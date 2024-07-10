import React from "react";
import { IconButton, MenuItem, Popover } from "@mui/material";
import {
  ArrowCircleDownOutlined,
  ArrowCircleUpOutlined,
  RemoveCircleOutlineOutlined,
} from "@mui/icons-material";
import { preventEvent } from "../../../../Common/helper";

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

  function displayIconBasedOnPriority(priority) {
    switch (priority) {
      case "Low":
        return <ArrowCircleDownOutlined className="text-secondary" />;
      case "Normal":
        return <RemoveCircleOutlineOutlined className="mr-2 text-warning" />;
      case "High":
        return <ArrowCircleUpOutlined className="mr-2 text-success" />;
      default:
        return <ArrowCircleDownOutlined className="text-secondary" />; // or a default icon
    }
  }

  return (
    <>
      <IconButton color="default" onClick={handleClick}>
        {displayIconBasedOnPriority(priority)}
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
          <ArrowCircleDownOutlined className="mr-2 text-secondary" /> Priority:
          Low
        </MenuItem>
        <MenuItem
          onClick={(event) => handlePopoverClose(event, "Normal")}
          color="default"
        >
          <RemoveCircleOutlineOutlined className="mr-2 text-warning" />
          Priority: Normal
        </MenuItem>
        <MenuItem
          onClick={(event) => handlePopoverClose(event, "High")}
          color="default"
        >
          <ArrowCircleUpOutlined className="mr-2 text-success" /> Priority: High
        </MenuItem>
      </Popover>
    </>
  );
};
export default TicketPriority;
