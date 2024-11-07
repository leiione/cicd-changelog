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
  Button,
  Box
} from "@mui/material";
import ProgressButton from "Common/ProgressButton";
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
import AssignmentFields from "../../AddTicket/components/AssignmentFields";
import { useForm } from "react-hook-form";
import {
  GET_TICKET,
  GET_ACTIVITIES,
  GET_TICKET_ATTACHMENTS,
  UPDATE_TICKET_MUTATION,
} from "TicketDetails/TicketGraphQL";

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
    toggleOffCRMDrawer
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const [assignmentTypeAnchorEl, setAssignmentTypeAnchorEl] = useState(null);
  const [openDelete, toggleDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copyTicket, setCopyTicket] = useState(false);
  
  const [assignedNamePopover, setAssignedNamePopover] = useState(null);
  const [selectedType, setSelectedType] = useState("Select Assignment Type"); // Initialize with default value

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
    setAssignedNamePopover(event.currentTarget);
  };

  const handleAssignedNamePopoverClose = () => {
    setAssignedNamePopover(null);
  };

  setTimeout(() => {
    setCopyTicket(false);
  }, 4000);

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
    formState: { isSubmitting },
    handleSubmit
  } = form;
  const values = watch()

  const commonProps = {
    values,
    control,
    setValue
  }

  let isFormValid = values.category_type && (values.location_id > 0 || values.equipment_id > 0 || values.customer_id > 0)
  const [updateTicket] = useMutation(UPDATE_TICKET_MUTATION);

  const onSubmit = async (values) => {
    try {
      values.ticket_id = ticket.ticket_id
      await updateTicket({
        variables: {
          input_ticket: values,
        },
        refetchQueries: [
          { query: GET_TICKET, variables: { id: ticket.ticket_id }
          },
          { query: GET_TICKET_ATTACHMENTS, variables: { ticket_id: ticket.ticket_id }
          },
          { query: GET_ACTIVITIES, variables: { ticket_id: ticket.ticket_id }
          },
        ],
      });
      dispatch(showSnackbar({ message: "Ticket updated successfully", severity: "success" }))
      handleAssignedNamePopoverClose()
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "")
      dispatch(showSnackbar({ message: msg, severity: "error" }))
    }
  }

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
              onClick={handleAssignedNameClick}
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
                              // selected={type.toLowerCase() === ticket.category_type.toLowerCase()}
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
                    <Button color="default" variant="outlined" size="small" style={{ padding: "5px" }} onClick={() => handleAssignedNamePopoverClose()}>
                      Cancel
                    </Button>
                  </div>
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
