import React from "react";
import { useForm } from "react-hook-form";
import { Button, Divider, Grid, Typography } from "@mui/material";
import HookTextField from "Common/hookFields/HookTextField";
import EditorContainer from "components/EditorContainer";
import ProgressButton from "Common/ProgressButton";
import HookCheckbox from "Common/hookFields/HookCheckbox";

const defaultMoreFields = ["Cc", "Bcc"]

const AddEmailFields = props => {
  const { form, handleCancel, onSubmit } = props
  const {
    control,
    setValue,
    watch,
    formState: { isSubmitting },
    handleSubmit
  } = form
  const [moreFields, setMoreFields] = React.useState([])

  const values = watch()

  const handleMessageChange = (content) => {
    setValue("message", content, { shouldValidate: true })
  }

  return (
    <Grid container spacing={1} style={{ padding: "0px 10px 10px" }}>
      <Grid item xs={9} style={{ display: "inline-flex" }}>
        <Typography variant="subtitle1">To: </Typography>
        <HookTextField
          label=""
          name="to"
          required
          control={control}
          InputProps={{ disableUnderline: true }}
          style={{ margin: "-2px 5px" }}
        />
      </Grid>
      <Grid item xs={3} style={{ textAlign: "end" }}>
        <div style={{ display: "inline-flex" }}>
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
              )
            }
            return null
          })}
        </div>
      </Grid>
      {moreFields.map((item, index) => (
        <>
          <Divider style={{ width: "100%", marginLeft: "10px" }} />
          <Grid item xs={12} key={index} style={{ display: "inline-flex" }}>
            <Typography variant="subtitle1">{`${item}: `}</Typography>
            <HookTextField
              label=""
              name={item.toLowerCase()}
              control={control}
              InputProps={{ disableUnderline: true }}
              style={{ margin: "-2px 5px" }}
            />
          </Grid>
        </>
      ))}
      <Divider style={{ width: "100%", marginLeft: "10px" }} />
      <Grid item xs={12}>
        <Typography variant="subtitle1">{`Subject: ${values.subject}`}</Typography>
      </Grid>
      <Divider style={{ width: "100%", marginLeft: "10px" }} />
      <Grid item xs={12} style={{ textAlign: "end", margin: "-10px 0px" }}>
        <div style={{ position: "absolute", right: "38px", zIndex: 99, padding: "13px 3px" }}>
          <HookCheckbox
            control={control}
            name={"flag_internal"}
            label={"Mark as Private"}
          />
        </div>
      </Grid>
      <Grid item xs={12}>
        <EditorContainer
          content={values.message}
          setContent={handleMessageChange}
          background={"#fcefef"}
        />
      </Grid>
      <Grid item xs={12} style={{ textAlign: "end", marginTop: "-10px" }}>
        <ProgressButton
          color="primary"
          size="small"
          onClick={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
        // disabled={!isFormValid}
        >
          Save
        </ProgressButton>
        <Button color="default" size="small" style={{ padding: "5px" }} onClick={handleCancel}>
          Cancel
        </Button>
      </Grid>
    </Grid>
  )
}

const AddEmailForm = props => {
  const { ticket, handleCancel } = props

  const initialValues = React.useMemo(() => ({
    to: ticket.ticket_contact_email || "",
    cc: "",
    bcc: "",
    subject: ticket.description,
    message: "",
    flag_internal: false
  }), [ticket])

  const form = useForm({
    defaultValues: initialValues,
    // resolver: yupResolver(validationSchemaSubLocation),
    mode: "onChange",
    reValidateMode: "onSubmit"
  });

  const onSubmit = values => {
    console.log("saveeeeeee", values)
  }

  return (
    <AddEmailFields
      form={form}
      ticket={ticket}
      handleCancel={handleCancel}
      onSubmit={onSubmit}
    />
  )
}

export default AddEmailForm;