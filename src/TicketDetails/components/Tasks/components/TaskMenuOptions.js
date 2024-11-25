import React from "react";
import PropTypes from 'prop-types';
import { IconButton, MenuItem, Popover } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { preventEvent } from "../../../../Common/helper";
import { cloneDeep } from "lodash";
import DialogAlert from "components/DialogAlert";

const TaskMenuOptions = (props) => {
  const { show, task, ticketTasks, setTicketTasks, onSaveTaskChanges, handleOpenTicket, disabled, setOnEditMode, onEdit } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openAlert, setOpenAlert] = React.useState(null);
  const [isSubmitting] = React.useState(null);

  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    preventEvent(event);
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = (event) => {
    preventEvent(event);
    setAnchorEl(null);
  };

  const onDeleteTask = () => {
    let newTasks = cloneDeep(ticketTasks)
    newTasks = newTasks.filter(x => x.task_id !== task.task_id)
    setTicketTasks(newTasks);
    if (task.task_id > 0) {
      onSaveTaskChanges(newTasks)
    }
    setOnEditMode({ index: -1, value: '' })
  }

  const onOpenAlert = (action) => {
    if (task.task_id > 0) {
      setOpenAlert(action);
    } else {
      onDeleteTask()
    }
  }

  const onConvertTask = async () => {
    handleOpenTicket({ ...task, description: task.task }, "microservice");
  }

  const handleEdit = () => {
    onEdit()
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton color="default" onClick={handleClick}>
        <MoreVert style={!show ? { visibility: "hidden" } : {}} />
      </IconButton>
      {openMenu && task.converted_ticket_id == null &&
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
          <MenuItem onClick={onConvertTask} disabled={disabled}> Convert to ticket</MenuItem>
          {!task.is_default &&
            <>
              <MenuItem onClick={handleEdit}> Edit</MenuItem>
              <MenuItem onClick={() => onOpenAlert("delete")}> Delete</MenuItem>
            </>
          }
        </Popover>
      }
      {openAlert && (
        <DialogAlert
          open={openAlert}
          message={`Are you sure you want to ${openAlert === "delete" ? 'delete this task' : 'convert this to a ticket'} ?`}
          buttonsList={[
            {
              label: "Yes",
              size: "medium",
              color: "primary",
              isProgress: true,
              isSubmitting,
              onClick: () => openAlert === "delete" ? onDeleteTask() : onConvertTask(),
            },
            {
              label: "No",
              size: "medium",
              color: "default",
              disabled: isSubmitting,
              onClick: () => setOpenAlert(null),
            },
          ]}
        />
      )}
    </>
  );
}

TaskMenuOptions.propTypes = {
  show: PropTypes.bool.isRequired,
  task: PropTypes.object.isRequired,
  ticketTasks: PropTypes.array.isRequired,
  setTicketTasks: PropTypes.func.isRequired,
  onSaveTaskChanges: PropTypes.func.isRequired,
  handleOpenTicket: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  setOnEditMode: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default React.memo(TaskMenuOptions);
