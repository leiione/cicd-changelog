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
} from "@fortawesome/pro-light-svg-icons";
import { faReply } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";
import { EmailOutlined } from "@mui/icons-material";
import LinesEllipsis from "react-lines-ellipsis";
import h2p from "html2plaintext"
import parse from 'html-react-parser';

const EmailPopover = props => {
  const { anchorEl, message, handleClose, toEmail } = props

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
        paper: { style: { maxWidth: "210px" } }
      }}
      sx={{ pointerEvents: 'none' }}
      disableRestoreFocus
    >
      <Grid item xs={12}>
        <Grid container spacing={0} style={{ padding: 5 }}>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>From:</Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle1">{message.from_email}</Typography>
          </Grid>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>To:</Typography>
          </Grid>
          <Grid item xs={9}>
            <Grid container spacing={0}>
              {toEmail.map((email, index) => (
                <Grid item xs={12} key={index}>
                  <Typography variant="subtitle1" style={{ wordWrap: "break-word" }} >{email}</Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>Cc:</Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle1">{ }</Typography>
          </Grid>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>Bcc:</Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle1">{ }</Typography>
          </Grid>
          <Grid item xs={3} style={{ textAlign: "end" }}>
            <Typography variant="subtitle1" style={{ paddingRight: 5 }}>Subject:</Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle1" style={{ wordWrap: "break-word" }}>{message.subject}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Popover>
  )
}

const Email = props => {
  const { message } = props
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [more, toggleMore] = React.useState(false)
  const toEmail = message.to_email ? message.to_email.split(",") : []
  const text = message.message

  const linePlainLen = text.split(/\r|\r\n|\n/g).length
  const lineHtmlLen = h2p(text).split(/\r|\r\n|\n/g).length
  const lineLen = linePlainLen > lineHtmlLen ? linePlainLen : lineHtmlLen
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(text)

  return (
    <>
      <ListItem key={message.id} alignItems="flex-start">
        <ListItemAvatar
          sx={{ width: 24, height: 24, minWidth: 24 }}
          onMouseOver={e => setAnchorEl(e.currentTarget)}
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
                <Typography variant="body2">{toEmail[0]}</Typography>
              </Grid>
              <Grid item xs="auto">
                <Typography variant="caption">{moment(message.date).format("MMM DD, YYYY hh:mm")}</Typography>
              </Grid>
              <Grid item xs="auto">
                <IconButton size="small">
                  <FontAwesomeIcon icon={faReply} />
                </IconButton>
              </Grid>
              <Grid item xs="auto">
                <IconButton size="small">
                  <FontAwesomeIcon icon={faMessagePlus} />
                </IconButton>
              </Grid>
              <Grid item xs="auto">
                <IconButton size="small">
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </Grid>
            </Grid>
          }
          secondary={
            <>
              {more || lineLen < 4 ?
                <Typography variant="caption" style={{ whiteSpace: "pre-line" }}>
                  {parse(text)}
                </Typography>
                : <LinesEllipsis
                  text={isHtml ? h2p(text) : text}
                  maxLine={4}
                  ellipsis=''
                  style={{ whiteSpace: "pre-line", color: '#0009' }}
                />
              }
              {lineLen > 4 &&
                <div style={{ marginTop: "5px" }}>
                  <Link variant="caption" onClick={() => toggleMore(!more)}>{more ? 'Simplify...' : 'More...'}</Link>
                </div>
              }
            </>
          }
        />
      </ListItem>
    </>
  )
}

export default Email;