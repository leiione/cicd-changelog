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

const useStyles = makeStyles({
  quoteBlock: {
    backgroundColor: '#f7f7f7 !important',
    border: '1px solid #ccc !important',
    margin: '0 0 8px 0 !important',
    padding: '8px !important',
    fontSize: '12px !important',
    '& p': {
      margin: '0 !important',
      padding: '0 !important',
      '&:empty': {
        display: 'none !important'
      }
    },
    '& .quote-sender': {
      display: 'block !important',
      marginBottom: '8px !important',
      fontWeight: '500 !important'
    },
    '& .quote-content': {
      margin: '0 !important',
      display: 'block !important'
    }
  },
  truncateContainer: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }
});

const processDomNode = (domNode, senderText = '', contentHtml = '') => {
    // Iterate through all children of the current node
  domNode.children.forEach(child => {
    if (child.attribs && child.attribs.class === 'quote-sender') {
      // If the child has class 'quote-sender', extract sender text
      senderText = child.children[0].data || '';
    } else if (child.name) {
      // Preserve paragraphs in quote content
      let paragraphContent = child.children
        .map(c => c.data || '')
        .join(' ')
        .trim();
        
      if (paragraphContent) {
        // Add the paragraph content inside a tag
        if (child.type === 'tag') {
          if (child.name !== child.parent.name) {
            contentHtml += `
              <${child.parent.name}>
                <${child.name}>${paragraphContent}</${child.name}>
              </${child.parent.name}>
            `;
          } else {
          contentHtml += `<${child.name}>${paragraphContent}</${child.name}>`;
          }
        }
        if(child.type === 'text') {
          contentHtml += `<p>${paragraphContent}</p>`;
        }
      }
    }

    // Recursively process any nested children
    if (child.children && child.children.length > 0) {
      const result = processDomNode(child, senderText, contentHtml);
      senderText = result.senderText;
      contentHtml = result.contentHtml;
    }
  });

  return { senderText, contentHtml };
}

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

  // Clean content by removing extra &nbsp; and empty paragraphs
  const cleanContent = React.useMemo(() => {
    if (!message.content) return '';
    
    // First clean the basic content
    let content = message.content
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Clean up quote blocks specifically
    content = content.replace(
      /<div class="quote-block">([\s\S]*?)<\/div>/g,
      (match, inner) => {
        // Clean up the quote block content while preserving paragraphs
        const cleanedInner = inner
          .replace(/<p>\s*&nbsp;\s*<\/p>/g, '')  // Remove empty paragraphs
          .replace(/\s+/g, ' ')  // Clean up spaces
          .trim();
        return `<div class="quote-block">${cleanedInner}</div>`;
      }
    );

    // Wrap non-quote content in a single paragraph
    if (!content.includes('quote-block')) {
      content = `<p>${content}</p>`;
    }

    return content;
  }, [message.content]);

  // Improved content length detection with better HTML handling
  const contentLength = React.useMemo(() => {
    // Convert HTML to plain text first
    const textContent = h2p(cleanContent)
      .replace(/\s+/g, ' ')
      .trim();

    // Calculate actual content length
    const contentWithoutSpaces = textContent.replace(/\s+/g, '');
    
    // If content is very short, don't show More button
    if (contentWithoutSpaces.length < 100) {
      return 0;
    }

    // Count actual lines considering line breaks and word wrapping
    const lines = textContent.split(/\r|\r\n|\n/g);
    const totalLength = lines.reduce((acc, line) => {
      // Calculate how many lines this text would take up at 80 chars per line
      return acc + Math.ceil(line.length / 80);
    }, 0);

    return totalLength;
  }, [cleanContent]);

  // Only show More button if content is actually long
  const shouldShowMore = contentLength > 3;

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
              <div className={!more && shouldShowMore ? classes.truncateContainer : undefined}>
                {parse(cleanContent, {
                  replace: (domNode) => {
                    if (domNode.attribs && domNode.attribs.class === 'quote-block') {
                      // Handle quote blocks - always show in full
                      const result = processDomNode(domNode);
                      const quoteHtml = `
                        <span class="quote-sender">${result.senderText.trim()}</span>
                        ${result.contentHtml}
                      `.trim();

                      return React.createElement('div', {
                        className: `quote-block ${classes.quoteBlock}`,
                        dangerouslySetInnerHTML: { __html: quoteHtml }
                      });
                    }
                    // For non-quote content, apply truncation based on more/simplify state
                    if (domNode.type === 'tag' && domNode.name === 'p') {
                      const content = domNode.children.map(child => child.data || '').join(' ').trim();
                      if (!content) return null;
                      
                      // Only apply truncation to non-quote content
                      return React.createElement('div', {
                        className: !more && shouldShowMore ? classes.truncateContainer : undefined
                      }, content);
                    }
                    return domNode;
                  }
                })}
              </div>
              
              {/* Only show More/Simplify if there's non-quote content that's long enough */}
              {shouldShowMore && cleanContent.includes('<p>') && !cleanContent.includes('quote-block') && (
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

              {/* Display attachments if present - always visible */}
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
