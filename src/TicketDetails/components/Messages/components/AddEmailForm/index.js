import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Divider, Grid, Typography } from "@mui/material";
import HookTextField from "Common/hookFields/HookTextField";
import EditorContainer from "components/EditorContainer";

const defaultMoreFields = ["Cc", "Bcc"]

const AddEmailFields = props => {
  const { form } = props
  const {
    control,
    setValue,
    watch,
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
      <Grid item xs={12}>
        <EditorContainer content={values.message} setContent={handleMessageChange} />
      </Grid>
    </Grid>
  )
}

const AddEmailForm = props => {
  const { ticket } = props

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

  useEffect(() => {
    form.reset(initialValues)
    // eslint-disable-next-line
  }, [ticket.ticket_id])

  return (
    <AddEmailFields form={form} ticket={ticket} />
  )
}

export default AddEmailForm;