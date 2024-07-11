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
import { formatPhoneNumber, getFormattedAddress, getFormattedPGAddress } from "utils/formatter";
import { includes, sortBy } from "lodash";
import SiteContactDropdown from "./components/SiteContactDropdown";

const ServiceContact = (props) => {
  const { ticket, updateTicket } = props
  const { infrastructure = {} } = ticket
  const isSubscriber = ticket.category_type === "SUBSCRIBER"

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

  let contactAddress = ticket.address ? ticket.address : getFormattedAddress(contact, 'main')
  if (!isSubscriber && selectedContact && selectedContact.address) {
    contactAddress = getFormattedPGAddress(selectedContact.address)
  }

  const [expandCollapse, setExpandCollapse] = useState(false);
  const [onEditMode, setEditMode] = useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState(contactAddress); // for SUBSCRIBER tickets

  useEffect(() => {
    if (selectedAddress !== contactAddress) {
      setSelectedAddress(contactAddress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactAddress, onEditMode])

  useEffect(() => {
    if (selectedContact.id !== ticket.site_contact_id && !isSubscriber) {
      setSelectedContact({ value: ticket.site_contact_id, label: `${infrastructure.first_name} ${infrastructure.last_name}`, ...infrastructure })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.site_contact_id, onEditMode])

  const handleCollapse = () => {
    setExpandCollapse(!expandCollapse);
  };

  const onSaveContact = async () => {
    let toUpdate = { address: selectedAddress };
    if (!isSubscriber) {
      toUpdate = { site_contact_id: selectedContact.value, address: getFormattedPGAddress(selectedContact.address) };
    }
    await updateTicket({ ticket_id: ticket.ticket_id, ...toUpdate });
    setTimeout(() => { setEditMode(false) }, 500); // so value wont change
  }

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <IconButton onClick={handleCollapse} className="p-2 text-muted">
          {expandCollapse ? (
            <ExpandMore className="mr-1" />
          ) : (
            <ExpandLess className="mr-1" />
          )}
          <Typography variant="subtitle1" className="text-muted">
            Service Contact
          </Typography>
        </IconButton>
        {expandCollapse &&
          <IconButton style={{ padding: 0, marginBottom: "5px" }} onClick={() => setEditMode(!onEditMode)}>
            <Edit className="text-muted f-18" />
          </IconButton>
        }
      </Grid>
      <Grid item xs={12}>
        <Collapse in={expandCollapse} style={{ paddingLeft: "25px", position: "relative" }}>
          <Grid container spacing={1}>
            {onEditMode && !isSubscriber &&
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  {selectedContact.value > 0 ? selectedContact.label : "Choose Contact"}
                  <SiteContactDropdown ticket={ticket} selectedContact={selectedContact} setSelectedContact={setSelectedContact} />
                </Typography>
              </Grid>
            }
            <Grid item xs={12} >
              <Typography variant="subtitle1">
                <Business className="text-muted f-20" style={{ marginRight: 5 }} /> {contact.main_company || "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} >
              <Typography variant="subtitle1">
                <Person className="text-success f-20" style={{ marginRight: 5 }} /> {contact.first_name ? `${contact.first_name} ${contact.last_name}` : "-"}
              </Typography>
            </Grid>
            <Grid item xs={12} >
              <Typography variant="subtitle1">
                <FmdGoodOutlined className="text-muted f-20" style={{ marginRight: 5 }} /> {selectedAddress}
                {onEditMode && isSubscriber && <ContactAddressDropdown selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} customer={contact} customerAddress={contactAddress} />}
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
                  <Button
                    color="primary"
                    size="large"
                    style={{ padding: "5px" }}
                    onClick={onSaveContact}
                    disabled={selectedAddress === contactAddress && selectedContact.value === ticket.site_contact_id}
                  >
                    Save
                  </Button>
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
