import React from "react";
import TablePagination from "@mui/material/TablePagination";
import { List, Typography } from "@mui/material";
import { useMutation } from "@apollo/client";
import { UPDATE_MESSAGE_MUTATION, GET_TICKET_MESSAGES, UPDATE_NOTE_MUTATION, GET_TICKET_NOTES, GET_ACTIVITIES } from "TicketDetails/TicketGraphQL";
import Note from "./components/Note";
import Email from "./components/Email";
import SMS from "./components/SMS";
import ErrorPage from "components/ErrorPage";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import usePermission from "config/usePermission";

const MessagesTable = (props) => {
  const { messages, error, ticket, handleQouteNote, handleReplyEmail, handleReplySMS } = props;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const dispatch = useDispatch()
  const permitDelete = usePermission("ticket_note_message", "flag_delete") 

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
          { query: GET_ACTIVITIES, variables: { ticket_id: ticketId }},
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

  const [updateNote] = useMutation(UPDATE_NOTE_MUTATION)

  const onDeleteNote = async (noteID) => {
    try {
      await updateNote({
        variables: {
          inputNote: { id: noteID, ticket_id: ticket.ticket_id },
        },
        refetchQueries: [
          { query: GET_TICKET_NOTES, variables: { ticket_id: ticket.ticket_id } },
          { query: GET_ACTIVITIES, variables: { ticket_id: ticket.ticket_id }},
        ],
      }).finally(() => {
        dispatch(showSnackbar({ message: "Note deleted successfully", severity: "success" }))
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

  // sort messages by date
  let messageList = messages.length > 0 ? [...messages].sort((a, b) => new Date(b.date_added) - new Date(a.date_added)) : []
  messageList = messages.length > 0 ? messageList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : []

  return (
    <div>
      <List 
  className={`messages-list-wrapper paper-height-500 ${messageList.length > 0 ? "overflow-y-auto" : ""}`} 
  style={messageList.length === 0 ? { textAlign: "center", overflow: "hidden" } : {}}
>
  {messageList.length > 0 ? (
    messageList.map((message) => {
      if (message.note_id > 0) {
        return (
          <Note 
            key={message.note_id} 
            message={message} 
            onDeleteNote={onDeleteNote} 
            handleQouteNote={handleQouteNote} 
          />
        );
      }
      switch (message.integration_id) {
        case 1:
          return (
            <Email 
              key={message.id} 
              permitDelete={permitDelete} 
              message={message} 
              onDeleteMessage={onDeleteMessage} 
              handleQouteNote={handleQouteNote} 
              handleReplyEmail={handleReplyEmail} 
            />
          );
        case 3:
          return (
            <SMS 
              key={message.id} 
              permitDelete={permitDelete} 
              message={message} 
              handleQouteNote={handleQouteNote} 
              onDeleteMessage={() => onDeleteMessage(message.id, message.ticket_id)} 
              handleReplySMS={handleReplySMS} 
            />
          );
        default:
          return null; // via FB, etc.
      }
    })
  ) : (
    <Typography variant="body2" className="text-muted">No message available.</Typography>
  )}
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