import React from "react";
import { Box, Button, Grid, Modal, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import AssignmentType from "./components/AssignmentType";
import PriorityField from "./components/PriorityField";
import AssignmentFields from "./components/AssignmentFields";
import ProgressButton from "Common/ProgressButton";
import TicketTypeField from "./components/TicketTypeField";

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

const AddTicketForm = props => {
  const { form, hideContentDrawer } = props;
  const { control, watch, setValue } = form;
  const values = watch()
  const commonProps = {
    values,
    control,
    setValue
  }

  return (
    <Modal open={true}    >
      <Box sx={style}>
        <Grid container spacing={2}>
          <Grid item xs={12} className="bg-lighter" style={{ borderRadius: "5px 5px 0px 0px", padding: "7px 15px" }}>
            <Typography variant="h6" className="text-dark">Create Ticket</Typography>
          </Grid>
          <Grid container spacing={2} style={{ padding: "20px 15px" }}>
            <Grid item xs={5}>
              <Typography variant="subtitle1" className="text-dark">Assignment Type:</Typography>
            </Grid>
            <Grid item xs={7}>
              <AssignmentType {...commonProps} />
            </Grid>
            {values.category_type && <AssignmentFields {...commonProps} />}
            <Grid item xs={12}>
              <PriorityField {...commonProps} />
            </Grid>
            <Grid item xs={12}>
              <TicketTypeField {...commonProps} />
            </Grid>
            <Grid item xs={12}>
              <div className="text-right">
                <ProgressButton
                  variant="outlined"
                  color="primary"
                  size="small"
                  style={{ padding: "5px" }}
                  onClick={() => hideContentDrawer()}
                // isSubmitting={isSubmitting}
                >

                  Create
                </ProgressButton>
                <Button color="default" variant="outlined" size="small" style={{ padding: "5px" }} onClick={() => hideContentDrawer()}>
                  Cancel
                </Button>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

const AddTicket = (props) => {
  const { ticket } = props;
  let initialValues = {
    category_type: "",
    priority: "Normal",
    ticket_type_id: 0,
    equipment_id: 0,
    location_id: 0,
    customer_id: 0,
  }

  if (ticket && ticket.initSelectedCustId > 0) {
    initialValues = {
      ...initialValues,
      customer_id: ticket.initSelectedCustId,
      category_type: 'Subscriber',
      initSelected: {
        value: ticket.initSelectedCustId,
        customer_id: ticket.initSelectedCustId,
        label: `${ticket.first_name} ${ticket.last_name}`
      }
    }
  }
  let form = useForm({
    defaultValues: initialValues,
    mode: "onChange",
    reValidateMode: "onSubmit",
  });

  return (
    <AddTicketForm form={form} {...props} />
  );
}

export default React.memo(AddTicket);