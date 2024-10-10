import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { IconButton, Button, Tooltip, Grid } from "@mui/material";

import EditorContainer from "components/EditorContainer";
import ProgressButton from "Common/ProgressButton";
import {
  ADD_NEW_TICKET_NOTE,
  UPLOAD_FILE_MUTATION,
} from "TicketDetails/TicketGraphQL";
import { useMutation } from "@apollo/client";
import { GET_TICKET_NOTES, GET_TICKET } from "./../../../../TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import Files from "react-files";
import FileUploadPreview from "components/FileUploadPreview";
import { acceptedFormats, maxFileSize } from "Common/constants";
import { readFileAsBase64 } from "Common/helper";

// import Files from "react-files";

const AddNoteFields = (props) => {
  const { form, handleCancel, onSubmit, ticket } = props;
  const {
    setValue,
    watch,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const values = watch();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [filemapping, setFileMapping] = useState([]);
  const [uploadFile] = useMutation(UPLOAD_FILE_MUTATION);
  const dispatch = useDispatch();

  const handleFileChange = (files) => {
    const newFiles = Array.from(files);
    const existingFileNames = new Set(selectedFiles.map((file) => file.name));

    const filteredNewFiles = newFiles.filter(
      (file) => !existingFileNames.has(file.name)
    );

    const updatedFiles = [...selectedFiles, ...filteredNewFiles];
    setSelectedFiles(updatedFiles);
    startUpload(filteredNewFiles);
  };

  const startUpload = async (files) => {
    files.forEach(async (file) => {
      const progressKey = file.name;
      const fileData = await readFileAsBase64(file);

      setUploadProgress((prevProgress) => ({
        ...prevProgress,
        [progressKey]: true,
      }));

      const { data } = await uploadFile({
        variables: {
          file: fileData,
          filename: file.name,
          ticket_id: ticket.ticket_id,
          attachment_type: file.type,
        },
      });

      setUploadProgress((prevProgress) => ({
        ...prevProgress,
        [progressKey]: false,
      }));

      const values = watch();

      setValue("attachments", [
        ...(values.attachments || []),
        data.uploadFile.attachment_id,
      ]);

      setFileMapping([
        ...filemapping,
        { name: file.name, id: data.uploadFile.attachment_id },
      ]);
    });
  };

  const removeFile = (fileName) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );

    const file_id = filemapping.find((file) => file.name === fileName).id;
    setValue(
      "attachments",
      values.attachments.filter((id) => id !== file_id)
    );

    setUploadProgress((prevProgress) => {
      const updatedProgress = { ...prevProgress };
      delete updatedProgress[fileName];
      return updatedProgress;
    });
  };

  const handleMessageChange = (content) => {
    setValue("note", content, { shouldValidate: true });
  };

  const isFormValid = React.useMemo(() => values.note, [values]);
  const isUploading = Object.values(uploadProgress).some(
    (progress) => progress === true
  );

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

  return (
    <div className="position-relative">
      <div
        style={{
          position: "absolute",
          right: "15px",
          zIndex: 99,
          top: 11,
          display: "flex",
          alignItems: "center",
        }}
      >
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
            <IconButton aria-label="attachment" className="primary-hover">
              <AttachFileIcon className="primary-hover" />
            </IconButton>
          </Files>
        </Tooltip>
        {/* <HookCheckbox
          control={control}
          name={"flag_internal"}
          label={"Mark as Private"}
        />  */}
      </div>

      <Grid container spacing={1}>
        <Grid item xs={12}>
          <EditorContainer
            content={values.note}
            setContent={handleMessageChange}
            disabled={isSubmitting}
          />
        </Grid>
        <Grid item xs={12}>
          <FileUploadPreview
            selectedFiles={selectedFiles}
            uploadProgress={uploadProgress}
            removeFile={removeFile}
          />
        </Grid>
       
      </Grid>
      <div className="text-right">
          <ProgressButton
            color="primary"
            variant="outlined"
            onClick={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
            disabled={!isFormValid || isSubmitting || isUploading}
          > Save
          </ProgressButton>
          <Button color="default" variant="outlined" onClick={handleCancel}>Cancel</Button>
        </div>
    </div>
  );
};

const replaceWhitespace = (str) => {
  return str.replace(/\r|\r\n|\n/g, "<br>");
};

const AddNoteForm = (props) => {
  const { ticket, handleCancel, qoutedContent } = props;
  const [addTicketNote] = useMutation(ADD_NEW_TICKET_NOTE);
  const dispatch = useDispatch();

  const foramteQoutedContent = (qoutedContent) => {
    if (qoutedContent.from === "email") {
      return `
      <div class="quote-text">
          <div class="email-content"> ${replaceWhitespace(
            qoutedContent.content.to_email
          )}</div>
          <div class="email-subject"> ${replaceWhitespace(
            qoutedContent.content.subject
          )}</div>
          <div class="email-body">${replaceWhitespace(
            qoutedContent.content.message
          )}</div>
      </div><p>&nbsp</p>
        `;
    } else if (qoutedContent.from === "sms") {
      return `
        <div class="quote-text">
        <div class="email-content">${replaceWhitespace(
          qoutedContent.content.to_email
        )} </div>
        <div class="email-body"> ${replaceWhitespace(
          qoutedContent.content.message
        )}</div>
        </div><p>&nbsp</p>;
        `;
    } else if (qoutedContent.from === "note") {
      return `
       <div class="quote-text">
      <div class="email-content"> ${replaceWhitespace(
        qoutedContent.content.appuser_name
      )} wrote: </div>
      <div class="email-body"> ${replaceWhitespace(
        qoutedContent.content.content
      )} </div>
       </div><p>&nbsp;</p>
      `;
    }
  };

  const initialValues = React.useMemo(() => {
    return {
      note: qoutedContent ? foramteQoutedContent(qoutedContent) : "",
      qouted_content_id: qoutedContent
        ? qoutedContent.from === "note"
          ? qoutedContent.content.note_id
          : qoutedContent.content.id
        : null,
      from: qoutedContent ? qoutedContent.from : null,
      flag_internal: false,
      ticket_id: ticket.id,
      attachments: [],
    };
  }, [ticket, qoutedContent]);

  const form = useForm({
    defaultValues: initialValues,
    // resolver: yupResolver(validationSchemaSubLocation),
    mode: "onChange",
    reValidateMode: "onSubmit",
  });
  const onSubmit = async (values) => {
    console.log(values);
    try {
      const variables = {
        ticket_id: ticket.ticket_id,
        note: values.note,
        qouted_content_id: values.qouted_content_id,
        from: values.from,
        flag_internal: false,
        attachments: values.attachments,
      };

      await addTicketNote({
        variables,
        refetchQueries: [
          {
            query: GET_TICKET_NOTES,
            variables: { ticket_id: ticket.ticket_id },
          },
          { query: GET_TICKET, variables: { id: ticket.ticket_id } },
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
      qoutedContent={qoutedContent}
      onSubmit={onSubmit}
    />
  );
};

export default AddNoteForm;
