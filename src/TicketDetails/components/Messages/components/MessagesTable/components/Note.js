import React, { useState } from "react";
import {
  Grid,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMessagePlus,
  faNote,
  faTrash,
} from "@awesome.me/kit-bf5f144381/icons/sharp/regular";
import GetAppIcon from "@mui/icons-material/GetApp";
import { Close , Visibility } from "@mui/icons-material";

import moment from "moment-timezone";
import h2p from "html2plaintext";
import parse from "html-react-parser";
import PropTypes from "prop-types";
import DialogAlert from "components/DialogAlert";
import { NO_RIGHTS_MSG } from "utils/messages";
import usePermission from "config/usePermission";
import { getExtensionFromFilename } from "Common/helper";
import { find } from "lodash";
import { getSourceImage } from "utils/sourceImage";

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
                <Typography variant="body1">
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
                <Typography variant="caption" className="text-pre-line">
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
                    {message.attachments.map((file, index) =>{
                      const type = getExtensionFromFilename(file.file_name);
                      let src = find(getSourceImage, { key: type })
                      src = src || find(getSourceImage, { key: 'txt' });

                      return(
                      <Grid item xs={2} sm={2} md={2} key={index}>
                        <div className="attachment-card visible-on-hover">
                          <IconButton
                            className="preview-icon-btn invisible"
                            size="small"
                            onClick={() => handlePreviewOpen(file)}
                          >
                            <Visibility fontSize="small" />
                            </IconButton>
                            {src.isImage ? 
                              <img  
                                src={file.file_url || file.preview?.url}
                                alt={file.file_name}
                                width={60}
                                height={60}
                                style={{ marginTop: 0 }}
                              /> : src.value
                            }
                        </div>
                      </Grid>)
          })}
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
