import React, { useState } from "react";
import {
  Grid,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMessagePlus,
  faNote,
  faTrash,
} from "@awesome.me/kit-bf5f144381/icons/sharp/regular";

import moment from "moment-timezone";
import h2p from "html2plaintext";
import parse from "html-react-parser";
import PropTypes from "prop-types";
import DialogAlert from "components/DialogAlert";
import { NO_RIGHTS_MSG } from "utils/messages";
import usePermission from "config/usePermission";
import FileUploadPreview from "components/FileUploadPreview";

const Note = (props) => {
  const { message, onDeleteNote, handleQouteNote } = props;
  const [more, setMore] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
                  <FileUploadPreview
                    selectedFiles={message.attachments}
                  />                    
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
