import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import Filter from "./components/Filter";
import MessagesTable from "./components/MessagesTable";
import {
  GET_TICKET_MESSAGES,
  GET_TICKET_NOTES,
} from "TicketDetails/TicketGraphQL";
import { useQuery } from "@apollo/client";
import Loader from "components/Loader";
import { checkIfCacheExists } from "config/apollo";
import AddMessageButton from "./components/AddMessageButton";
import AddEmailForm from "./components/AddEmailForm";
import AddNoteButton from "./components/AddNoteButton";
import AddNoteForm from "./components/AddNoteForm";
import AddSMSForm from "./components/AddSMSForm";

const Messages = (props) => {
  const { appuser_id, ticket, lablesVisible } = props;
  const [filter, setFilter] = React.useState("all");
  const [addNew, setAddNew] = React.useState(null);
  const [qoutedContent, setQoutedContent] = React.useState(null);
  const [replyMessage, setReplyMessage] = React.useState({});

  const {
    loading,
    error: messageError,
    data,
    client,
  } = useQuery(GET_TICKET_MESSAGES, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: "cache-and-network",
    skip: !ticket.ticket_id || filter === "notes",
  });
  const cacheExists = checkIfCacheExists(client, {
    query: GET_TICKET_MESSAGES,
    variables: { ticket_id: ticket.ticket_id },
  });

  const {
    loading: loadingNotes,
    error: errorNotes,
    data: dataNotes,
    client: clientNotes,
  } = useQuery(GET_TICKET_NOTES, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: "cache-and-network",
    skip: !ticket.ticket_id,
  });
  const cacheExistsNotes = checkIfCacheExists(clientNotes, {
    query: GET_TICKET_NOTES,
    variables: { ticket_id: ticket.ticket_id },
  });

  let messages = [];

  const handleQouteNote = (from, content) => {
    setQoutedContent({
      from,
      content,
    });
    setAddNew("note");
  };

  if (
    filter === "notes" &&
    (!loadingNotes || cacheExistsNotes) &&
    dataNotes &&
    dataNotes.ticketNotes
  ) {
    messages = dataNotes.ticketNotes;
  } else if (
    filter === "message" &&
    (!loading || cacheExists) &&
    data &&
    data.ticketMessages
  ) {
    messages = data.ticketMessages;
  } else if (
    filter === "all" &&
    (!loading || cacheExists) &&
    data &&
    data.ticketMessages &&
    (!loadingNotes || cacheExistsNotes) &&
    dataNotes &&
    dataNotes.ticketNotes
  ) {
    messages = [...data.ticketMessages, ...dataNotes.ticketNotes];
  }

  const handleReplyEmail = (message, recipient) => {
    if (addNew) {
      // add warning dialog
    }
    const formatMessage = `<blockquote style="font-size: 8pt;">${message.replace(
      /\r|\r\n|\n/g,
      "<br>"
    )}</blockquote><p>&nbsp;</p>`;
    setAddNew("email");
    setReplyMessage({ message: formatMessage, recipient });
  };

  const handleReplySMS = (message, recipient) => {
    if (addNew) {
      // add warning dialog
    }
    const formatMessage = ``;
    setAddNew("sms");
    setReplyMessage({ message: formatMessage, recipient });
  };

  const handleCancel = () => {
    setAddNew(null);
    setQoutedContent(null);
    setReplyMessage("");
  };

  return (
    <AccordionCard
      label="Messages"
      iconButtons={
        <>
          <AddNoteButton setAddNew={setAddNew} lablesVisible={lablesVisible} />
          <AddMessageButton
            setAddNew={setAddNew}
            lablesVisible={lablesVisible}
            error={messageError}
          />
        </>
      }
      menuOption={
        <HeaderMenuOptions appuser_id={appuser_id} category="Message Card" />
      }
    >
      {(loading || loadingNotes) && (!cacheExists || !cacheExistsNotes) ? (
        <Loader loaderStyle={{ position: "static", textAlign: "center" }} />
      ) : (
        <>
          {addNew === "email" && (
            <AddEmailForm
              ticket={ticket}
              handleCancel={handleCancel}
              replyMessage={replyMessage}
            />
          )}
          {addNew === "note" && (
            <AddNoteForm
              ticket={ticket}
              handleCancel={handleCancel}
              qoutedContent={qoutedContent}
            />
          )}
          {addNew === "sms" && (
            <AddSMSForm ticket={ticket} handleCancel={handleCancel} recipient={replyMessage.recipient} />
          )}
          <Filter filter={filter} setFilter={setFilter} />
          <MessagesTable
            messages={messages}
            error={errorNotes}
            ticket={ticket}
            handleReplyEmail={handleReplyEmail}
            handleReplySMS={handleReplySMS}
            handleQouteNote={handleQouteNote}
          />
        </>
      )}
    </AccordionCard>
  );
};
export default React.memo(Messages);
