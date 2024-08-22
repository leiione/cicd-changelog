import React from "react";
import TablePagination from "@mui/material/TablePagination";
import { List } from "@mui/material";

import Note from "./components/Note";
import { Email } from "@mui/icons-material";
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
      <List className="overflow-y-auto paper-height-500">
        {messages.map((message) => {
          switch (message.type) {
            case 'email':
              return <Email message={message} />
            case 'sms':
              return <SMS message={message} />
            default:
              return <Note message={message} />
          }
        })}
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
