import React from "react";
import { Box, Button, Grid, Modal, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import AssignmentType from "./components/AssignmentType";
import PriorityField from "./components/PriorityField";
import AssignmentFields from "./components/AssignmentFields";
import ProgressButton from "Common/ProgressButton";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
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
    <Modal
      open={true}
    // onClose={handleClose}
    >
      <Box sx={style}>
        <Grid container spacing={2}>
          <Grid item xs={12} className="bg-lighter" style={{ borderRadius: "5px 5px 0px 0px", padding: "10px 15px" }}>
            <Typography variant="h5" className="text-dark">Create Ticket</Typography>
          </Grid>
          <Grid container spacing={2} style={{ padding: "10px 15px" }}>
            <Grid item xs={5}>
              <Typography variant="subtitle1" className="f-14 text-dark">Assignment Type:</Typography>
            </Grid>
            <Grid item xs={7}>
              <AssignmentType {...commonProps} />
            </Grid>
            {values.category_type && <AssignmentFields {...commonProps} />}
            <Grid item xs={12}>
              <PriorityField {...commonProps} />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={"auto"}>
                  <Typography variant="subtitle1" className="f-14 text-dark">Ticket Type:</Typography>
                </Grid>
                <Grid item xs={"auto"}>
                  <Typography variant="subtitle1" className="f-14 text-dark">Sample</Typography>
                </Grid>
              </Grid>
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
  const initialValues = {
    category_type: "",
    priority: "Normal",
    ticketType: "Sample",
    equipment_id: 0,
    location_id: 0,
    customer_id: 0,
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

export default AddTicket;