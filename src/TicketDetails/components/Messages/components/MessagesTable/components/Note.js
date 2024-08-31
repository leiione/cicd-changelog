import React from "react";
import {
  Grid,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMessagePlus,
  faNote,
  faTrash,
} from "@fortawesome/pro-light-svg-icons";
import { faReply } from "@fortawesome/free-solid-svg-icons";
import moment from "moment-timezone";
import LinesEllipsis from "react-lines-ellipsis";
import h2p from "html2plaintext"
import parse from 'html-react-parser';


const Note = props => {
  const { message } = props
  const [more, toggleMore] = React.useState(false)
  const lineLen = message.content ? message.content.split(/\r|\r\n|\n/g).length : 1
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(message.content)


  return (
    <ListItem key={message.note_id} alignItems="flex-start">
      <ListItemAvatar sx={{ width: 24, height: 24, minWidth: 24 }}>
        <FontAwesomeIcon icon={faNote} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Grid container spacing={1} className="align-items-center mb-1">
            <Grid item xs>
              <Typography variant="subtitle1">{message.appuser_name ? message.appuser_name : ""}</Typography>
            </Grid>
            <Grid item xs="auto">
              <Typography variant="caption">{moment(message.date_added).format("MMM DD, YYYY hh:mm")}</Typography>
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
              {more || lineLen < 6 ?
                <Typography variant="caption" style={{ whiteSpace: "pre-line" }}>
                  {parse(message.content)}
                </Typography>
                : <LinesEllipsis
                  text={isHtml ? h2p(message.content) : message.content}
                  maxLine={5}
                  ellipsis=''
                  style={{ whiteSpace: "pre-line", color: '#0009' }}
                />
              }
              {lineLen > 6 &&
                <div style={{ marginTop: "5px" }}>
                  <Link variant="caption" onClick={() => toggleMore(!more)}>{more ? 'Simplify...' : 'More...'}</Link>
                </div>
              }
            </>
        }
      />
    </ListItem>
  )
}

export default Note;