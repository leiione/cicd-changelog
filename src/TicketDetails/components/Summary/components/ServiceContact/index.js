import React, { useMemo, useState } from "react";
import {
  Edit,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import {
  Button,
  Collapse,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { GET_SITE_CONTACTS } from "TicketDetails/TicketGraphQL";
import { useQuery } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { setCardPreferences } from "config/store";
import EditServiceContact from "./components/EditServiceContact";

const ServiceContact = (props) => {
  const dispatch = useDispatch();
  const summaryCard = useSelector((state) => state.summaryCard);
  const preferences = summaryCard ? summaryCard.subComponent : {};

  const { ticket, updateTicket } = props;
  const [onEditMode, setEditMode] = useState(false);
  const isSubscriber = ticket.category_type === "SUBSCRIBER";

  const variables =
    ticket.category_type === "INFRASTRUCTURE"
      ? { location_id: ticket.location_id }
      : { equipment_id: ticket.equipment_id };

  const {
    loading: cLoading,
    error: cError,
    data: cData,
  } = useQuery(GET_SITE_CONTACTS, {
    variables,
    fetchPolicy: "network-only",
    skip:
      !onEditMode ||
      isSubscriber ||
      (ticket.category_type === "INFRASTRUCTURE"
        ? !ticket.location_id
        : !ticket.equipment_id),
  });

  const contact = useMemo(() => {
    let contact = ticket.subscriber && ticket.subscriber.customer_details
      ? { ...ticket.subscriber, ...ticket.subscriber.customer_details }
      : {};

    if (!isSubscriber && cData && cData.serviceContacts) {
      let phones = []
      let emails = []
      cData.serviceContacts.forEach((item, index) => {
        if (ticket.site_contact_id === item.id || (!ticket.site_contact_id && index === 0)) {
          contact.last_name = item.last_name;
          contact.first_name = item.first_name;
          contact.main_company = item.main_company;
        }
        phones = item.phone_numbers && item.phone_numbers.length > 0 ? [...phones, ...item.phone_numbers] : phones
        emails = item.email_addresses && item.email_addresses.length > 0 ? [...emails, ...item.email_addresses] : emails
      })
      contact.phone_numbers = phones
      contact.email_addresses = emails
    }
    return contact;
  }, [ticket, isSubscriber, cData]);

  const handleCollapse = () => {
    dispatch(
      setCardPreferences({
        card: "summaryCard",
        preferences: {
          ...summaryCard,
          subComponent: {
            ...preferences,
            service: !preferences.service,
          },
        },
      })
    );
  };

  return (
    <Grid container spacing={0} alignItems="center">
      <Grid item xs="auto">
        <Button onClick={handleCollapse} className="text-muted ml-0">
          {preferences.service ? (
            <ExpandMore className="mr-1" />
          ) : (
            <ExpandLess className="mr-1" />
          )}
          <Typography variant="body1">Service Contact</Typography>
        </Button>
      </Grid>
      <Grid item xs="auto">
        {preferences.service && (
          <IconButton
            size="small"
            color="primary"
            onClick={() => setEditMode(!onEditMode)}
          >
            <Edit />
          </IconButton>
        )}
      </Grid>
      <Grid item xs={12}>
        <Collapse
          in={preferences.service}
          className="ml-3 pl-3 position-relative"
        >
          <Grid container spacing={2}>
            <EditServiceContact
              onEditMode={onEditMode}
              setEditMode={setEditMode}
              isSubscriber={isSubscriber}
              cLoading={cLoading}
              cError={cError}
              cData={cData}
              contact={contact}
              ticket={ticket}
              updateTicket={updateTicket}
            />
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  );
};
export default ServiceContact;
