import React from "react";
import TablePagination from "@mui/material/TablePagination";
import { List, Typography } from "@mui/material";

import Note from "./components/Note";
import Email from "./components/Email";
import SMS from "./components/SMS";

const MessagesTable = (props) => {
  const { messages } = props;
  const [page, setPage] = React.useState(0);
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
      <List className="overflow-y-auto paper-height-500" style={messages.length === 0 ? { textAlign: "center" } : {}}>
        {messages.length > 0 ? messages.map((message) => {
          switch (message.integration_id) {
            case 1:
              return <Email message={message} />
            case 3:
              return <SMS message={message} />
            default:
              return <Note message={message} />
          }
        })
          : <Typography variant="caption">No message available.</Typography>
        }
      </List>
      <TablePagination
        component="div"
        count={messages.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};
export default MessagesTable;
