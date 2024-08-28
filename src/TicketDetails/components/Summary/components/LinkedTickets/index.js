import React, { useMemo, useState } from "react";
import {
  ExpandLess,
  ExpandMore,
  HighlightOff,
  Link,
} from "@mui/icons-material";
import {
  Button,
  Chip,
  Collapse,
  Grid,
  IconButton,
  MenuItem,
  MenuList,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  GET_LINKED_TICKETS,
  GET_TICKET,
  REMOVE_LINKED_TICKET,
} from "TicketDetails/TicketGraphQL";
import { useMutation, useQuery } from "@apollo/client";
import ErrorPage from "components/ErrorPage";
import { startCase, uniq } from "lodash";
import { getPriorityIcon } from "utils/getPriorityIcon";
import DialogAlert from "components/DialogAlert";
import { useDispatch, useSelector } from "react-redux";
import { setCardPreferences, showSnackbar } from "config/store";
import { preventEvent } from "Common/helper";
import AvatarText from "Common/AvatarText";
import LinkedTicketNew from "./components/LinkedTicketNew";

const LinkedTicketContent = (props) => {
  const dispatch = useDispatch();
  const { ticket_id, loading, error, linkedTickets, handleOpenTicket } = props;
  const [removeTicketId, setRemoveTicketId] = useState(0);
  const [isSubmitting, setSubmitting] = useState(false);
  const [removeLinkedTicket] = useMutation(REMOVE_LINKED_TICKET);

  if (error) return <ErrorPage error={error} />;
  if (loading)
    return (
      <>
        <Skeleton
          animation="wave"
          style={{ height: 25, backgroundColor: "#efeeee", width: "20%" }}
        />
        <Skeleton
          animation="wave"
          style={{
            height: 50,
            backgroundColor: "#efeeee",
            width: "70%",
            marginTop: "-10px",
          }}
        />
      </>
    );

  const onLinkedTicketClick = (ticket) => {
    handleOpenTicket(ticket);
  };

  const handleRemoveTicket = (event, link_id) => {
    preventEvent(event);
    setRemoveTicketId(link_id);
  };

  const onRemoveTicket = async (event) => {
    if (removeTicketId > 0) {
      setSubmitting(true);
      try {
        await removeLinkedTicket({
          variables: { link_id: removeTicketId },
          refetchQueries: [
            { query: GET_LINKED_TICKETS, variables: { ticket_id } },
            { query: GET_TICKET, variables: { id: ticket_id } },
          ],
        });
        dispatch(
          showSnackbar({
            message: "Ticket updated successfully",
            severity: "success",
          })
        );
        setRemoveTicketId(0);
        setSubmitting(false);
      } catch (error) {
        const msg = error.message.replace("GraphQL error: ", "");
        dispatch(showSnackbar({ message: msg, severity: "error" }));
        setRemoveTicketId(0);
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      {linkedTickets && linkedTickets.length > 0 ? (
        linkedTickets.map((link, index) => (
          <Grid container key={index} spacing={0}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" className="text-muted">
                {startCase(link.linked_tickets[0].option_label)}
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <MenuList>
                {link.linked_tickets.map((item, index) => (
                  <MenuItem
                    key={index}
                    style={{ height: 40 }}
                    onClick={() => onLinkedTicketClick(item)}
                  >
                    <Grid container spacing={1} key={index} alignItems="center">
                      <Grid item xs="auto">
                        <Typography
                          variant="subtitle1"
                          className="text-primary"
                        >
                          {item.ticket_id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" className="text-dark">
                          {item.description}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} className="text-right">
                        <div className="d-inline-flex">
                          <span style={{ margin: "0px 10px" }}>
                            <Tooltip title={item.priority} placement="top">
                              {getPriorityIcon(item.priority)}
                            </Tooltip>
                          </span>
                          {item.technician && (
                            <AvatarText
                              title={item.technician}
                              charCount={1}
                              sx={{
                                width: 16,
                                height: 16,
                                margin: "3px 10px",
                                background: "#4b89ff",
                                fontSize: "11px",
                              }}
                            />
                          )}
                          <Typography variant="subtitle1" className="text-dark">
                            {item.status}
                          </Typography>
                          <IconButton
                            style={{ padding: 0, marginLeft: 15 }}
                            onClick={(e) => handleRemoveTicket(e, item.id)}
                          >
                            <HighlightOff className="f-18" />
                          </IconButton>
                        </div>
                      </Grid>
                    </Grid>
                  </MenuItem>
                ))}
              </MenuList>
            </Grid>
          </Grid>
        ))
      ) : (
        <Typography variant="subtitle1" className="text-muted">
          No Linked Tickets
        </Typography>
      )}
      {removeTicketId > 0 && (
        <DialogAlert
          open={removeTicketId > 0}
          message={<span>Are you sure you want to unlink this ticket?</span>}
          buttonsList={[
            {
              label: "Yes",
              size: "medium",
              color: "primary",
              isProgress: true,
              isSubmitting,
              onClick: onRemoveTicket,
            },
            {
              label: "No",
              size: "medium",
              color: "default",
              disabled: isSubmitting,
              onClick: () => {
                setRemoveTicketId(0);
              },
            },
          ]}
        />
      )}
    </>
  );
};

const LinkedTickets = (props) => {
  const dispatch = useDispatch();
  const { ticket, handleOpenTicket } = props;
  const summaryCard = useSelector((state) => state.summaryCard);
  const preferences = summaryCard ? summaryCard.subComponent : {};

  const [isLinkedTicketDrawerOpen, setIsLinkedTicketDrawerOpen] =
    useState(false);

  const { loading, error, data } = useQuery(GET_LINKED_TICKETS, {
    variables: { ticket_id: ticket.ticket_id },
    fetchPolicy: "network-only",
    skip: !ticket.ticket_id || !preferences.linkedTickets, // fetch only when expanded
  });

  const linkedTickets = useMemo(() => {
    let tickets = [];
    if (!loading && data && data.linkedTickets) {
      const linkTypes = uniq(data.linkedTickets.map((link) => link.type_id)); // group by link type
      for (let type of linkTypes) {
        tickets.push({
          type_id: type,
          linked_tickets: data.linkedTickets.filter(
            (link) => link.type_id === type
          ),
        });
      }
    }
    return tickets;
  }, [loading, data]);

  const handleCollapse = () => {
    dispatch(
      setCardPreferences({
        card: "summaryCard",
        preferences: {
          ...summaryCard,
          subComponent: {
            ...preferences,
            linkedTickets: !preferences.linkedTickets,
          },
        },
      })
    );
  };

  const handleLinkButtonClick = () => {
    setIsLinkedTicketDrawerOpen(!isLinkedTicketDrawerOpen);
  };

  const onCloseLinkedTicketDrawer = () => {
    setIsLinkedTicketDrawerOpen(false);
  };

  return (
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs="auto">
          <Button onClick={handleCollapse} className="text-muted ml-0">
            {preferences.linkedTickets ? (
              <ExpandMore className="mr-1" />
            ) : (
              <ExpandLess className="mr-1" />
            )}
            <Typography variant="body1">Linked Tickets</Typography>
          </Button>
        </Grid>
        <Grid item xs="auto">
          <Chip
            label={ticket.linked_count || 0}
            sx={{height:20, width:20}}
            classes={{label:"p-0"}}
            className="bg-light text-white"
          />
        </Grid>
        {preferences.linkedTickets && (
          <Grid item xs="auto">
            <IconButton
              size="small"
              color="primary"
              onClick={handleLinkButtonClick}
            >
              <Link style={{ transform: "rotate(135deg)" }} />
            </IconButton>
          </Grid>
        )}
      </Grid>
      <Collapse
        in={preferences.linkedTickets}
        className="ml-3 pl-3 position-relative"
      >
        {isLinkedTicketDrawerOpen && (
          <LinkedTicketNew
            ticket={ticket}
            onCloseLinkedTicket={onCloseLinkedTicketDrawer}
          ></LinkedTicketNew>
        )}
        <LinkedTicketContent
          ticket_id={ticket.ticket_id}
          loading={loading}
          error={error}
          linkedTickets={linkedTickets}
          handleOpenTicket={handleOpenTicket}
        />
      </Collapse>
    </>
  );
};
export default LinkedTickets;
