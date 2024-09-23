import React,{useState} from "react";
import {
  Grid,
  IconButton as MuiIconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Box,
  Modal,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMessagePlus,
  faNote,
  faTrash,
  faReply,
} from "@fortawesome/pro-light-svg-icons";
import moment from "moment-timezone";
import LinesEllipsis from "react-lines-ellipsis";
import h2p from "html2plaintext";
import parse from "html-react-parser";
import PropTypes from "prop-types";
import DialogAlert from "components/DialogAlert";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Note = (props) => {
  const { message, onDeleteNote, handleQouteNote } = props;
  const [more, setMore] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const lineLen = message.content
    ? message.content.split(/\r|\r\n|\n/g).length
    : 1;
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(message.content);

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
      <ListItem key={message.note_id} alignItems="flex-start">
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
                <MuiIconButton size="small">
                  <FontAwesomeIcon icon={faReply} />
                </MuiIconButton>
              </Grid>
              <Grid item xs="auto">
                <MuiIconButton size="small">
                  <FontAwesomeIcon
                    icon={faMessagePlus}
                    onClick={() => handleQouteNote("note", message)}
                  />
                </MuiIconButton>
              </Grid>
              <Grid item xs="auto">
                <MuiIconButton size="small">
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => setOpenDialog(true)}
                  />
                </MuiIconButton>
              </Grid>
            </Grid>
          }
          secondary={
            <>
              {more || lineLen < 6 ? (
                <Typography
                  variant="caption"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {parse(message.content)}
                </Typography>
              ) : (
                <LinesEllipsis
                  text={isHtml ? h2p(message.content) : message.content}
                  maxLine={5}
                  ellipsis=""
                  style={{ whiteSpace: "pre-line", color: "#0009" }}
                />
              )}
              {lineLen > 6 && (
                <div style={{ marginTop: "5px" }}>
                  <Link variant="caption" onClick={() => setMore(!more)}>
                    {more ? "Simplify..." : "More..."}
                  </Link>
                </div>
              )}

              {message.attachments && message.attachments.length > 0 && (
                <>
                  <Typography variant="subtitle1" className="mt-3">Attachments</Typography>
                  <Grid container spacing={1} className="upload-image-row mt-2">
                    {message.attachments.map((file, index) => (
                      <Box key={index} className="single-img-box">
                        <MuiIconButton
                          className="preview-icon-btn"
                          size="small"
                          onClick={() => handlePreviewOpen(file.file_url)}

                        >
                          <VisibilityIcon fontSize="small" />
                        </MuiIconButton>
                        <img className="img-preview" src={file.file_url} />
                      </Box>
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
            <img
              src={previewImage}
              alt="Preview"
              style={{ width: "100%", height: "auto" }}
            />
            
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
