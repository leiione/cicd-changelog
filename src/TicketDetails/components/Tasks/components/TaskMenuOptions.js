import React from "react";
import { IconButton, MenuItem, Popover } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { preventEvent } from "../../../../Common/helper";
import { cloneDeep, isEmpty, pick } from "lodash";
import DialogAlert from "components/DialogAlert";
import { useMutation } from "@apollo/client";
import { CONVERT_TAST_TO_TICKET } from "TicketDetails/TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";

const TaskMenuOptions = (props) => {
  const dispatch = useDispatch()
  const { show, task, ticketTasks, setTicketTasks, onSaveTaskChanges, ticket, handleOpenTicket, disabled, setOnEditMode, onEdit } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openAlert, setOpenAlert] = React.useState(null);
  const [isSubmitting, setSubmitting] = React.useState(null);
  const [convertTaskToTicket] = useMutation(CONVERT_TAST_TO_TICKET);

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
    setSubmitting(true)
    let input_ticket = {
      ...pick(ticket, [
        "category_type",
        "priority",
        "ticket_type_id",
        "equipment_id",
        "location_id",
        "assigned_name",
        "address",
        "type"
      ]),
      description: task.task,
      customer_id: ticket.subscriber ? ticket.subscriber.customer_id : 0,
      assignee_ids: ticket.assignees,
      ticket_contact_numbers: ticket.ticket_contact_numbers || '',
      ticket_contact_name: ticket.ticket_contact_name || '',
      ticket_contact_emails: ticket.ticket_contact_email || '',
      ticket_id: ticket.ticket_id,
    }
    input_ticket.followers = !isEmpty(ticket.followers) ? ticket.followers.split(",") : []
    try {
      await convertTaskToTicket({
        variables: { input_ticket },
        update: (cache, { data }) => {
          handleOpenTicket({ ...data.convertTaskToTicket })
        },
      });
      dispatch(showSnackbar({ message: "The task was converted to a ticket successfully", severity: "success" }))
      setSubmitting(false)
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "")
      dispatch(showSnackbar({ message: msg, severity: "error" }))
      setSubmitting(false)
    }
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
      {openMenu &&
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
          <MenuItem onClick={() => onOpenAlert("convert")} disabled={disabled}> Convert to ticket</MenuItem>
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
};
export default React.memo(TaskMenuOptions);
