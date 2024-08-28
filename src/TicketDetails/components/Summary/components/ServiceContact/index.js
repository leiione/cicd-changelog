import React, { useEffect, useMemo, useState } from "react";
import {
  Business,
  CallOutlined,
  Edit,
  ExpandLess,
  ExpandMore,
  FmdGoodOutlined,
  MailOutlined,
  Person,
} from "@mui/icons-material";
import { Button, Collapse, Divider, Grid, IconButton, Typography } from "@mui/material";
import ContactAddressDropdown from "./components/ContactAddressDropdown";
import { formatPhoneNumber, getFormattedAddress } from "utils/formatter";
import { includes, sortBy } from "lodash";
import SiteContactDropdown from "./components/SiteContactDropdown";
import ProgressButton from "Common/ProgressButton";
import { GET_SITE_CONTACTS } from "TicketDetails/TicketGraphQL";
import { useQuery } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { setCardPreferences } from "config/store";

const ServiceContact = (props) => {
  const dispatch = useDispatch();
  const summaryCard = useSelector(state => state.summaryCard);
  const preferences = summaryCard ? summaryCard.subComponent : {}

  const { ticket, updateTicket, isSubmitting } = props
  const { infrastructure = {} } = ticket
  const [onEditMode, setEditMode] = useState(false);
  const isSubscriber = ticket.category_type === "SUBSCRIBER"

  const variables = ticket.category_type === "INFRASTRUCTURE" ? { location_id: ticket.location_id } : { equipment_id: ticket.equipment_id }

  const { loading: cLoading, error: cError, data: cData } = useQuery(GET_SITE_CONTACTS, {
    variables,
    fetchPolicy: "network-only",
    skip: !onEditMode || isSubscriber || (ticket.category_type === "INFRASTRUCTURE" ? !ticket.location_id : !ticket.equipment_id),
  })

  const [selectedContact, setSelectedContact] = React.useState({ // for non-SUBSCRIBER tickets
    ...infrastructure,
    value: ticket.site_contact_id,
    label: infrastructure ? `${infrastructure.first_name} ${infrastructure.last_name}` : '',
  });

  const contact = useMemo(() => {
    let contact = (ticket.subscriber && ticket.subscriber.customer_detail) ? { ...ticket.subscriber, ...ticket.subscriber.customer_detail } : {}
    if (isSubscriber) {
      contact = {
        ...contact,
        phone: ticket.ticket_contact_numbers ? ticket.ticket_contact_numbers.split(",") : [],
        email: ticket.ticket_contact_email,
      }
    } else if (selectedContact) {
      contact = {
        ...selectedContact,
        phone: selectedContact.phone_numbers ? sortBy(selectedContact.phone_numbers.filter(x => includes(["home", "work"], x.type)), ['type'])
          .map(phone => formatPhoneNumber(phone.number)) : [],
        email: selectedContact.email_addresses ? selectedContact.email_addresses.map(mail => mail.email) : ""
      }
    }
    return contact
  }, [ticket, isSubscriber, selectedContact])

  const contactAddress = ticket.address ? ticket.address : getFormattedAddress(contact, 'main')
  const [selectedAddress, setSelectedAddress] = React.useState(contactAddress); // for SUBSCRIBER tickets

  useEffect(() => {
    if (selectedAddress !== contactAddress) {
      setSelectedAddress(contactAddress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactAddress, onEditMode])

  useEffect(() => {
    if (selectedContact.id !== ticket.site_contact_id && !isSubscriber && infrastructure) {
      setSelectedContact({ value: ticket.site_contact_id, label: `${infrastructure.first_name} ${infrastructure.last_name}`, ...infrastructure })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.site_contact_id, onEditMode])

  const handleCollapse = () => {
    dispatch(setCardPreferences({
      card: "summaryCard",
      preferences: {
        ...summaryCard,
        subComponent: {
          ...preferences,
          service: !preferences.service
        }
      }
    }))
  };

  const onSaveContact = async () => {
    let toUpdate = { address: selectedAddress };
    if (!isSubscriber) {
      toUpdate = { site_contact_id: selectedContact.value, address: selectedAddress };
    }
    await updateTicket({ ticket_id: ticket.ticket_id, ...toUpdate });
    setTimeout(() => { setEditMode(false) }, 500); // so value wont change
  }

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <IconButton onClick={handleCollapse} className="p-2 text-muted">
          {preferences.service ? (
            <ExpandMore className="mr-1" />
          ) : (
            <ExpandLess className="mr-1" />
          )}
          <Typography variant="body1">
            Service Contact
          </Typography>
        </IconButton>
        {preferences.service &&
          <IconButton style={{ padding: 0, marginBottom: "5px" }} onClick={() => setEditMode(!onEditMode)}>
            <Edit className="text-muted f-18" />
          </IconButton>
        }
      </Grid>
      <Grid item xs={12}>
        <Collapse in={preferences.service}  className="ml-3 pl-3 position-relative">
          <Grid container spacing={1}>
            {onEditMode && !isSubscriber &&
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  {selectedContact.value > 0 ? selectedContact.label : "Choose Contact"}
                  <SiteContactDropdown
                    loading={cLoading}
                    error={cError}
                    data={cData}
                    selectedContact={selectedContact}
                    setSelectedContact={setSelectedContact}
                  />
                </Typography>
              </Grid>
            }
            {contact.main_company &&
              <Grid item xs={12} >
                <Typography variant="subtitle1">
                  <Business className="text-muted f-20" style={{ marginRight: 5 }} /> {contact.main_company}
                </Typography>
              </Grid>
            }
            {contact.first_name &&
              <Grid item xs={12} >
                <Typography variant="subtitle1">
                  <Person className="text-success f-20" style={{ marginRight: 5 }} /> {`${contact.first_name} ${contact.last_name}`}
                </Typography>
              </Grid>
            }
            <Grid item xs={12} >
              <Typography variant="subtitle1">
                <FmdGoodOutlined className="text-muted f-20" style={{ marginRight: 5 }} /> {selectedAddress}
                {onEditMode &&
                  <ContactAddressDropdown
                    ticket={ticket}
                    selectedAddress={selectedAddress}
                    setSelectedAddress={setSelectedAddress}
                    customer={contact}
                    customerAddress={contactAddress}
                    cLoading={cLoading}
                    cError={cError}
                    cData={cData}
                  />}
              </Typography>
            </Grid>
            {contact.phone && contact.phone.length > 0 &&
              <Grid item xs={12} >
                <Grid container spacing={2}>
                  <Grid item xs={"auto"} >
                    <Typography variant="subtitle1">
                      <CallOutlined className="text-muted f-20" style={{ marginRight: 8 }} /><span>Home &nbsp; {contact.phone[0]}</span>
                    </Typography>
                  </Grid>
                  {contact.phone.length > 1 && <Grid item xs={"auto"} >
                    <Typography variant="subtitle1"><span>Work &nbsp; {contact.phone[1]}</span></Typography>
                  </Grid>
                  }
                </Grid>
              </Grid>
            }
            {contact.email && <Grid item xs={12} >
              <Typography variant="subtitle1">
                <MailOutlined className="text-muted f-20" style={{ marginRight: 5 }} /> {contact.email}
              </Typography>
            </Grid>}
            {onEditMode &&
              <Grid item xs={9}>
                <Divider />
                <div className="text-right">
                  <ProgressButton
                    color="primary"
                    size="large"
                    style={{ padding: "5px" }}
                    onClick={onSaveContact}
                    disabled={isSubscriber ? selectedAddress === contactAddress : (selectedContact.value === ticket.site_contact_id && selectedAddress === contactAddress)}
                    isSubmitting={isSubmitting}
                  >
                    Save
                  </ProgressButton>
                  <Button className="bg-white text-muted" size="large" style={{ padding: "5px" }} onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </Grid>
            }
          </Grid>
        </Collapse>
      </Grid>
    </Grid >
  );
};
export default ServiceContact;
