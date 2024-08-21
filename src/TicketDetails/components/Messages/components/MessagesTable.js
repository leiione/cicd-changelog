import React from "react";
import { data } from "./helper";

import TablePagination from "@mui/material/TablePagination";
import {
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNote, faTrash } from "@fortawesome/pro-light-svg-icons";
const MessagesTable = (props) => {
  const [page, setPage] = React.useState(2);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <List>
        {data.map((message) => (
          <ListItem key={message.id} alignItems="start">
            <ListItemAvatar>
              <FontAwesomeIcon icon={faNote} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Grid container className="align-items-center">
                  <Grid item xs>
                    <Typography variant="body2">{message.sender}</Typography>
                  </Grid>
                  <Grid item xs="auto">
                    <Typography variant="caption">{message.time}</Typography>
                  </Grid>
                  <Grid item xs="auto">
                    <IconButton size="small">
                      <FontAwesomeIcon icon={faTrash} />
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
                    <Typography variant="body1">{message.text}</Typography>
                  </div>
                  {message.text}
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
      <TablePagination
        component="div"
        count={100}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};
export default MessagesTable;
