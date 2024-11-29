import React, { useEffect, useMemo, useState } from "react";
import {
  Edit,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
// import { Person as PersonIcon, PersonOutline as PersonOutlineIcon } from "@mui/icons-material"
import {
  Button,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import ContactAddressDropdown from "./components/ContactAddressDropdown";
import { formatPhoneNumber, getFormattedAddress } from "utils/formatter";
import { includes, sortBy } from "lodash";
import SiteContactDropdown from "./components/SiteContactDropdown";
import ProgressButton from "Common/ProgressButton";
import { GET_SITE_CONTACTS } from "TicketDetails/TicketGraphQL";
import { useQuery } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { setCardPreferences } from "config/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildings, faEnvelope, faLocationDot, faPhone } from "@fortawesome/pro-regular-svg-icons";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faUser as faUserOutline } from '@fortawesome/free-regular-svg-icons'; // Import the outline icon


const ServiceContact = (props) => {
  const dispatch = useDispatch();
  const summaryCard = useSelector((state) => state.summaryCard);
  const preferences = summaryCard ? summaryCard.subComponent : {};

  const { ticket, updateTicket, isSubmitting, selectedAddress, setSelectedAddress } = props;
  const { infrastructure = {} } = ticket;
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

  const [selectedContact, setSelectedContact] = React.useState({
    // for non-SUBSCRIBER tickets
    ...infrastructure,
    value: ticket.site_contact_id,
    label: infrastructure
      ? `${infrastructure.first_name} ${infrastructure.last_name}`
      : "",
  });

  const contact = useMemo(() => {
    let contact =
      ticket.subscriber && ticket.subscriber.customer_detail
        ? { ...ticket.subscriber, ...ticket.subscriber.customer_detail }
        : {};
    if (isSubscriber) {
      contact = {
        ...contact,
        phone: ticket.ticket_contact_numbers
          ? ticket.ticket_contact_numbers.split(",")
          : [],
        email: ticket.ticket_contact_email,
      };
    } else if (selectedContact) {
      contact = {
        ...selectedContact,
        phone: selectedContact.phone_numbers
          ? sortBy(
              selectedContact.phone_numbers.filter((x) =>
                includes(["home", "work"], x.type)
              ),
              ["type"]
            ).map((phone) => formatPhoneNumber(phone.number))
          : [],
        email: selectedContact.email_addresses
          ? selectedContact.email_addresses.map((mail) => mail.email)
          : "",
      };
    }
    return contact;
  }, [ticket, isSubscriber, selectedContact]);

  const contactAddress = ticket.address
    ? ticket.address
    : getFormattedAddress(contact, "main");

  useEffect(() => {
    if (selectedAddress !== contactAddress) {
      setSelectedAddress(contactAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactAddress]);

  useEffect(() => {
    if (
      selectedContact.id !== ticket.site_contact_id &&
      !isSubscriber &&
      infrastructure
    ) {
      setSelectedContact({
        value: ticket.site_contact_id,
        label: `${infrastructure.first_name} ${infrastructure.last_name}`,
        ...infrastructure,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.site_contact_id, onEditMode]);

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

  const onSaveContact = async () => {
    let toUpdate = { address: selectedAddress };
    if (!isSubscriber) {
      toUpdate = {
        site_contact_id: selectedContact.value,
        address: selectedAddress,
      };
    }
    await updateTicket({ ticket_id: ticket.ticket_id, ...toUpdate });
    setTimeout(() => {
      setEditMode(false);
    }, 500); // so value wont change
  };

  const getPaymentStatusIconClass = (payment_status) => {
    switch (payment_status) {
      case 1:
        return "text-success"
      case 2:
        return "text-warning"
      case 4:
        return "text-danger"
      case 8:
        return "text-danger"
      case 9:
        return "text-primary"
      case 10:
      case 20:
      return "text-muted"
      default:
        return "text-light"
    }
  }

  const getPaymentStatusIcon = (payment_status) => {
    if (payment_status === 8) {
        return faUserOutline; // Return the outline icon for payment_status 8
    }
    return faUser; // Return the default solid icon for other statuses
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
          <Grid container spacing={1}>
            {onEditMode && !isSubscriber && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  {selectedContact.value > 0
                    ? selectedContact.label
                    : "Choose Contact"}
                  <SiteContactDropdown
                    loading={cLoading}
                    error={cError}
                    data={cData}
                    selectedContact={selectedContact}
                    setSelectedContact={setSelectedContact}
                  />
                </Typography>
              </Grid>
            )}
            {contact.main_company && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <FontAwesomeIcon  icon={faBuildings}className="fa-fw text-muted f-16 mr-2" />
                  {contact.main_company}
                </Typography>
              </Grid>
            )}
            {contact.first_name && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                <FontAwesomeIcon
                    icon={getPaymentStatusIcon(ticket.payment_status)}
                    className={`fa-fw f-16 mr-2 ${getPaymentStatusIconClass(ticket.payment_status)}`}
                    style={{ fontSize: '2rem' }} // Increase icon size
                />
                  {/* {getStatusIcon(ticket.payment_status)} */}
                  {`${contact.first_name} ${contact.last_name}`}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="subtitle1">
              <FontAwesomeIcon icon={faLocationDot} className="fa-fw text-muted f-16 mr-2"/>
                {selectedAddress}
                {onEditMode && (
                  <ContactAddressDropdown
                    ticket={ticket}
                    selectedAddress={selectedAddress}
                    setSelectedAddress={setSelectedAddress}
                    customer={contact}
                    customerAddress={contactAddress}
                    cLoading={cLoading}
                    cError={cError}
                    cData={cData}
                  />
                )}
              </Typography>
            </Grid>
            {contact.phone && contact.phone.length > 0 && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={"auto"}>
                    <Typography variant="subtitle1">
                    <FontAwesomeIcon icon={faPhone} className="fa-fw text-muted f-16 mr-2"/>
                      <span>Home &nbsp; {contact.phone[0]}</span>
                    </Typography>
                  </Grid>
                  {contact.phone.length > 1 && (
                    <Grid item xs={"auto"}>
                      <Typography variant="subtitle1">
                        <span>Work &nbsp; {contact.phone[1]}</span>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}
            {contact.email && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                <FontAwesomeIcon icon={faEnvelope} className="fa-fw text-muted f-16 mr-2"/>
                  {contact.email}
                </Typography>
              </Grid>
            )}
            {onEditMode && (
              <Grid item xs={9}>
                <Divider />
                <div className="text-right">
                  <ProgressButton
                    color="primary"
                    size="large"
                    style={{ padding: "5px" }}
                    onClick={onSaveContact}
                    disabled={
                      isSubscriber
                        ? selectedAddress === contactAddress
                        : selectedContact.value === ticket.site_contact_id &&
                          selectedAddress === contactAddress
                    }
                    isSubmitting={isSubmitting}
                  >
                    Save
                  </ProgressButton>
                  <Button
                    className="bg-white text-muted"
                    size="large"
                    style={{ padding: "5px" }}
                    onClick={() => {
                      setEditMode(false)
                      if (selectedAddress !== contactAddress) {
                        setSelectedAddress(contactAddress);
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  );
};
export default ServiceContact;
