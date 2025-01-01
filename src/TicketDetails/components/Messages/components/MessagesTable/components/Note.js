import React, { useState } from "react";
import {
  Grid,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Box,
  Modal,
  Button,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMessagePlus,
  faNote,
  faTrash,
} from "@awesome.me/kit-bf5f144381/icons/sharp/regular";

import moment from "moment-timezone";
import LinesEllipsis from "react-lines-ellipsis";
import h2p from "html2plaintext";
import parse from "html-react-parser";
import PropTypes from "prop-types";
import DialogAlert from "components/DialogAlert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { NO_RIGHTS_MSG } from "utils/messages";
import usePermission from "config/usePermission";

const Note = (props) => {
  const { message, onDeleteNote, handleQouteNote } = props;
  const [more, setMore] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const permitDelete = usePermission(
    "ticket_note_message",
    "flag_delete",
    "notes"
  );

  const isHtml = /<\/?[a-z][\s\S]*>/i.test(message.content);
  const lineLen = message.content
    ? isHtml
      ? h2p(message.content).split(/\r|\r\n|\n/g).length +
          (message.content.match(/<div|<p|<br/g) || []).length
      : message.content.split(/\r|\r\n|\n/g).length
    : 1;

  const handleOnDelete = async () => {
    setSubmitting(true);
    await onDeleteNote(message.note_id);
    setOpenDialog(false);
    setSubmitting(false);
  };

  const handlePreviewOpen = (imageSrc) => {
    setPreviewImage(imageSrc);
    setOpenPreview(true);
  };

  const handlePreviewClose = () => {
    setOpenPreview(false);
    setPreviewImage("");
  };

  return (
    <>
      <ListItem
        key={message.note_id}
        alignItems="flex-start"
        className="border-bottom border-lighter"
      >
        <ListItemAvatar sx={{ width: 24, height: 24, minWidth: 24 }}>
          <FontAwesomeIcon icon={faNote} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Grid container spacing={1} className="align-items-center mb-1">
              <Grid item xs>
                <Typography variant="subtitle1">
                  {message.appuser_name ? message.appuser_name : ""}
                </Typography>
              </Grid>
              <Grid item xs="auto">
                <Typography variant="caption">
                  {moment(message.date_added).format("MMM DD, YYYY hh:mm")}
                </Typography>
              </Grid>
              <Grid item xs="auto">
                <IconButton size="small">
                  <FontAwesomeIcon
                    className="primary-on-hover"
                    icon={faMessagePlus}
                    onClick={() => handleQouteNote("note", message)}
                  />
                </IconButton>
              </Grid>
              <Grid item xs="auto">
                <Tooltip title={!permitDelete ? NO_RIGHTS_MSG : ""}>
                  <span>
                    <IconButton size="small" disabled={!permitDelete}>
                      <FontAwesomeIcon
                        className="primary-on-hover"
                        icon={faTrash}
                        onClick={() => setOpenDialog(true)}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          }
          secondary={
            <>
              {more || lineLen < 6 ? (
                <Typography
                  variant="caption"
                  className="text-pre-line"
                >
                  {parse(message.content)}
                </Typography>
              ) : (
               
                <Typography
                variant="caption"
                className="text-pre-line"
                //need to apply eclippise through CSS
                >
                {parse(message.content)}
               </Typography>
              )}
              {lineLen > 6 && (
                <div className="mt-1">
                  <Link variant="caption" onClick={() => setMore(!more)}>
                    {more ? "Simplify..." : "More..."}
                  </Link>
                </div>
              )}

              {message.attachments && message.attachments.length > 0 && (
                <>
                  <Typography variant="subtitle1" className="mt-3">
                    Attachments
                  </Typography>
                  <Grid container spacing={1}>
                    {message.attachments.map((file, index) => (
                      <Grid item xs={2} sm={2} md={2} key={index}>
                        <div className="attachment-card visible-on-hover">
                          <IconButton
                            className="preview-icon-btn invisible"
                            size="small"
                            onClick={() => handlePreviewOpen(file)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {file.attachment_type.startsWith("image/") ? (
                            <img
                              className="img-preview"
                              src={file.file_url}
                              alt={file.file_name}
                            />
                          ) : (
                            <Typography variant="body2" className="file-name">
                              {file.file_name}
                            </Typography>
                          )}
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </>
          }
        />
      </ListItem>
      <DialogAlert
        open={openDialog}
        message={<span>Are you sure you want to delete this message?</span>}
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
      <Modal open={openPreview} onClose={handlePreviewClose}>
        <Box className="box-modal-preview">
          {previewImage && previewImage.attachment_type.startsWith("image/") ? (
            <img
              src={previewImage.file_url}
              alt="Preview"
              style={{ width: "100%", height: "auto" }}
            />
          ) : (
            <Box>
              <Typography variant="body2" className="mt-2">
                Preview not available
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewImage.file_url;
                  link.download = previewImage.file_name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

Note.propTypes = {
  message: PropTypes.shape({
    note_id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    ticket_id: PropTypes.number.isRequired,
    appuser_name: PropTypes.string,
    date_added: PropTypes.string,
  }).isRequired,
  onDeleteNote: PropTypes.func.isRequired,
  handleQouteNote: PropTypes.func.isRequired,
};

export default Note;
