import React from "react";
import AccordionCard from "../../../Common/AccordionCard";
import HeaderMenuOptions from "components/HeaderMenuOptions";
import Filter from "./components/Filter";
import MessagesTable from "./components/MessagesTable";
import {
  GET_TICKET_MESSAGES,
  GET_TICKET_NOTES,
  TICKET_NOTE_SUBSCRIPTION,
  TICKET_SMS_SUBSCRIPTION,
  TICKET_EMAIL_SUBSCRIPTION
} from "TicketDetails/TicketGraphQL";
import { useQuery, useSubscription } from "@apollo/client";
import Loader from "components/Loader";
import { checkIfCacheExists } from "config/apollo";
import AddMessageButton from "./components/AddMessageButton";
import AddEmailForm from "./components/AddEmailForm";
import AddNoteButton from "./components/AddNoteButton";
import AddNoteForm from "./components/AddNoteForm";
import AddSMSForm from "./components/AddSMSForm";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";

const Messages = (props) => {
  const online = useSelector(state => state.networkStatus?.online || false);
  const { appuser_id, ticket, lablesVisible, messageCardRef, addNew, setAddNew,selectedEmail,setSelectedEmail } = props;
  const [filter, setFilter] = React.useState(["all"]); // Default to "all"
  const [qoutedContent, setQoutedContent] = React.useState(null);
  const [replyMessage, setReplyMessage] = React.useState({});

  // Fetch ticket messages
  const {
    loading,
    error: messageError,
    data,
    client,
    refetch: refetchMessages
  } = useQuery(GET_TICKET_MESSAGES, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: online ? "network-only" : "cache-only",
    skip:
      !ticket.ticket_id || (filter.length === 1 && filter.includes("notes")),
  });
  const cacheExists = checkIfCacheExists(client, {
    query: GET_TICKET_MESSAGES,
    variables: { ticket_id: ticket.ticket_id },
  });

  // Fetch ticket notes
  const {
    loading: loadingNotes,
    error: errorNotes,
    data: dataNotes,
    client: clientNotes,
    refetch: refetchNotes,
  } = useQuery(GET_TICKET_NOTES, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: online ? "network-only" : "cache-only",
    skip: !ticket.ticket_id,
  });
  
  const cacheExistsNotes = checkIfCacheExists(clientNotes, {
    query: GET_TICKET_NOTES,
    variables: { ticket_id: ticket.ticket_id },
  });

  useSubscription(TICKET_NOTE_SUBSCRIPTION, {
    variables: { ticket_id: ticket.ticket_id },
    onData: async ({ data: { data }, client }) => {
      refetchNotes();
    },
  });

  useSubscription(TICKET_SMS_SUBSCRIPTION, {
    variables: { ticket_id: ticket.ticket_id },
    onData: async ({ data: { data }, client }) => {
      refetchMessages();
    },
  });

  useSubscription(TICKET_EMAIL_SUBSCRIPTION, {
    variables: { ticket_id: ticket.ticket_id },
    onData: async ({ data: { data }, client }) => {
      refetchMessages();
    },
  });

  
  
  // Initialize messages array
  let messages = [];

  // Handle merging of data based on selected filters
  const hasMessages = Array.isArray(data?.ticketMessages);
  const hasNotes = Array.isArray(dataNotes?.ticketNotes);

  if (filter.includes("all")) {
    messages = [
      ...(hasMessages ? data.ticketMessages : []),
      ...(hasNotes ? dataNotes.ticketNotes : [])
    ];
  } else {
    messages = [];

    if (filter.includes("notes") && hasNotes) {
      messages.push(...dataNotes.ticketNotes);
    }

    if (filter.includes("message") && hasMessages) {
      messages.push(...data.ticketMessages);
    }
  }

  const handleQouteNote = (from, content) => {
    setQoutedContent({
      from,
      content,
    });
    setAddNew("note");
  };

  const handleReplyEmail = (message, recipient) => {
    if (addNew) {
      // add warning dialog
    }
    const formatMessage = `
      <div class="quote-block">
      <p>${recipient}</p>
      ${message.replace(/\r|\r\n|\n/g, "<br>")}
      </blockquote><p>&nbsp;</p>
    `;
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
    <Box ref={messageCardRef} className="pb-3">

    <AccordionCard
      label="Messages"
      iconButtons={
        <>
          <AddNoteButton setAddNew={setAddNew} lablesVisible={lablesVisible} />
          <AddMessageButton
            setAddNew={setAddNew}
            lablesVisible={lablesVisible}
            error={messageError}
            setSelectedEmail={setSelectedEmail}
            
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
              className="primary-on-hover"
              ticket={ticket}
              handleCancel={handleCancel}
              replyMessage={replyMessage}
              selectedEmail={selectedEmail}
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
            <AddSMSForm
              ticket={ticket}
              handleCancel={handleCancel}
              recipient={replyMessage.recipient}
            />
          )}
          <Filter setFilter={setFilter} />
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
    </Box>
  );
};

export default React.memo(Messages);
