import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Divider, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import EditorContainer from "components/EditorContainer";
import ProgressButton from "Common/ProgressButton";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_NEW_TICKET_EMAIL,
  GET_TICKET_MESSAGES,
  GET_TICKET,
  GET_ACTIVITIES,
  GET_EMAIL_TEMPLATES
} from "TicketDetails/TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import HookTypeAheadEmailField from "Common/hookFields/HookTypeAheadEmailField";
import FileUploadPreview from "components/FileUploadPreview";
import { readFileAsBase64 } from "Common/helper";
import Files from "react-files";
import { acceptedFormats, maxFileSize } from "Common/constants";
import { AttachFile } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { checkIfCacheExists } from "config/apollo";
import ErrorPage from "components/ErrorPage";
import Loader from "components/Loader";
import { includes } from "lodash";

const defaultMoreFields = ["Cc", "Bcc"];

const AddEmailFields = (props) => {
  const dispatch = useDispatch();
  const { ticket, form, handleCancel, onSubmit, templates } = props;
  const {
    control,
    setValue,
    watch,
    formState: { isSubmitting },
    handleSubmit,
  } = form;
  const [moreFields, setMoreFields] = React.useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const values = watch();
  const attachFiles = async (files) => {
    let newAttachments = [];
    for (let file of files) {
      const fileData = await readFileAsBase64(file);
      newAttachments.push({ file: fileData, filename: file.name })
    };
    setValue("attachments", [
      ...(values.attachments || []),
      ...newAttachments
    ]);
  };


  const handleFileChange = (files) => {
    const newFiles = Array.from(files);
    const existingFileNames = new Set(selectedFiles.map((file) => file.name));

    const filteredNewFiles = newFiles.filter(
      (file) => !existingFileNames.has(file.name)
    );

    const updatedFiles = [...selectedFiles, ...filteredNewFiles];
    setSelectedFiles(updatedFiles);
    attachFiles(filteredNewFiles)
  };

  const removeFile = (fileName) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  const handleError = (error, file) => {
    let errorMessage = error.message;

    if (error.code === "file-invalid-type") {
      errorMessage =
        "Invalid file format. We support only image files, PDFs, and ZIP files.";
    }
    if (error.code === "file-too-large") {
      errorMessage = "File is too large. Maximum file size is 12MB.";
    }
    if (error.code === "too-many-files") {
      errorMessage = "You can upload a maximum of 4 files at a time.";
    }

    dispatch(
      showSnackbar({
        message: errorMessage,
        severity: "error",
      })
    );
  };


  const handleMessageChange = (content) => {
    setValue("message", content, { shouldValidate: true });
  };

  const handleSelectedTemplate = (template) => {
    setValue("subject", template.template_subject);
    if (template.template_cc) {
      setMoreFields([...moreFields, 'Cc'])
      const ccTemp = template.template_cc.split(",").map((item, index) => ({ id: index, cc: item, customOption: true }));
      setValue("cc", ccTemp);
    } else {
      setValue("cc", []);
    }
  }

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
      <Grid item xs={12} style={{ textAlign: "end", margin: "-10px 0px" }}>
        <div style={{ position: "absolute", right: "24px", zIndex: 99, padding: "17px 3px" }}>
          <Tooltip title="Attach File">
            <Files
              className="files-dropzone"
              onError={handleError}
              onChange={handleFileChange}
              accepts={acceptedFormats}
              multiple
              clickable
              maxFileSize={maxFileSize}
            >
              <IconButton aria-label="attachment" className="primary-on-hover">
                <AttachFile className="primary-on-hover" />
              </IconButton>
            </Files>
          </Tooltip>
        </div>
      </Grid>
      <Grid item xs={12} className="mt-1">
        <EditorContainer
          ticket={ticket}
          content={values.message}
          setContent={handleMessageChange}
          background={"#fcefef"}
          disabled={isSubmitting}
          isSusbcriber={ticket.subscriber && ticket.subscriber.customer_id > 0}
          templates={templates}
          handleSelectedTemplate={handleSelectedTemplate}
        />
      </Grid>
      <Grid item xs={12} style={{ padding: '5px 0px' }}>
        <FileUploadPreview
          selectedFiles={selectedFiles}
          removeFile={removeFile}
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
    </Grid >
  );
};

const AddEmailForm = (props) => {
  const dispatch = useDispatch();
  const isp_id = Number(useSelector(state => state.ispId))
  const { ticket, handleCancel, replyMessage } = props;
  const [sendTicketEmail] = useMutation(ADD_NEW_TICKET_EMAIL);

  const { loading, error, data, client } = useQuery(GET_EMAIL_TEMPLATES, {
    variables: { isp_id },
    fetchPolicy: "cache-and-network",
    skip: !(ticket.subscriber && ticket.subscriber.customer_id > 0)
  });

  const cacheExists = checkIfCacheExists(client, {
    query: GET_EMAIL_TEMPLATES,
    variables: { isp_id },
  });

  const templates = useMemo(() => {
    let list = [];
    if ((!loading || cacheExists) && data && data.emailTemplates) {
      data.emailTemplates.forEach(item => {
        const flagSubscriberEmail = item.subscriber_email > "" && includes([0, "Y", "N"], item.custom_filter)
        if (item.isp_id === isp_id && !flagSubscriberEmail) {
          list.push({
            ...item,
            label: item.template_name,
            value: item.me_id,
          });
        }
      });
    }
    return list;
  }, [loading, data, cacheExists, isp_id]);

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
      attachments: [],
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
        attachments: values.attachments,
      };

      await sendTicketEmail({
        variables,
        refetchQueries: [
          {
            query: GET_TICKET_MESSAGES,
            variables: { ticket_id: ticket.ticket_id },
          },
          { query: GET_TICKET, variables: { id: ticket.ticket_id } },
          { query: GET_ACTIVITIES, variables: { ticket_id: ticket.ticket_id } },
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
                message: "Email was sent successfully",
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

  if (error) return <ErrorPage error={error} />
  if (loading && !cacheExists) return <Loader loaderStyle={{ textAlign: "center" }} />

  return (
    <AddEmailFields
      form={form}
      ticket={ticket}
      handleCancel={handleCancel}
      onSubmit={onSubmit}
      templates={templates}
    />
  );
};

export default React.memo(AddEmailForm);
