import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Grid,
  Chip,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/pro-regular-svg-icons";
import { faFilePdf, faFileZip } from "@fortawesome/pro-duotone-svg-icons";
import Files from "react-files";
import { acceptedFormats } from "Common/constants";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import {
  ADD_TICKET_ATTACHMENT,
  DELETE_TICKET_ATTACHMENT,
  GET_TICKET_ATTACHMENTS,
  GET_ACTIVITIES,
  ATTACHMENT_SUBSCRIPTION,
} from "TicketDetails/TicketGraphQL";
import { useMutation, useQuery } from "@apollo/client";
import { readFileAsBase64 } from "Common/helper";
import GetAppIcon from "@mui/icons-material/GetApp";
import DialogAlert from "components/DialogAlert";
import { Close } from "@mui/icons-material";

const Attachments = (props) => {
  const { ticket, setDefaultAttacmentCount } = props;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [defaultAttachment, setDefaultAttachment] = useState([]);
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
  const [isDragging, setIsDragging] = useState(false);

  const { data,    refetch: refetchAttachment} = useQuery(GET_TICKET_ATTACHMENTS, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: "network-only",
  });



  useSubscription(ATTACHMENT_SUBSCRIPTION, {
    variables: { ticket_id: ticket.ticket_id },
    onData: async ({ data: { data }, client }) => {
      refetchAttachment();
    },
  });



  useEffect(() => {
    if (data) {
      setSelectedFiles(data.ticketAttachments);
      setAttachmentCount(data.ticketAttachments.length);
      setDefaultAttachment(
        data.ticketAttachments.filter(
          (file) => file.attachment_label && file.attachment_label.trim() !== ""
        )
      );
    }
  }, [data]);

  useEffect(() => {
    setAttachmentCount(selectedFiles.filter((file) => file.file_url).length);

    setDefaultAttacmentCount(
      selectedFiles.filter((file) => file.default_attachment === "Y").length
    );
  }, [selectedFiles, setDefaultAttacmentCount]);

  const handleFileChange = async (files) => {
    const newFiles = Array.from(files);
    const existingFileNames = new Set(selectedFiles.map((file) => file.name));

    const filteredNewFiles = newFiles.filter(
      (file) => !existingFileNames.has(file.name)
    );

    const updatedFiles = [...selectedFiles, ...filteredNewFiles];
    setSelectedFiles(updatedFiles);
    await startUpload(filteredNewFiles);
    dispatch(showSnackbar({ message: "Attachment added successfully" }));
  };

  const startUpload = async (files) => {
    const uploadPromises = files.map(async (file) => {
      const progressKey = file.name;
      const fileData = await readFileAsBase64(file);
      setUploadProgress((prevProgress) => ({
        ...prevProgress,
        [progressKey]: true,
      }));

      const input_attachment = {
        filename: file.name,
        attachment_label: file.attachment_label ?? "",
        attachment_type: file.type,
        file: fileData,
        ticket_id: ticket.ticket_id,
        is_additional_attachment: true,
        flag_attachments_required: false,
      };

      try {
        const { data } = await addTicketAttachment({
          variables: { input_attachment },
          refetchQueries: [
            {
              query: GET_ACTIVITIES,
              variables: { ticket_id: ticket.ticket_id },
            },
          ],
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

    await Promise.all(uploadPromises);
  };

  const handelDefaultFileChange = (files, attachment_label) => {
    if (files.length > 0) {
      const newFile = files[0]; // Assuming only one file is uploaded at a time
      const updatedFiles = selectedFiles.map((file) => {
        if (file.attachment_label === attachment_label) {
          return {
            id: newFile.id ?? file.id,
            preview: newFile.preview ?? file.preview,
            sizeReadable: newFile.sizeReadable ?? file.sizeReadable,
            lastModified: newFile.lastModified ?? file.lastModified,
            lastModifiedDate: newFile.lastModifiedDate ?? file.lastModifiedDate,
            name: newFile.name ?? file.name,
            size: newFile.size ?? file.size,
            type: newFile.type ?? file.type,
            webkitRelativePath:
              newFile.webkitRelativePath ?? file.webkitRelativePath,
            attachment_label: attachment_label,
          };
        }
        return file;
      });

      setSelectedFiles(updatedFiles);
      startUploadSingleFile(newFile, attachment_label);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    handleFileChange(files);
    setIsDragging(true);
  };

  useEffect(() => {
    if (fileToUpdate) {
      const { file, data } = fileToUpdate;
      let fileIndex = -1;

      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        if (item.name === file.name) {
          fileIndex = i;
          break;
        }
      }

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
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(true);
  };

  const startUploadSingleFile = async (file, attachment_label) => {
    const progressKey = file.name;
    const fileData = await readFileAsBase64(file);
    setUploadProgress((prevProgress) => ({
      ...prevProgress,
      [progressKey]: true,
    }));

    const input_attachment = {
      filename: file.name,
      attachment_label: attachment_label ?? "",
      attachment_type: file.type,
      file: fileData,
      ticket_id: ticket.ticket_id,
      is_additional_attachment: false,
      flag_attachments_required: true,
    };

    try {
      const { data } = await addTicketAttachment({
        variables: { input_attachment },
        refetchQueries: [
          { query: GET_ACTIVITIES, variables: { ticket_id: ticket.ticket_id } },
        ],
      });

      setUploadProgress((prevProgress) => ({
        ...prevProgress,
        [progressKey]: false,
      }));

      setFileToUpdate({ file, data });

      dispatch(showSnackbar({ message: "Attachment added successfully" }));
    } catch {
      dispatch(
        showSnackbar({
          message: "Failed to upload file",
          severity: "error",
        })
      );
    }
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
      refetchQueries: [
        { query: GET_ACTIVITIES, variables: { ticket_id: ticket.ticket_id } },
      ],
    });

    setSelectedFiles((prevFiles) => {
      // Find the index of the file to be deleted
      const fileIndex = prevFiles.findIndex(
        (file) => file.id === deleteAttachmentID
      );

      // Filter out the file with the deleteAttachmentID
      const updatedFiles = prevFiles.filter(
        (file) => file.id !== deleteAttachmentID
      );

      // Check if the label is present in any object in defaultAttachment
      const defaultAttachmentObject = defaultAttachment.find(
        (attachment) =>
          attachment.attachment_label === prevFiles[fileIndex]?.attachment_label
      );

      // If the default attachment object is found, insert it back into updatedFiles at the same index
      if (defaultAttachmentObject) {
        updatedFiles.splice(fileIndex, 0, {
          ...defaultAttachmentObject,
          id: 0,
          default_attachment: "Y",
        });
      }

      return updatedFiles;
    });

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

  function getAcceptedFormats(attachmentType) {
    let formats = [];

    if (attachmentType.includes("image")) {
      formats = ["image/jpeg", "image/png", "image/gif"];
    } else if (attachmentType.includes("pdf")) {
      formats = ["application/pdf"];
    } else if (attachmentType.includes("zip")) {
      formats = ["application/zip", "application/x-zip-compressed"];
    }

    return formats;
  }

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
              onError={handleError}
              onChange={handleFileChange}
              accepts={["image/*", "application/pdf", "application/zip"]}
              multiple
              clickable
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
            >
              <Box
                className={`upload-image-placeholder ${
                  isDragging ? "dragging" : ""
                }`}
              >
                <label
                  htmlFor="upload-file-input"
                  className="upload-file-input"
                >
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
          <Grid container spacing={1}>
            {selectedFiles.length > 0 &&
              selectedFiles.map((file, index) => (
                <>
                  {file.id === 0 && (
                    <Grid item xs={2} sm={2} md={2} key={index}>
                      <Typography
                        className={`mt-2 d-block text-truncate ${
                          !file.attachment_label ? "invisible" : ""
                        }`}
                        variant="caption"
                      >
                        {file.attachment_label
                          ? file.attachment_label
                          : "Empty"}
                      </Typography>
                      <Tooltip title="Attach File">
                        <Files
                          className="files-dropzone"
                          onError={handleError}
                          onChange={(uploadedFile) =>
                            handelDefaultFileChange(
                              uploadedFile,
                              file.attachment_label
                            )
                          } // Pass file and atta_label
                          accepts={getAcceptedFormats(file.attachment_type)} // Make it
                          clickable
                          multiple={false} // Disable multi-select
                        >
                          <div className="attachment-card">
                            <Typography variant="body2" color="textSecondary">
                              <FontAwesomeIcon icon={faPlusCircle} size="lg" />
                            </Typography>
                          </div>
                        </Files>
                      </Tooltip>
                    </Grid>
                  )}
                  {(file.default_attachment === undefined ||
                    file.default_attachment === "N") && (
                    <Grid item xs={2} sm={2} md={2} key={index}>
                      <Typography
                        className={`mt-2 d-block text-truncate ${
                          !file.attachment_label ? "invisible" : ""
                        }`}
                        variant="caption"
                      >
                        {file.attachment_label
                          ? file.attachment_label
                          : "Empty"}
                      </Typography>

                      <div className="attachment-card visible-on-hover">
                        {file.file_url && (
                          <IconButton
                            className="close-icon-btn invisible"
                            size="small"
                            onClick={() => removeFile(file.id)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          className="preview-icon-btn invisible "
                          size="small"
                          onClick={() => handlePreviewOpen(file)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {(file.type?.startsWith("image/") ||
                          file.attachment_type?.startsWith("image/")) && (
                          <img
                            src={file.file_url || file.preview?.url}
                            alt={file.filename || file.name}
                          />
                        )}

                        {(file.type?.includes("pdf") ||
                          file.attachment_type?.includes("pdf")) && (
                          <FontAwesomeIcon icon={faFilePdf} size="2xl" />
                        )}

                        {(file.type?.includes("zip") ||
                          file.attachment_type?.includes("zip")) && (
                          <FontAwesomeIcon icon={faFileZip} size="2xl" />
                        )}
                      </div>

                      {(!file.file_url || file?.lodingStatus) &&
                        uploadProgress[file.name] && (
                          <LinearProgress className="mt-2" />
                        )}

                      <Typography
                        className="mt-2 d-block text-truncate"
                        variant="caption"
                      >
                        {file.filename ? file.filename : file.name}
                      </Typography>
                    </Grid>
                  )}
                </>
              ))}

            {selectedFiles.length > 0 && selectedFiles.length < 4 && (
              <Grid item xs={2} sm={2} md={2}>
                <Typography
                  className={`mt-2 d-block text-truncate invisible`}
                  variant="caption"
                >
                  Not visible
                </Typography>
                <Tooltip title="Attache File">
                  <Files
                    className="files-dropzone"
                    onError={handleError}
                    onChange={handleFileChange}
                    accepts={acceptedFormats}
                    clickable
                  >
                    <div className="attachment-card">
                      <Typography variant="body2" color="primary">
                        <FontAwesomeIcon icon={faPlusCircle} size="lg" />
                      </Typography>
                    </div>
                  </Files>
                </Tooltip>
              </Grid>
            )}
          </Grid>

          {/* Image Preview Modal */}
          <Dialog open={openPreview} onClose={handlePreviewClose}>
            <DialogTitle id="alert-dialog-title">
              <Grid container spacing={1} alignItems="center">
                <Grid item xs="auto">
                  {previewImage.filename || previewImage.name}
                </Grid>
                <Grid item xs>
                  {previewImage.file_url && (
                    <IconButton
                      component="a"
                      href={previewImage.file_url}
                      download={previewImage.filename || previewImage.name}
                      aria-label="download"
                      size="small"
                      className="ml-2"
                    >
                      <GetAppIcon />
                    </IconButton>
                  )}
                </Grid>
                <Grid item xs="auto">
                  <IconButton
                    onClick={handlePreviewClose}
                    size="small"
                    className="ml-auto"
                  >
                    <Close />
                  </IconButton>
                </Grid>
              </Grid>
            </DialogTitle>
            <DialogContent>
              {previewImage &&
                (previewImage.type?.startsWith("image/") ||
                previewImage.attachment_type?.startsWith("image/") ? (
                  <img
                   className="img-fluid"
                    src={
                      previewImage.file_url || URL.createObjectURL(previewImage)
                    }
                    alt="Preview"
                  />
                ) : (
                  <Typography variant="body2" className="mt-2">
                    Preview not available
                  </Typography>
                ))}
            </DialogContent>
          </Dialog>
          {/* EOF Image Preview Modal */}
        </Box>
      </AccordionCard>

      <DialogAlert
        open={openDialog}
        message={<span>Are you sure you want to delete this attachment?</span>}
        buttonsList={[
          {
            label: "Yes",
            color: "primary",
            onClick: handleOnDelete,
            isProgress: true,
            isSubmitting: submitting,
          },
          {
            label: "No",
            color: "default",
            onClick: () => setOpenDialog(false),
            disabled: submitting,
          },
        ]}
      />
    </>
  );
};
Attachments.propTypes = {
  ticket: PropTypes.shape({
    ticket_id: PropTypes.string.isRequired,
  }).isRequired,
  setDefaultAttacmentCount: PropTypes.func.isRequired,
  appuser_id: PropTypes.string.isRequired,
};

export default Attachments;
