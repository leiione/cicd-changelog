import React from "react";
import { Button, Popover, List, ListItem, TextField, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import DialogAlert from "components/DialogAlert";
import { preventEvent } from "../../../../Common/helper";

const useStyles = makeStyles((theme) => ({
  paperHeight: {
    maxHeight: 300,
    overflowY: "auto",
  },
}));

const TicketType = (props) => {
  const classes = useStyles();
  const { customer, ticketTypes, handleUpdate } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [type, setType] = React.useState();
  const [openDelete, toggleDelete] = React.useState(null);
  const [updateParams, setUpdateParams] = React.useState({});
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (customer && customer.type) {
      setType(customer.type ? customer.type : "Open");
    }
  }, [customer]);

  const openPopover = Boolean(anchorEl);
  const handleClick = (event) => {
    preventEvent(event);

    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event) => {
    preventEvent(event);
    setSearchQuery("");

    setAnchorEl(null);
  };

  const handleListItemClick = (event, taskType) => {
    preventEvent(event);

    event.stopPropagation();
    setUpdateParams({
      ticket_id: customer.ticket_id,
      type: taskType.ticket_type_desc,
    });
    toggleDelete(true);
    handlePopoverClose();
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    event.stopPropagation();
  };

  const filteredTicketTypes = ticketTypes.filter((taskType) =>
    taskType.ticket_type_desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <Tooltip title={`Type: ${type || 'Not Set'}`} placement="top">
      <Button
        color="default"
        onClick={handleClick}
        endIcon={openPopover ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      >
        <span className="text-dark font-weight-normal">{type}</span>
      </Button>
</Tooltip>
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          className: classes.paperHeight,
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

        <List>
          {filteredTicketTypes.length > 0 ? (
            filteredTicketTypes.map((taskType) => (
              <ListItem
                key={taskType.ticket_type_id}
                button
                onClick={(event) => handleListItemClick(event, taskType)}
              >
                {taskType.ticket_type_desc}
              </ListItem>
            ))
          ) : (
            <ListItem disabled>No matching ticket types</ListItem>
          )}
        </List>
      </Popover>

      {openDelete && (
        <DialogAlert
          open={openDelete}
          message={
            <span>
              The selected type has an existing template that will replace the
              ticket content.
              <br /> Are you sure you want to change the ticket type?
            </span>
          }
          buttonsList={[
            {
              label: "Yes",
              size: "medium",
              color: "primary",
              isProgress: true,
              onClick: (event) => {
                handleUpdate(updateParams);
                event.stopPropagation();
                setType(updateParams.type);
                toggleDelete(false);
              },
            },
            {
              label: "No",
              size: "medium",
              color: "default",
              onClick: (event) => {
                toggleDelete(false);
                event.stopPropagation();
              },
            },
          ]}
        />
      )}
    </>
  );
};

export default TicketType;
