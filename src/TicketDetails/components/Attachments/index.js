import React, { useState, useEffect } from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Modal,
  Grid,
  Chip,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/pro-regular-svg-icons";
import { faFilePdf } from "@fortawesome/pro-duotone-svg-icons";
import Files from "react-files";
import { acceptedFormats } from "Common/constants";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import {
  ADD_TICKET_ATTACHMENT,
  DELETE_TICKET_ATTACHMENT,
  GET_TICKET_ATTACHMENTS,
} from "TicketDetails/TicketGraphQL";
import { useMutation, useQuery } from "@apollo/client";
import { readFileAsBase64 } from "Common/helper";
import GetAppIcon from "@mui/icons-material/GetApp";
import DialogAlert from "components/DialogAlert";

const Attachments = (props) => {
  const { ticket } = props;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [openPreview, setOpenPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const dispatch = useDispatch();
  const [addTicketAttachment] = useMutation(ADD_TICKET_ATTACHMENT);
  const [deleteAttachment] = useMutation(DELETE_TICKET_ATTACHMENT);
  const [fileToUpdate, setFileToUpdate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteAttachmentID, setDeleteAttachmentID] = useState("");
  const [attachmentCount, setAttachmentCount] = useState(0);

  const { data } = useQuery(GET_TICKET_ATTACHMENTS, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data) {
      setSelectedFiles(data.ticketAttachments);
      setAttachmentCount(data.ticketAttachments.length);
    }
  }, [data]);

  useEffect(() => {
    setAttachmentCount(selectedFiles.length);
  }, [selectedFiles]);

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

  const handleDragOver = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    handleFileChange(files);
  };

  useEffect(() => {
    if (fileToUpdate) {
      const { file, data } = fileToUpdate;
      let fileIndex = -1;

      console.log("Selected files:", selectedFiles);
      console.log("Current file name:", file.name);

      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        console.log(`Comparing ${item.name} with ${file.name}`);
        if (item.name === file.name) {
          fileIndex = i;
          break;
        }
      }

      console.log("Found index:", fileIndex);

      if (fileIndex !== -1) {
        const updatedSelectedFiles = [...selectedFiles];
        updatedSelectedFiles[fileIndex] = {
          ...data.addTicketAttachment,
          lodingStatus: true,
        };
        setSelectedFiles(updatedSelectedFiles);
      }

      // Reset fileToUpdate after processing
      setFileToUpdate(null);
    }
  }, [fileToUpdate, selectedFiles]);

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    handleFileChange(files);
  };

  const startUpload = async (files) => {
    files.forEach(async (file) => {
      const progressKey = file.name;
      const fileData = await readFileAsBase64(file);
      setUploadProgress((prevProgress) => ({
        ...prevProgress,
        [progressKey]: true,
      }));

      const input_attachment = {
        filename: file.name,
        attachment_label: file.name,
        attachment_type: file.type,
        file: fileData,
        ticket_id: ticket.ticket_id,
        is_additional_attachment: true,
        flag_attachments_required: false,
      };

      try {
        const { data } = await addTicketAttachment({
          variables: { input_attachment },
        });

        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [progressKey]: false,
        }));

        setFileToUpdate({ file, data });
      } catch {
        dispatch(
          showSnackbar({
            message: "Failed to upload file",
            severity: "error",
          })
        );
      }
    });
  };

  const removeFile = (id) => {
    setOpenDialog(true);
    setDeleteAttachmentID(id);
  };

  const handlePreviewOpen = (imageSrc) => {
    setPreviewImage(imageSrc);
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
    setPreviewImage("");
  };

  const handleOnDelete = async () => {
    setSubmitting(true);
    await deleteAttachment({
      variables: { id: deleteAttachmentID },
    });

    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== deleteAttachmentID)
    );

    setSubmitting(false);
    setOpenDialog(false);
    setDeleteAttachmentID("");
    dispatch(
      showSnackbar({
        message: "Attachment deleted successfully",
        severity: "success",
      })
    );
  };

  const handleError = (error) => {
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

  const { appuser_id } = props;

  return (
    <>
      <AccordionCard
        label={
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>Attachments</span>
            <Chip
              label={attachmentCount || 0}
              sx={{ height: 20, width: 20 }}
              classes={{ label: "p-0" }}
              className="bg-light text-white ml-3"
            />
          </div>
        }
        iconButtons={<></>}
        menuOption={
          <>
            <HeaderMenuOptions
              appuser_id={appuser_id}
              category="Attachments Card"
            />
          </>
        }
      >
        <Box>
          <Tooltip title="Attach File">
          <Files
            className="files-dropzone"
            onError={handleError}
            onChange={handleFileChange}
            accepts={acceptedFormats}
            multiple
            clickable
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
           
            <Box className="upload-image-placeholder">
              <label htmlFor="upload-file-input" className="upload-file-input">
                <Typography variant="body2" className="mt-2">
                  Drag and drop files or
                  <span className="text-primary"> Browse</span>
                </Typography>
                <Typography variant="text-muted mb-2 mt-2">
                  Supported formats: JPEG, PNG, GIF, PDF, ZIP
                </Typography>
              </label>
            </Box>
          </Files>
          </Tooltip>
          <Grid container spacing={1} className="upload-image-row">
            {selectedFiles.map((file, index) => (
              <Grid item xs={2} sm={2} md={2} key={index}>
                <Box className="single-img-box">
                  {file.file_url && (
                    <IconButton
                      className="close-icon-btn"
                      size="small"
                      onClick={() => removeFile(file.id)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}

                  <IconButton
                    className="preview-icon-btn"
                    size="small"
                    onClick={() => handlePreviewOpen(file)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  {file.type?.startsWith("image/") ||
                  file.attachment_type?.startsWith("image/") ? (
                    <img
                      className="img-preview"
                      src={
                        file.file_url
                          ? file.file_url
                          : URL.createObjectURL(file)
                      }
                      alt={file.filename ? file.filename : file.name}
                    />
                  ) : (
                    <div className="display-pdf-box">
                      <FontAwesomeIcon
                        icon={faFilePdf}
                        size="2xl"
                      />
                    </div>
                  )}
                </Box>

                {(!file.file_url || (file && file.lodingStatus)) &&
                  (uploadProgress[file.name] ? (
                    <LinearProgress className="mt-2" />
                  ) : (
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      className={`mt-2 linear-progress progress-success`}
                    />
                  ))}

                <Typography
                  className="mt-2 d-block text-truncate"
                  variant="caption"
                >
                  {file.filename ? file.filename : file.name}
                </Typography>
              </Grid>
            ))}

            {selectedFiles.length > 0 && selectedFiles.length < 4 && (
              <Grid item xs={2} sm={2} md={2}>
                <Tooltip title="Attache File">
                <Files
                  className="files-dropzone"
                  onError={handleError}
                  onChange={handleFileChange}
                  accepts={acceptedFormats}
                  clickable
                >
                  <Box className="empty-single-img-box">
                    <Typography variant="body2" color="textSecondary">
                      <FontAwesomeIcon icon={faPlusCircle} size="lg" />
                    </Typography>
                  </Box>
                </Files>
                </Tooltip>
              </Grid>
            )}
          </Grid>

          {/* Image Preview Modal */}
          <Modal open={openPreview} onClose={handlePreviewClose}>
            <Box className="box-modal-preview">
              <Typography
                variant="body2"
                className="mt-2"
                display="flex"
                alignItems="center"
              >
                {previewImage.filename || previewImage.name}
                {previewImage.file_url && (
                  <IconButton
                    component="a"
                    href={previewImage.file_url}
                    download={previewImage.filename || previewImage.name}
                    aria-label="download"
                    size="small"
                    style={{ marginLeft: "8px" }}
                  >
                    <GetAppIcon />
                  </IconButton>
                )}
              </Typography>

              {previewImage ? (
                previewImage.type?.startsWith("image/") ||
                previewImage.attachment_type?.startsWith("image/") ? (
                  <>
                    <img
                      src={
                        previewImage.file_url ||
                        URL.createObjectURL(previewImage)
                      }
                      alt="Preview"
                    />
                  </>
                ) : (
                  <Typography variant="body2" className="mt-2">
                    Preview not available
                  </Typography>
                )
              ) : null}
            </Box>
          </Modal>
        </Box>
      </AccordionCard>

      <DialogAlert
        open={openDialog}
        message={<span>Are you sure you want to delete this attachment?</span>}
        buttonsList={[
          {
            label: "Yes",
            size: "medium",
            color: "primary",
            onClick: handleOnDelete,
            isProgress: true,
            isSubmitting: submitting,
          },
          {
            label: "No",
            size: "medium",
            color: "default",
            onClick: () => setOpenDialog(false),
            disabled: submitting,
          },
        ]}
      />
    </>
  );
};

export default Attachments;
