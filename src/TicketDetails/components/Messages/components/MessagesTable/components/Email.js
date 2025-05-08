import React from "react";
import {
  Grid,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMessagePlus,
  faTrash,
  faReply,
} from "@awesome.me/kit-bf5f144381/icons/sharp/regular";
import moment from "moment-timezone";
import { EmailOutlined } from "@mui/icons-material";
import LinesEllipsis from "react-lines-ellipsis";
import h2p from "html2plaintext";
import parse from "html-react-parser";
import DialogAlert from "components/DialogAlert";
import { NO_RIGHTS_MSG } from "utils/messages";
import FileUploadPreview from "components/FileUploadPreview";
import { LINE_LIMIT } from "../../helper";

const EmailPopover = (props) => {
  const { anchorEl, message, handleClose, toEmail } = props;

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      classes={{ paper: "overflow-hidden" }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      sx={{ pointerEvents: "none" }}
      disableRestoreFocus
    >
      <Grid container spacing={1} className="break-word" style={{ maxWidth: "270px" }}>
        <Grid item xs={3}>
          <Typography variant="subtitle1" className="text-right">
            From:
          </Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography variant="subtitle1">{message.from_email}</Typography>
        </Grid>
        <Grid item xs={3} className="text-right">
          <Typography variant="subtitle1">To:</Typography>
        </Grid>
        <Grid item xs={9}>
          {toEmail.map((email, index) => (
            <Typography
              key={index}
              variant="subtitle1"
              style={{ wordWrap: "break-word" }}
            >
              {email}
            </Typography>
          ))}
        </Grid>
        <Grid item xs={3} className="text-right">
          <Typography variant="subtitle1">Cc:</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography variant="subtitle1">{message.cc}</Typography>
        </Grid>
        <Grid item xs={3} className="text-right">
          <Typography variant="subtitle1">Bcc:</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography variant="subtitle1">{message.bcc}</Typography>
        </Grid>
        <Grid item xs={3} className="text-right">
          <Typography variant="subtitle1">Subject:</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography variant="subtitle1" style={{ wordWrap: "break-word" }}>
            {message.subject}
          </Typography>
        </Grid>
      </Grid>
    </Popover>
  );
};

const Email = (props) => {
  const {
    message,
    onDeleteMessage,
    handleQouteNote,
    handleReplyEmail,
    permitDelete,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [more, toggleMore] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const toEmail = message.to_email ? message.to_email.split(",") : [];
  const replyEmail =
    message.traffic === "INBOUND"
      ? [message.from_email]
      : message.to_email
      ? message.to_email.split(",")
      : [];
  const text = message.message;

  const linePlainLen = text.split(/\r|\r\n|\n/g).length;
  const lineHtmlLen = h2p(text).split(/\r|\r\n|\n/g).length;
  const lineLen = linePlainLen > lineHtmlLen ? linePlainLen : lineHtmlLen;
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(text);

  const handleOnDelete = async () => {
    setSubmitting(true);
    await onDeleteMessage(message.id, message.ticket_id);
    setOpenDialog(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  }

  return (
    <>
      <ListItem
        className="border-bottom border-lighter"
        key={message.id}
        alignItems="flex-start"
      >
        <ListItemAvatar
          sx={{ width: 24, height: 24, minWidth: 24 }}
          onMouseOver={(e) => setAnchorEl(e.currentTarget)}
          onMouseLeave={handleClose}
        >
          <EmailOutlined className="text-danger" />
          {anchorEl && (
            <EmailPopover
              anchorEl={anchorEl}
              message={message}
              handleClose={handleClose}
              toEmail={toEmail}
            />
          )}
        </ListItemAvatar>
        <ListItemText
          primary={
            <Grid container spacing={1} className="align-items-center mb-1">
              <Grid item xs>
                <Typography
                  variant="body1"
                  className="text-truncate"
                  style={{ width: "70%" }}
                >
                  {message.traffic === "INBOUND"
                    ? message.from_email
                    : message.to_email}
                </Typography>
              </Grid>
              <Grid item xs="auto">
                <Typography variant="caption">
                  {moment(message.date).format("MMM DD, YYYY hh:mm")}
                </Typography>
              </Grid>
              {message.traffic === "INBOUND" && (
                <Grid item xs="auto">
                  <IconButton
                    className="primary-on-hover"
                    size="small"
                    onClick={() =>
                      handleReplyEmail(
                        isHtml ? h2p(text) : parse(text),
                        replyEmail
                      )
                    }
                  >
                    <FontAwesomeIcon
                      icon={faReply}
                      className="primary-on-hover"
                    />
                  </IconButton>
                </Grid>
              )}
              <Grid item xs="auto">
                <IconButton size="small" className="primary-on-hover">
                  <FontAwesomeIcon
                    className="primary-on-hover"
                    icon={faMessagePlus}
                    onClick={() => handleQouteNote("email", message)}
                  />
                </IconButton>
              </Grid>
              <Grid item xs="auto">
                <Tooltip title={!permitDelete ? NO_RIGHTS_MSG : ""}>
                  <span>
                    <IconButton
                      size="small"
                      className="primary-on-hover"
                      onClick={() => setOpenDialog(true)}
                      disabled={!permitDelete}
                    >
                      <FontAwesomeIcon
                        className="primary-on-hover"
                        icon={faTrash}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          }
          secondary={
            <>
              {more || lineLen < LINE_LIMIT ? (
                <Typography component="span" variant="caption" className="text-pre-line">
                  {parse(text)}
                </Typography>
              ) : (
                <LinesEllipsis
                  text={isHtml ? h2p(text) : text}
                  maxLine={LINE_LIMIT}
                  ellipsis=""
                  className="text-pre-line"
                />
              )}
              {lineLen > LINE_LIMIT && (
                <div className="mt-1">
                  <Link variant="caption" onClick={() => toggleMore(!more)}>
                    {more ? "Simplify..." : "More..."}
                  </Link>
                </div>
              )}
              {message.attachments && message.attachments.length > 0 && (
                <>
                  <Typography component="span" variant="subtitle1" className="mt-3">
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
            isSubmitting,
          },
          {
            label: "No",
            size: "medium",
            color: "default",
            onClick: () => setOpenDialog(false),
            disabled: isSubmitting,
          },
        ]}
      />
    </>
  );
};

export default Email;
