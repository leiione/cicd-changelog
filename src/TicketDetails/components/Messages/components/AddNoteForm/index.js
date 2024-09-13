import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@mui/material";
import EditorContainer from "components/EditorContainer";
import ProgressButton from "Common/ProgressButton";
import HookCheckbox from "Common/hookFields/HookCheckbox";
import { ADD_NEW_TICKET_NOTE } from "TicketDetails/TicketGraphQL";
import { useMutation } from "@apollo/client";
import { GET_TICKET_NOTES } from "./../../../../TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";

const AddNoteFields = (props) => {
  const { form, handleCancel, onSubmit } = props;
  const {
    control,
    setValue,
    watch,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const values = watch();

  const handleMessageChange = (content) => {
    setValue("note", content, { shouldValidate: true });
  };

  const isFormValid = React.useMemo(() => values.note, [values]);

  return (
    <div className="position-relative">
      <div
        style={{
          position: "absolute",
          right: "15px",
          zIndex: 99,
          top: 4,
        }}
      >
        <HookCheckbox
          control={control}
          name={"flag_internal"}
          label={"Mark as Private"}
        />
      </div>
      <EditorContainer
        content={values.message}
        setContent={handleMessageChange}
        disabled={isSubmitting}
      />
      <div className="text-right">
        <ProgressButton
          color="primary"
          variant="outlined"
          onClick={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          disabled={!isFormValid || isSubmitting}
        >
          Save
        </ProgressButton>
        <Button color="default" variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

const AddNoteForm = (props) => {
  const { ticket, handleCancel } = props;
  const [addTicketNote] = useMutation(ADD_NEW_TICKET_NOTE);
  const dispatch = useDispatch();

  const initialValues = React.useMemo(() => {
    return {
      note: "",
      flag_internal: false,
      ticket_id: ticket.id,
    };
  }, [ticket]);

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
        note: values.note,
        flag_internal: values.flag_internal,
      };

      await addTicketNote({
        variables,
        refetchQueries: [
          {
            query: GET_TICKET_NOTES,
            variables: { ticket_id: ticket.ticket_id },
          },
        ],
        update: (cache, { data }) => {
          dispatch(
            showSnackbar({
              message: "Note Added Successfully",
              severity: "success",
            })
          );
        },
      });
      handleCancel();
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "");
      dispatch(showSnackbar({ message: msg, severity: "error" }));
    }
  };

  return (
    <AddNoteFields
      form={form}
      ticket={ticket}
      handleCancel={handleCancel}
      onSubmit={onSubmit}
    />
  );
};

export default AddNoteForm;
