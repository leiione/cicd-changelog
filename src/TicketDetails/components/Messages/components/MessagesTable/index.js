import React from "react";
import TablePagination from "@mui/material/TablePagination";
import { List, Typography } from "@mui/material";
import { useMutation } from "@apollo/client";
import { UPDATE_MESSAGE_MUTATION, GET_TICKET_MESSAGES } from "TicketDetails/TicketGraphQL";
import Note from "./components/Note";
import Email from "./components/Email";
import SMS from "./components/SMS";
import ErrorPage from "components/ErrorPage";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";

const MessagesTable = (props) => {
  const { messages, error } = props;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const dispatch = useDispatch()

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [updateMessage] = useMutation(UPDATE_MESSAGE_MUTATION)

  const onDeleteMessage = async (messageId, ticketId) => {
    try {
      await updateMessage({
        variables: {
          input_message: { id: messageId },
        },
        refetchQueries: [
          { query: GET_TICKET_MESSAGES, variables: { ticket_id: ticketId } },
        ],
      }).finally(() => {
        dispatch(showSnackbar({ message: "Message deleted successfully", severity: "success" }))
      });
    } catch (error) {
      const errorMessage = error.message.replace("GraphQL error: ", "");
      dispatch(
        showSnackbar({
          message: errorMessage,
          severity: "error",
        })
      );
    }
  };

  if (error) return <ErrorPage error={error} />;

  return (
    <div>
      <List className="overflow-y-auto paper-height-500" style={messages.length === 0 ? { textAlign: "center" } : {}}>
        {messages.length > 0 ? messages.map((message) => {
          if (message.note_id > 0) {
            return <Note message={message} />
          }
          switch (message.integration_id) {
            case 1:
              return <Email message={message} onDeleteMessage={onDeleteMessage}/>
            case 3:
              return <SMS message={message} onDeleteMessage={() => onDeleteMessage(message.id, message.ticket_id)} />
            default:
              return null // via FB, etc.
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