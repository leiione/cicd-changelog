import { Button, Grid } from "@mui/material";
import React, { useState } from "react";
import TickeLinkType from "./TicketLinkType";
import LinkedTicketField from "./LinkedTicket.js/LinkedTicketField";
import {
  ADD_LINKED_TICKET_MUTATION,
  GET_LINKED_TICKETS,
  GET_TICKET,
} from "TicketDetails/TicketGraphQL";
import { useMutation } from "@apollo/client";
import { useDispatch } from "react-redux";
import { showSnackbar } from "config/store";
import ProgressButton from "Common/ProgressButton";

function LinkedTicketNew(props) {
  const dispatch = useDispatch();

  const { onCloseLinkedTicket, ticket } = props;
  const [tickeLinkType, setTicketLinkType] = useState({});
  const [userSelectedRows, setUserSelectedRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [addLinkedTicket] = useMutation(ADD_LINKED_TICKET_MUTATION);

  const saveLinkedTicket = async (ticketId, linkedTicketInput) => {
    setSubmitting(true);
    try {
      await addLinkedTicket({
        variables: {
          ticket_id: ticket.ticket_id,
          linked_input: linkedTicketInput,
        },
        refetchQueries: [
          { query: GET_LINKED_TICKETS, variables: { ticket_id: ticketId } },
          { query: GET_TICKET, variables: { id: ticketId } },
        ],
      });
      dispatch(
        showSnackbar({
          message: "Ticket Linked successfully",
          severity: "success",
        })
      );
      setSubmitting(false);
      setUserSelectedRows([])
      setInputValue("")
    } catch (error) {
      const msg = error.message.replace("GraphQL error: ", "");
      dispatch(showSnackbar({ message: msg, severity: "error" }));
      setSubmitting(false);
    }
  };

  const handelSaveLinkedTicket = () => {
    const linkedTicketInput = {
      linked_ticket_id: userSelectedRows.map((row) => row.ticket_id),
      ticket_id: ticket.ticket_id,
      ticket_link_type_id: tickeLinkType.id,
    };
    saveLinkedTicket(ticket.ticket_id, linkedTicketInput);
  };


  return (
    <>
      {" "}
      <Grid container className="mb-5">
        <Grid item xs={2}>
          <TickeLinkType
            tickeLinkType={tickeLinkType}
            setTicketLinkType={setTicketLinkType}
          ></TickeLinkType>
        </Grid>
        <Grid item xs={10}>
          <div className="position-relative">
            <LinkedTicketField
              ticket={ticket}
              setUserSelectedRows={setUserSelectedRows}
              userSelectedRows={userSelectedRows}
              inputValue={inputValue}
              setInputValue={setInputValue}
            ></LinkedTicketField>

            <div
              className="position-absolute right-0 bg-white rounded shadow"
              style={{ bottom: -32 }}
            >
             
              <ProgressButton
                color="primary"
                size="small"
                disableRipple
                onClick={() => {
                  handelSaveLinkedTicket();
                }}
                disabled={userSelectedRows.length === 0}
                isSubmitting={submitting}
              >
                Link
              </ProgressButton>

              <Button
                color="default"
                size="small"
                onClick={onCloseLinkedTicket}
                className="my-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Grid>
      </Grid>
    </>
  );
}

export default LinkedTicketNew;
