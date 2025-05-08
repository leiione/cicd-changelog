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
import { makeStyles } from "@mui/styles";
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
import LinesEllipsis from "react-lines-ellipsis";
import { LINE_LIMIT } from "../../helper";

const useStyles = makeStyles({
  quoteBlock: {
    backgroundColor: '#f7f7f7 !important',
    border: '1px solid #ccc !important',
    margin: '0 0 8px 0 !important',
    padding: '8px !important'
  }
});

const Note = (props) => {
  const classes = useStyles();
  const { message, onDeleteNote, handleQouteNote } = props;
  const [more, setMore] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const permitDelete = usePermission(
    "ticket_note_message",
    "flag_delete",
    "notes"
  );

  const cleanContent = React.useMemo(() => {
    if (!message.content) return '';
    
    // First clean the basic content
    let content = message.content
      .replace(/&nbsp;/g, ' ')
      .replace(/<([^>\s@]+@[^>\s]+)>/g, '&lt;$1&gt;')
      .replace(/\n/g, '<br />')
      .trim();
    
    return content;
  }, [message.content]);

  // Calculate if content should be truncated
  const shouldTruncate = React.useMemo(() => {
    // Get non-quote content
    const nonQuoteContent = cleanContent.replace(/<div class="quote-block">[\s\S]*?<\/div>/g, '');
    
    // Count lines in non-quote content
    const lines = h2p(nonQuoteContent).split(/\r|\r\n|\n/g);
    return lines.length > LINE_LIMIT;
  }, [cleanContent]);

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
              {more || !shouldTruncate ? (
                // Show full content
                parse(cleanContent, {
                  replace: (domNode) => {
                    if (domNode.attribs && domNode.attribs.class === 'quote-block') {
                      // Add our style class to the original quote-block class
                      domNode.attribs.class = `quote-block ${classes.quoteBlock}`;
                      return domNode;
                    }
                    // Return all other nodes as is
                    return domNode;
                  }
                })
              ) : (
                // Show truncated content
                <>
                  <LinesEllipsis
                    text={h2p(cleanContent)}
                    maxLine={LINE_LIMIT}
                    ellipsis=""
                    className="text-pre-line"
                  />
                </>
              )}
              
              {shouldTruncate && (
                <div className="mt-1">
                  <Link 
                    variant="caption" 
                    component="button"
                    onClick={() => setMore(!more)}
                    className="text-decoration-none"
                  >
                    {more ? "Simplify..." : "More..."}
                  </Link>
                </div>
              )}

              {/* Display attachments if present */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2">
                  <FileUploadPreview selectedFiles={message.attachments} />
                </div>
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
