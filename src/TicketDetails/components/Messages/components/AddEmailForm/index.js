import React from "react";
import { useForm } from "react-hook-form";
import { Button, Divider, Grid, Typography } from "@mui/material";
import EditorContainer from "components/EditorContainer";
import ProgressButton from "Common/ProgressButton";
import { useMutation } from "@apollo/client";
import {
  ADD_NEW_TICKET_EMAIL,
  GET_TICKET_MESSAGES,
  GET_TICKET,
} from "TicketDetails/TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import HookTypeAheadEmailField from "Common/hookFields/HookTypeAheadEmailField";

const defaultMoreFields = ["Cc", "Bcc"];

const AddEmailFields = (props) => {
  const { form, handleCancel, onSubmit } = props;
  const {
    control,
    setValue,
    watch,
    formState: { isSubmitting },
    handleSubmit,
  } = form;
  const [moreFields, setMoreFields] = React.useState([]);

  const values = watch();

  const handleMessageChange = (content) => {
    setValue("message", content, { shouldValidate: true });
  };

  const isFormValid = React.useMemo(
    () =>
      values.to.length > 0 &&
      values.message &&
      !values.toFreeFieldText &&
      !values.ccFreeFieldText &&
      !values.bccFreeFieldText,
    [values]
  );

  return (
    <Grid container spacing={0} style={{ padding: "0px 10px 10px" }}>
      <Grid item xs={9} style={{ display: "inline-flex" }}>
        <Typography variant="subtitle1" style={{ margin: "7px 10px 0px 0px" }}>
          To:{" "}
        </Typography>
        <HookTypeAheadEmailField
          control={control}
          name="to"
          labelKey="to"
          setValue={setValue}
          errorFieldFreeText="toFreeFieldText"
        />
      </Grid>
      <Grid item xs={3} style={{ textAlign: "end" }}>
        <div style={{ display: "inline-flex", marginTop: "7px" }}>
          {defaultMoreFields.map((item, index) => {
            if (!moreFields.includes(item)) {
              return (
                <Typography
                  variant="subtitle1"
                  style={{ paddingLeft: "4px", cursor: "pointer" }}
                  key={index}
                  onClick={() => setMoreFields([...moreFields, item])}
                >
                  {item}
                </Typography>
              );
            }
            return null;
          })}
        </div>
      </Grid>
      {moreFields.map((item, index) => (
        <>
          <Divider style={{ width: "100%" }} />
          <Grid item xs={12} key={index} style={{ display: "inline-flex" }}>
            <Typography
              variant="subtitle1"
              style={{ margin: "7px 10px 0px 0px" }}
            >{`${item}: `}</Typography>
            <HookTypeAheadEmailField
              control={control}
              name={item.toLowerCase()}
              labelKey={item.toLowerCase()}
              setValue={setValue}
              errorFieldFreeText={`${item.toLowerCase()}FreeFieldText`}
            />
          </Grid>
        </>
      ))}
      <Divider style={{ width: "100%" }} />
      {/* <Grid item xs={12}>
        <Typography variant="subtitle1">{`Subject: ${values.subject}`}</Typography>
      </Grid> 
      <Divider style={{ width: "100%", marginLeft: "10px" }} /> 
      */}
      {/* <Grid item xs={12} style={{ textAlign: "end", margin: "-10px 0px" }}>
        <div style={{ position: "absolute", right: "38px", zIndex: 99, padding: "23px 3px" }}>
          <HookCheckbox
            control={control}
            name={"flag_internal"}
            label={"Mark as Private"}
          />
        </div>
      </Grid> */}
      <Grid item xs={12} style={{ marginTop: "10px" }}>
        <EditorContainer
          content={values.message}
          setContent={handleMessageChange}
          background={"#fcefef"}
          disabled={isSubmitting}
        />
      </Grid>
      <Grid item xs={12} textAlign={"right"}>
        <ProgressButton
          color="primary"
          variant="outlined"
          onClick={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          disabled={!isFormValid || isSubmitting}
        >
          Send
        </ProgressButton>
        <Button color="primary" variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
      </Grid>
    </Grid>
  );
};

const AddEmailForm = (props) => {
  const dispatch = useDispatch();
  const { ticket, handleCancel, replyMessage } = props;
  const [sendTicketEmail] = useMutation(ADD_NEW_TICKET_EMAIL);

  const initialValues = React.useMemo(() => {
    const toEmail = [];
    if (replyMessage.recipient && replyMessage.recipient.length > 0) {
      replyMessage.recipient.forEach((email) => {
        toEmail.push({ to: email, customOption: true });
      });
    } else {
      const contactEmail = ticket.ticket_contact_email
        ? ticket.ticket_contact_email.split(",")
        : [];
      contactEmail.forEach((email) => {
        toEmail.push({ to: email, customOption: true });
      });
    }

    return {
      to: toEmail,
      cc: [],
      bcc: [],
      subject: `[Ticket#${ticket.ticket_id}] ${ticket.description}`,
      message: replyMessage ? replyMessage.message : "",
      flag_internal: false,
    };
  }, [ticket, replyMessage]);

  const form = useForm({
    defaultValues: initialValues,
    // resolver: yupResolver(validationSchemaSubLocation),
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
        cc: values.cc
          .map((item) => item.cc)
          .join(",")
          .replace(/ /g, ""),
        bcc: values.bcc
          .map((item) => item.bcc)
          .join(",")
          .replace(/ /g, ""),
        message: values.message,
        customer_id: ticket.customer_id || 0,
        subject: values.subject,
        flag_internal: values.flag_internal,
      };
      await sendTicketEmail({
        variables,
        refetchQueries: [
          {
            query: GET_TICKET_MESSAGES,
            variables: { ticket_id: ticket.ticket_id },
          },
          { query: GET_TICKET, variables: { id: ticket.ticket_id } },
        ],
        update: (cache, { data }) => {
          if (
            data.sendTicketEmail &&
            data.sendTicketEmail.status === "failed"
          ) {
            dispatch(
              showSnackbar({
                message: "Email failed to send.",
                severity: "error",
              })
            );
          } else {
            dispatch(
              showSnackbar({
                message: "Email was sent successdully.",
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
    <AddEmailFields
      form={form}
      ticket={ticket}
      handleCancel={handleCancel}
      onSubmit={onSubmit}
    />
  );
};

export default React.memo(AddEmailForm);
