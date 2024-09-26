import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Modal,
  Grid,
  Button,
} from "@mui/material";

import EditorContainer from "components/EditorContainer";
import ProgressButton from "Common/ProgressButton";
import HookCheckbox from "Common/hookFields/HookCheckbox";
import {
  ADD_NEW_TICKET_NOTE,
  UPLOAD_FILE_MUTATION,
} from "TicketDetails/TicketGraphQL";
import { useMutation } from "@apollo/client";
import { GET_TICKET_NOTES } from "./../../../../TicketGraphQL";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
// import { AddCircleOutline } from "@mui/icons-material";
import Files from "react-files";

// import Files from "react-files";

const AddNoteFields = (props) => {
  const { form, handleCancel, onSubmit, ticket } = props;
  const {
    control,
    setValue,
    watch,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const values = watch();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [openPreview, setOpenPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [filemapping, setFileMapping] = useState([]);
  const [uploadFile] = useMutation(UPLOAD_FILE_MUTATION);
  const maxFileSize = 12 * 1024 * 1024; 
  const dispatch = useDispatch();
  const acceptedFormats = [
    "image/*",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
  ];

  const handleFileChange = (files) => {
    const newFiles = Array.from(files);
    const existingFileNames = new Set(selectedFiles.map((file) => file.name));

    const filteredNewFiles = newFiles.filter(
      (file) => !existingFileNames.has(file.name)
    );

    const updatedFiles = [...selectedFiles, ...filteredNewFiles].slice(0, 4);
    setSelectedFiles(updatedFiles);
    startUpload(filteredNewFiles);
  };

  const readFileAsBase64 = (inputFile) => {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.readAsDataURL(inputFile);

      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject("Problem parsing input file.");
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result.split(",").pop());
      };
    });
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

  const handlePreviewOpen = (imageSrc) => {
    setPreviewImage(imageSrc);
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
    setPreviewImage("");
  };

  const handleMessageChange = (content) => {
    setValue("note", content, { shouldValidate: true });
  };

  const isFormValid = React.useMemo(() => values.note, [values]);
  const isUploading = Object.values(uploadProgress).some(
    (progress) => progress === true
  );

  const handleError = (error, file) => {

    dispatch(
      showSnackbar({
        message: error.message,
        severity: "error",
      })
    );

  }

  return (
    <div className="position-relative">
      <div
        style={{
          position: "absolute",
          right: "15px",
          zIndex: 99,
          top: 4,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Files
          className="files-dropzone"
          onError={handleError}
         onChange={handleFileChange}
          accepts={acceptedFormats}
          multiple
          clickable
          maxFileSize={maxFileSize}
          maxFiles={4}
        >
          <IconButton aria-label="attachment">
            <AttachFileIcon />
          </IconButton>
        </Files>
        <HookCheckbox
          control={control}
          name={"flag_internal"}
          label={"Mark as Private"}
        />
      </div>
      <EditorContainer
        content={values.note}
        setContent={handleMessageChange}
        disabled={isSubmitting}
      />

      <Box>
        <Grid container spacing={1} className="upload-image-row">
          {selectedFiles.map((file, index) => (
            <Grid item xs={2} sm={2} md={2} key={index}>
              <Box className="single-img-box">
                <IconButton
                  className="close-icon-btn"
                  size="small"
                  onClick={() => removeFile(file.name)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <IconButton
                  className="preview-icon-btn"
                  size="small"
                  onClick={() => handlePreviewOpen(URL.createObjectURL(file))}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                {file.type.startsWith("image/") ? (
                  <img
                    className="img-preview"
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{ display: "block" }}
                  />
                ) : (
                  <Typography variant="body2" className="file-name">
                    {file.name}
                  </Typography>
                )}
              </Box>
              {uploadProgress[file.name] && <LinearProgress />}

              <Typography
                className="mt-2 d-block text-truncate"
                variant="caption"
              >
                {file.name}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Image Preview Modal */}
        <Modal open={openPreview} onClose={handlePreviewClose}>
          <Box className="box-modal-preview">
            {selectedFiles
              .find((file) => URL.createObjectURL(file) === previewImage)
              ?.type.startsWith("image/") ? (
              <>
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{ width: "100%", height: "auto" }}
                />
                <Typography variant="body2" className="mt-2">
                  {
                    selectedFiles.find(
                      (file) => URL.createObjectURL(file) === previewImage
                    )?.name
                  }
                </Typography>
              </>
            ) : (
              <Typography variant="body2" className="mt-2">
                Preview not available
              </Typography>
            )}
          </Box>
        </Modal>
      </Box>

      <div className="text-right">
        <ProgressButton
          color="primary"
          variant="outlined"
          onClick={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          disabled={!isFormValid || isSubmitting || isUploading}
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
       <blockquote class="bg-light" style="font-size: 8pt;">
       <p>${replaceWhitespace(qoutedContent.content.to_email)}<br/>
        ${replaceWhitespace(qoutedContent.content.subject)}<br/>
        ${replaceWhitespace(qoutedContent.content.message)}
        </blockquote><p>&nbsp</p>;
        `;
    } else if (qoutedContent.from === "sms") {
      return `
        <blockquote class="bg-light" style="font-size: 8pt;">
        <p>${replaceWhitespace(qoutedContent.content.to_email)} <br/>
         ${replaceWhitespace(qoutedContent.content.message)}</p>
        </blockquote><p>&nbsp</p>;
        `;
    } else if (qoutedContent.from === "note") {
      return `
       <blockquote class="bg-light" style="font-size: 8pt;">
       <p>${replaceWhitespace(qoutedContent.content.appuser_name)} wrote: 
       ${replaceWhitespace(qoutedContent.content.content)}</p>
       </blockquote><p>&nbsp;</p>
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
        flag_internal: values.flag_internal,
        attachments: values.attachments,
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
      qoutedContent={qoutedContent}
      onSubmit={onSubmit}
    />
  );
};

export default AddNoteForm;
