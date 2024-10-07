import React from "react";
import { useForm } from "react-hook-form";
import { Button, Divider, Grid, Typography } from "@mui/material";
import ProgressButton from "Common/ProgressButton";
import HookCheckbox from "Common/hookFields/HookCheckbox";
import { useMutation } from "@apollo/client";
import {
  ADD_NEW_TICKET_SMS,
  GET_TICKET_MESSAGES,
  GET_TICKET,
} from "TicketDetails/TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import h2p from "html2plaintext";
import HookTypeAheadSMSField from "Common/hookFields/HookTypeAheadSMSField";

const AddSMSFields = (props) => {
  const { form, handleCancel, onSubmit, recipient } = props;
  const {
    control,
    setValue,
    watch,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const values = watch();

  React.useEffect(() => {
    if (recipient) {
      setValue("to", [{ to: recipient, customOption: true }], {
        shouldValidate: true,
      });
    }
  }, [recipient, setValue]);

  const handleMessageChange = (event) => {
    const newValue = event.target.value;
    if (newValue.length <= 160) {
      setValue("message", newValue, { shouldValidate: true });
    }
  };

  const isFormValid = React.useMemo(
    () => values.to.length > 0 && values.message && !values.toFreeFieldText,
    [values]
  );

  return (
    <Grid container spacing={0} style={{ padding: "0px 10px 10px" }}>
      <Grid item xs={9} style={{ display: "inline-flex" }}>
        <Typography variant="subtitle1" style={{ margin: "7px 10px 0px 0px" }}>
          To:
        </Typography>
        <HookTypeAheadSMSField
          control={control}
          name="to"
          labelKey="to"
          setValue={setValue}
          errorFieldFreeText="toFreeFieldText"
        />
      </Grid>
      <Divider style={{ width: "100%" }} />

      <Grid item xs={12} style={{ textAlign: "end", margin: "-10px 0px" }}>
        <HookCheckbox
          control={control}
          name={"flag_internal"}
          label={"Mark as Private"}
          style={{ margin: "10px 0" }}
        />
      </Grid>
      <Grid item xs={12} className="mt2">
        <textarea
          value={values.message}
          onChange={handleMessageChange}
          placeholder="Add Text Here...."
          style={{
            width: "100%",
            height: "160px",
            backgroundColor: "#fcefef",
            fontSize: "12px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            resize: "none",
          }}
          disabled={isSubmitting}
        />
      </Grid>
      <Grid item xs={6} alignItems={"left"}>
        <Typography
          variant="caption"
          style={{ display: "block", textAlign: "left", marginTop: "5px" }}
        >
          {values.message.length}/160
        </Typography>
      </Grid>
      <Grid item xs={6} textAlign={"right"}>
        <ProgressButton
          color="primary"
            variant="outlined"
          onClick={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          disabled={!isFormValid || isSubmitting}
        >
          Send
        </ProgressButton>
        <Button
          color="default" 
          variant="outlined"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </Grid>
    </Grid>
  );
};

const AddSMSForm = (props) => {
  const dispatch = useDispatch();
  const { ticket, handleCancel, recipient } = props;
  const [sendTicketSMS] = useMutation(ADD_NEW_TICKET_SMS);

  const initialValues = React.useMemo(() => {
    let toSMS = [];
    if (recipient) {
      toSMS.push({ to: recipient, customOption: true });
    } else {
      const contactSMS = ticket.ticket_contact_numbers
        ? ticket.ticket_contact_numbers.split(",")
        : [];
      contactSMS.forEach((SMS) => {
        let cleanedSMS = SMS.replace(/[^\d]/g, ""); // Allow only numbers
        if (cleanedSMS.length > 10) {
          cleanedSMS = cleanedSMS.slice(0, 10); // Limit to 10 digits
        }
        toSMS.push({ to: cleanedSMS, customOption: true });
      });
    }

    return {
      to: toSMS,
      subject: `[Ticket#${ticket.ticket_id}] ${ticket.description}`,
      message: "",
      flag_internal: false,
    };
  }, [ticket, recipient]);

  const form = useForm({
    defaultValues: initialValues,
    mode: "onChange",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (values) => {
    try {
      const variables = {
        ticket_id: ticket.ticket_id,
        to: values.to
          .map((item) => item.to)
          .join(",")
          .replace(/ /g, ""),
        message: h2p(values.message),
        customer_id: ticket.customer_id || 0,
        subject: values.subject,
        flag_internal: values.flag_internal,
      };
      await sendTicketSMS({
        variables,
        refetchQueries: [
          {
            query: GET_TICKET_MESSAGES,
            variables: { ticket_id: ticket.ticket_id },
          },
          { query: GET_TICKET, variables: { id: ticket.ticket_id } },
        ],
        update: (cache, { data }) => {
          if (data.sendTicketSMS && data.sendTicketSMS.status === "failed") {
            dispatch(
              showSnackbar({
                message: "SMS failed to send.",
                severity: "error",
              })
            );
          } else {
            dispatch(
              showSnackbar({
                message: "SMS was sent successfully.",
                severity: "success",
              })
            );
          }
        },
      });
      handleCancel();
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "");
      dispatch(showSnackbar({ message: msg, severity: "error" }));
    }
  };

  return (
    <AddSMSFields
      form={form}
      ticket={ticket}
      handleCancel={handleCancel}
      onSubmit={onSubmit}
      recipient={recipient}
    />
  );
};

export default AddSMSForm;
