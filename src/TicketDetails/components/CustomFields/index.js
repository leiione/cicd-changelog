import React, { useEffect, useState } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "../../../components/HeaderMenuOptions";
import {
  TextField,
  Grid,
  CircularProgress,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import {
  CUSTOM_FIELD_SUBSCRIPTION,
  GET_TICKET_CUSTOM_FIELDS,
  SAVE_TICKET_CUSTOM_FIELDS,
} from "TicketDetails/TicketGraphQL";

import ProgressButton from "Common/ProgressButton";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";

const CustomFields = (props) => {
  const { appuser_id, ticket,setRequiredCustomFieldsCount } = props;
  const [isSubmitting, setisSubmitting] = useState(false);
  const dispatch = useDispatch();

  const [saveTicketCustomFields] = useMutation(SAVE_TICKET_CUSTOM_FIELDS);
  const { data, loading, error, refetch } = useQuery(GET_TICKET_CUSTOM_FIELDS, {
    variables: { ticketId: ticket.ticket_id },
    fetchPolicy: "network-only",
    skip: !ticket.ticket_id,
  });


  useSubscription(CUSTOM_FIELD_SUBSCRIPTION, {
    variables: { ticket_id: ticket.ticket_id },
    onData: async ({ data: { data }, client }) => {
      refetch();
    },
  });


  const form = useForm({
    defaultValues: {},
    mode: "onChange",
    reValidateMode: "onSubmit",
  });

  const [initialValues, setInitialValues] = useState({});
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (data && data.ticketCustomFields) {
      const initialValues = data.ticketCustomFields.reduce((acc, field) => {
        const fieldId =
          field.field_id != null
            ? field.field_id.toString()
            : `tmp_${field.field_label}`;
        acc[fieldId] = field.field_value || "";
        return acc;
      }, {});
      setInitialValues(initialValues);
      form.reset(initialValues);
      const requiredCount = data.ticketCustomFields.filter(field => field.is_required && field.field_value === "" ).length;
      setRequiredCustomFieldsCount(requiredCount);
    }
  }, [data, form, setRequiredCustomFieldsCount]);

  useEffect(() => {
    if (isVisible && ticket.ticket_id) {
      refetch(); // Trigger the query when the view becomes visible
    }
  }, [isVisible, ticket.ticket_id, refetch]);

  const handleVisibilityChange = () => {
    // Example visibility tracking logic; replace with your actual implementation
    setIsVisible(document.visibilityState === "visible");
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleCancel = () => {
    form.reset(initialValues);
  };

  const onSubmit = async (formData) => {
    setisSubmitting(true);

    const preparedData = Object.keys(formData).map((key) => {
      const field = data.ticketCustomFields.find((field) => {
        const fieldId =
          field.field_id != null
            ? field.field_id.toString()
            : `tmp_${field.field_label}`;
        return fieldId === key;
      });

      return {
        ticket_id: ticket.ticket_id,
        field_value: formData[key],
        field_label: field.field_label,
        field_id: key.startsWith("tmp_") ? null : parseInt(key, 10),
      };
    });

    try {
      await saveTicketCustomFields({
        variables: {
          inputCustomField: preparedData,
          ticketId: ticket.ticket_id,
        },
        refetchQueries: [
          {
            query: GET_TICKET_CUSTOM_FIELDS,
            variables: { ticketId: ticket.ticket_id },
          },
        ],
        update: (cache, { data }) => {
          dispatch(
            showSnackbar({
              message: "Custom Fields Saved Successfully",
              severity: "success",
            })
          );
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <AccordionCard
      label="Custom Fields"
      menuOption={
        <HeaderMenuOptions
          appuser_id={appuser_id}
          category="Custom Fields Card"
        />
      }
    >
      {loading && (
        <Grid container justifyContent="center" style={{ marginTop: "16px" }}>
          <CircularProgress />
        </Grid>
      )}
      {error && (
        <Typography color="error" align="center">
          Failed to load custom fields. Please try again.
        </Typography>
      )}
      {!loading && data && data.ticketCustomFields?.length > 0 ? (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {data.ticketCustomFields.map((field) => {
              const fieldId =
                field.field_id != null
                  ? field.field_id.toString()
                  : `tmp_${field.field_label}`;
              return (
                <Grid item xs={3} key={fieldId}>
                  <TextField
                    fullWidth
                    required={field.is_required}
                    id={`field-${fieldId}`}
                    label={field.field_label}
                    variant="standard"
                    value={form.watch(fieldId) || ""}
                    {...form.register(fieldId)}
                  />
                </Grid>
              );
            })}
          </Grid>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <ProgressButton
              color="primary"
              variant="outlined"
              onClick={form.handleSubmit(onSubmit)}
              isSubmitting={isSubmitting}
              disabled={!form.formState.isDirty || isSubmitting}
            >
              Save
            </ProgressButton>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              disabled={!form.formState.isDirty}
              style={{ marginLeft: "8px" }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      ) : (
        !loading &&
        !error && (
          <Typography align="center" style={{ marginTop: "16px" }}>
            No custom fields available for this ticket.
          </Typography>
        )
      )}
    </AccordionCard>
  );
};

export default CustomFields;
