import React from "react";
import {
  Grid,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMessagePlus,
  faTrash,
  faReply,
} from "@fortawesome/pro-light-svg-icons";
import moment from "moment-timezone";
import { EmailOutlined } from "@mui/icons-material";
import LinesEllipsis from "react-lines-ellipsis";
import h2p from "html2plaintext";
import parse from "html-react-parser";
import DialogAlert from "components/DialogAlert";

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
      slotProps={{
        paper: { style: { maxWidth: "210px" } },
      }}
      sx={{ pointerEvents: "none" }}
      disableRestoreFocus
    >
      <Grid item xs={12}>
        <Grid container spacing={0} style={{ padding: 5 }}>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>
              From:
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle1">{message.from_email}</Typography>
          </Grid>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>
              To:
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Grid container spacing={0}>
              {toEmail.map((email, index) => (
                <Grid item xs={12} key={index}>
                  <Typography
                    variant="subtitle1"
                    style={{ wordWrap: "break-word" }}
                  >
                    {email}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>
              Cc:
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle1">{message.cc}</Typography>
          </Grid>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>
              Bcc:
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle1">{ }</Typography>
          </Grid>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>
              Subject:
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle1" style={{ wordWrap: "break-word" }}>
              {message.subject}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Popover>
  );
};

const Email = (props) => {
  const { message, onDeleteMessage, handleQouteNote, handleReplyEmail } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [more, toggleMore] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const toEmail = message.to_email ? message.to_email.split(",") : [];
  const replyEmail = message.traffic === 'INBOUND' ? [message.from_email] : (message.to_email ? message.to_email.split(",") : [])
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

  return (
    <>
      <ListItem key={message.id} alignItems="flex-start">
        <ListItemAvatar
          sx={{ width: 24, height: 24, minWidth: 24 }}
          onMouseOver={(e) => setAnchorEl(e.currentTarget)}
          onMouseLeave={() => setAnchorEl(null)}
        >
          <EmailOutlined className="text-danger" />
          {anchorEl && (
            <EmailPopover
              anchorEl={anchorEl}
              message={message}
              handleClose={() => setAnchorEl(null)}
              toEmail={toEmail}
            />
          )}
        </ListItemAvatar>
        <ListItemText
          primary={
            <Grid container spacing={1} className="align-items-center mb-1">
              <Grid item xs>
                <Typography
                  variant="body2"
                  className="text-truncate"
                  style={{ width: "70%" }}
                >
                  {message.traffic === "INBOUND" ? message.from_email : message.to_email}
                </Typography>
              </Grid>
              <Grid item xs="auto">
                <Typography variant="caption">
                  {moment(message.date).format("MMM DD, YYYY hh:mm")}
                </Typography>
              </Grid>
              {message.traffic === 'INBOUND' && <Grid item xs="auto">
                <IconButton size="small" onClick={() => handleReplyEmail(isHtml ? h2p(text) : parse(text), replyEmail)}>
                  <FontAwesomeIcon icon={faReply} />
                </IconButton>
              </Grid>}
              <Grid item xs="auto">
                <IconButton size="small">
                  <FontAwesomeIcon icon={faMessagePlus} onClick={() => handleQouteNote("email", message)} />
                </IconButton>
              </Grid>
              <Grid item xs="auto">
                <IconButton size="small" onClick={() => setOpenDialog(true)}>
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </Grid>
            </Grid>
          }
          secondary={
            <>
              {more || lineLen < 4 ? (
                <Typography
                  variant="caption"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {parse(text)}
                </Typography>
              ) : (
                <LinesEllipsis
                  text={isHtml ? h2p(text) : text}
                  maxLine={4}
                  ellipsis=""
                  style={{ whiteSpace: "pre-line", color: "#0009" }}
                />
              )}
              {lineLen > 4 && (
                <div style={{ marginTop: "5px" }}>
                  <Link variant="caption" onClick={() => toggleMore(!more)}>
                    {more ? "Simplify..." : "More..."}
                  </Link>
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
