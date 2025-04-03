import React, { useState } from "react";
import {
  IconButton,
  MenuItem,
  Popover,
  Typography,
  Grid,
  MenuList,
  Button,
  Box,
  Modal
} from "@mui/material";
import ProgressButton from "Common/ProgressButton";
import { omit } from "lodash";
import { useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import AssignmentFields from "AddTicket/components/AssignmentFields";
import { useForm } from "react-hook-form";
import {
  GET_TICKET,
  GET_ACTIVITIES,
  UPDATE_TICKET_MUTATION,
} from "TicketDetails/TicketGraphQL";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 355,
  bgcolor: 'background.paper',
  borderRadius: "5px",
  padding: "16px 0px 0px 16px"
};

const ChangeTicketAssignment = (props) => {
  const dispatch = useDispatch();
  const {
    ticket,
    setTicketCached,
    editAssignment,
    setEditAssignment,
  } = props;

  const [assignmentTypeAnchorEl, setAssignmentTypeAnchorEl] = useState(null);
  const [selectedType, setSelectedType] = useState("Select Assignment Type"); // Initialize with default value

  const typeOptions = ["Subscriber", "Infrastructure", "Equipment"];

  let initialValues = {
    category_type: ticket.category_type 
  }
  let form = useForm({
    defaultValues: initialValues,
    mode: "onChange",
    reValidateMode: "onSubmit",
  });

  const {
    control,
    watch,
    setValue,
    reset, // Import reset to reset the entire form
    formState: { isSubmitting },
    handleSubmit
  } = form;
  const values = watch()

  const commonProps = {
    values,
    control,
    setValue
  }

  let isFormValid = selectedType !== "Select Assignment Type" && values.category_type && (values.location_id > 0 || values.equipment_id > 0 || values.customer_id > 0)
  const [updateTicket] = useMutation(UPDATE_TICKET_MUTATION);

  const onSubmit = async (values) => {
    try {
      values.ticket_id = ticket.ticket_id
      await updateTicket({
        variables: {
          input_ticket: omit(values, ['payment_status', 'subscriber']),
        },
        refetchQueries: [
          { query: GET_TICKET, variables: { id: ticket.ticket_id }
          },
          { query: GET_ACTIVITIES, variables: { ticket_id: ticket.ticket_id }
          },
        ],
      });
      dispatch(showSnackbar({ message: "Ticket updated successfully", severity: "success" }))
      handleAssignedNamePopoverClose()
      setTicketCached({ ...ticket, ...values })
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "")
      dispatch(showSnackbar({ message: msg, severity: "error" }))
    }
  }

  const handleAssignedNamePopoverClose = () => {
    setSelectedType("Select Assignment Type");
    reset(); // Reset the entire form, clearing all values, including category_type
    setEditAssignment(false);
  };

  return (
    <Modal open={editAssignment}>
      <Box sx={style}>
        <Grid container spacing={2}>
        <Grid item xs={12} className="bg-lighter" style={{ borderRadius: "5px 5px 0px 0px", padding: "7px 15px" }}>
          <Typography variant="h6" className="text-dark">Change Assignment</Typography>
        </Grid>
        <Grid container spacing={2} style={{ padding: "20px 15px" }}>
          <Grid item xs={5}>
            <Typography variant="subtitle1" className="text-dark">
              Assignment Type:
            </Typography>
          </Grid>
          <Grid item xs={7}>
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" className="text-muted">
                {selectedType}
              </Typography>
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
            </Box>
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
                        setValue("category_type", type)
                        setAssignmentTypeAnchorEl(null)
                        setSelectedType(type)
                      }}
                    >
                      {type}
                    </MenuItem>
                  ))}
                </MenuList>
              </Popover>
            )}
          </Grid>
          {selectedType !== "Select Assignment Type" ? <AssignmentFields {...commonProps} /> : ''}
        </Grid>
        <Grid item xs={12}>
          <div className="text-right">
            <ProgressButton
              variant="outlined"
              color="primary"
              size="small"
              style={{ padding: "5px" }}
              onClick={handleSubmit(onSubmit)}
              isSubmitting={isSubmitting}
              disabled={!isFormValid}
            >
              Save
            </ProgressButton>
            <Button color="default" variant="outlined" size="small" style={{ padding: "5px" }} onClick={handleAssignedNamePopoverClose}>
              Cancel
            </Button>
          </div>
        </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ChangeTicketAssignment;
