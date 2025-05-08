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
  faMessageSms,
} from "@awesome.me/kit-bf5f144381/icons/sharp/regular";
import h2p from "html2plaintext";
import parse from "html-react-parser";
import moment from "moment-timezone";
import LinesEllipsis from "react-lines-ellipsis";
import DialogAlert from "components/DialogAlert";
import { NO_RIGHTS_MSG } from "utils/messages";
import { LINE_LIMIT } from "../../helper";

const SMSPopover = (props) => {
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
        </Grid>
      </Grid>
    </Popover>
  );
};

const SMS = (props) => {
  const {
    message,
    onDeleteMessage,
    handleQouteNote,
    handleReplySMS,
    permitDelete,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [more, toggleMore] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const toEmail = message.to_email ? message.to_email.split(",") : [];
  const replySMS = toEmail;
  // const replySMS =
  //   message.traffic === "INBOUND"
  //     ? [message.from_email]
  //     : message.to_email
  //     ? message.to_email.split(",")
  //     : [];

  // Remove the specific text from the message
  const text = message.message.replace(
    /To reply to this ticket, send TICKET.*<your reply>/,
    ""
  );

  const linePlainLen = text.split(/\r|\r\n|\n/g).length;
  const lineHtmlLen = h2p(text).split(/\r|\r\n|\n/g).length;
  const lineLen = linePlainLen > lineHtmlLen ? linePlainLen : lineHtmlLen;
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(text);

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDeleteMessage(message.id, message.ticket_id);
    setOpenDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <>
      <ListItem
        key={message.id}
        alignItems="flex-start"
        className="border-bottom border-lighter"
      >
        <ListItemAvatar
          sx={{ width: 24, height: 24, minWidth: 24 }}
          onMouseOver={(e) => setAnchorEl(e.currentTarget)}
          onMouseLeave={() => setAnchorEl(null)}
        >
          <FontAwesomeIcon className="text-danger" icon={faMessageSms} />
          {anchorEl && (
            <SMSPopover
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
                  variant="body1"
                  className="text-truncate"
                  style={{ width: "70%" }}
                >
                  {message.to_email}
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
                    size="small"
                    onClick={() =>
                      handleReplySMS(isHtml ? h2p(text) : parse(text), replySMS)
                    }
                  >
                    <FontAwesomeIcon
                      className="primary-on-hover"
                      icon={faReply}
                    />
                  </IconButton>
                </Grid>
              )}
              <Grid item xs="auto">
                <IconButton size="small" onClick={() => handleQouteNote("sms", message)}>
                  <FontAwesomeIcon
                    className="primary-on-hover"
                    icon={faMessagePlus}
                  />
                </IconButton>
              </Grid>
              <Grid item xs="auto">
                <Tooltip title={!permitDelete ? NO_RIGHTS_MSG : ""}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleDeleteClick}
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
                <Typography variant="caption" className="text-preline">
                  {parse(text)}
                </Typography>
              ) : (
                <LinesEllipsis
                  text={isHtml ? h2p(text) : text}
                  maxLine={5}
                  ellipsis=""
                  className="text-preline"
                />
              )}
              {lineLen > LINE_LIMIT && (
                <div className="mt-1">
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
        open={openDeleteDialog}
        message={<span>Are you sure you want to delete this message?</span>}
        buttonsList={[
          {
            label: "Yes",
            size: "medium",
            color: "primary",
            onClick: handleDeleteConfirm,
          },
          {
            label: "No",
            size: "medium",
            color: "default",
            onClick: handleDeleteCancel,
          },
        ]}
      />
    </>
  );
};

export default SMS;
