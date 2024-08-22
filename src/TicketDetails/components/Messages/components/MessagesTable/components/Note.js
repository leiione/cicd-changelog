import React from "react";
import {
  Grid,
  IconButton,
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

const Note = props => {
  const { message } = props

  return (
    <ListItem key={message.id} alignItems="flex-start">
      <ListItemAvatar sx={{ width: 24, height: 24, minWidth: 24 }}>
        <FontAwesomeIcon icon={faNote} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Grid container spacing={1} className="align-items-center mb-1">
            <Grid item xs>
              <Typography variant="body2">{message.to_email}</Typography>
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
          <React.Fragment>
            <div className="bg-lightest p-2">
              <Typography variant="body1">{message.message}</Typography>
            </div>
            {message.message}
          </React.Fragment>
        }
      />
    </ListItem>
  )
}

export default Note;